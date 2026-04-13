#!/usr/bin/env python3
"""
Universal FRQ Image Extractor
Extracts visual content (graphs, diagrams, political cartoons, maps) from AP exam PDFs.
Uses PyMuPDF page rendering + text block subtraction to identify visual regions.

Usage:
    python frq_extract_images.py <pdf_path> <output_dir>

Output:
    - Cropped PNG files for each detected visual region
    - image-manifest.json mapping each image to page number and nearby text context
"""

import fitz  # PyMuPDF
from PIL import Image
import io
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

DPI = 150
MIN_REGION_HEIGHT = 80   # minimum px height (at 72 DPI) to count as a visual region
MIN_CROP_PX = 60         # minimum final crop dimension after trimming
MIN_FILE_BYTES = 3000    # minimum PNG file size to keep (< 3KB is almost always noise)
DARK_PIXEL_THRESHOLD = 240  # pixels darker than this count as "content"
MIN_DARK_RATIO = 0.015   # at least 1.5% dark pixels to keep a region


def extract_images(pdf_path, output_dir):
    """
    Extract visual regions from a PDF file.

    Strategy:
    1. Embedded raster images (type=1 blocks) extracted directly
    2. Vector graphics found via vertical gap analysis between text blocks
    3. Full-page capture for pages with content but no structured text
    """
    doc = fitz.open(pdf_path)
    os.makedirs(output_dir, exist_ok=True)

    basename = os.path.splitext(os.path.basename(pdf_path))[0]
    # Sanitize basename for filenames
    basename = basename.replace(' ', '-').lower()

    scale = DPI / 72
    mat = fitz.Matrix(scale, scale)
    manifest = []

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        page_num = page_idx + 1
        blocks = page.get_text("dict")["blocks"]

        text_blocks = [b for b in blocks if b["type"] == 0]
        image_blocks = [b for b in blocks if b["type"] == 1]

        # Render page to PIL image
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")
        page_img = Image.open(io.BytesIO(img_data))

        page_h = page.rect.height
        page_w = page.rect.width

        regions = []  # list of (type_str, pixel_bbox, pdf_bbox)

        # --- Method 1: Embedded raster images ---
        for ib in image_blocks:
            bbox = ib["bbox"]
            w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
            if w > 40 and h > MIN_REGION_HEIGHT:
                px = (
                    int(bbox[0] * scale),
                    int(bbox[1] * scale),
                    int(bbox[2] * scale),
                    int(bbox[3] * scale),
                )
                regions.append(("embedded", px, bbox))

        # --- Method 2: Vertical gap analysis (catches vector graphics) ---
        if text_blocks:
            sorted_tb = sorted(text_blocks, key=lambda b: b["bbox"][1])

            gaps = []
            first_y = sorted_tb[0]["bbox"][1]
            if first_y > MIN_REGION_HEIGHT:
                gaps.append((0, first_y))

            for i in range(len(sorted_tb) - 1):
                bot = sorted_tb[i]["bbox"][3]
                top_next = sorted_tb[i + 1]["bbox"][1]
                if (top_next - bot) > MIN_REGION_HEIGHT:
                    gaps.append((bot, top_next))

            last_bot = sorted_tb[-1]["bbox"][3]
            if (page_h - last_bot) > MIN_REGION_HEIGHT:
                gaps.append((last_bot, page_h))

            for y_start, y_end in gaps:
                px_bbox = (
                    0,
                    int(y_start * scale),
                    int(page_w * scale),
                    int(y_end * scale),
                )
                crop = page_img.crop(px_bbox)
                gray = crop.convert("L")
                pixels = list(gray.tobytes())
                if not pixels:
                    continue
                dark_count = sum(1 for p in pixels if p < DARK_PIXEL_THRESHOLD)
                if dark_count / len(pixels) > MIN_DARK_RATIO:
                    regions.append(("vector", px_bbox, (0, y_start, page_w, y_end)))

        # --- Method 3: Full-page if minimal text ---
        elif not text_blocks:
            raw_text = page.get_text().strip()
            if raw_text or image_blocks:
                px_bbox = (0, 0, page_img.width, page_img.height)
                regions.append(("fullpage", px_bbox, (0, 0, page_w, page_h)))

        # --- Deduplicate overlapping regions ---
        regions = _deduplicate(regions)

        # --- Crop, trim whitespace, save ---
        for i, (rtype, px_bbox, pdf_bbox) in enumerate(regions):
            crop = page_img.crop(px_bbox)

            # Trim whitespace margins with padding
            trimmed = _trim_whitespace(crop, padding=10)
            if trimmed is None:
                continue
            if trimmed.width < MIN_CROP_PX or trimmed.height < MIN_CROP_PX:
                continue

            filename = f"{basename}-p{page_num}-img{i + 1}.png"
            filepath = os.path.join(output_dir, filename)
            trimmed.save(filepath, "PNG")

            # Filter out tiny files (noise)
            if os.path.getsize(filepath) < MIN_FILE_BYTES:
                os.remove(filepath)
                continue

            # Get nearby text for context matching
            nearby = _get_nearby_text(text_blocks, pdf_bbox)

            manifest.append({
                "file": filename,
                "page": page_num,
                "type": rtype,
                "nearby_text": nearby,
                "pdf_bbox": [round(x, 1) for x in pdf_bbox],
            })

    doc.close()

    manifest_path = os.path.join(output_dir, "image-manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    return manifest


def _trim_whitespace(img, padding=10):
    """Trim white margins from a PIL image, returning None if nothing remains."""
    gray = img.convert("L")
    # Threshold: pixels > 245 become white (0), darker become black (255)
    bw = gray.point(lambda x: 0 if x > 245 else 255)
    bbox = bw.getbbox()
    if not bbox:
        return None
    trim = (
        max(0, bbox[0] - padding),
        max(0, bbox[1] - padding),
        min(img.width, bbox[2] + padding),
        min(img.height, bbox[3] + padding),
    )
    return img.crop(trim)


def _deduplicate(regions, overlap_threshold=0.5):
    """Remove regions that overlap significantly with larger ones."""
    if len(regions) <= 1:
        return regions

    def area(px):
        return max(0, px[2] - px[0]) * max(0, px[3] - px[1])

    def overlap_area(a, b):
        x1 = max(a[0], b[0])
        y1 = max(a[1], b[1])
        x2 = min(a[2], b[2])
        y2 = min(a[3], b[3])
        return max(0, x2 - x1) * max(0, y2 - y1)

    # Sort by area descending (keep larger regions)
    sorted_regions = sorted(regions, key=lambda r: area(r[1]), reverse=True)
    kept = []

    for r in sorted_regions:
        r_area = area(r[1])
        if r_area == 0:
            continue
        is_dup = False
        for k in kept:
            ov = overlap_area(r[1], k[1])
            if ov / r_area > overlap_threshold:
                is_dup = True
                break
        if not is_dup:
            kept.append(r)

    return kept


def _get_nearby_text(text_blocks, pdf_bbox, max_chars=120):
    """Get text from blocks closest to the given PDF bounding box."""
    if not text_blocks:
        return ""
    region_y = pdf_bbox[1]
    sorted_by_dist = sorted(text_blocks, key=lambda b: abs(b["bbox"][1] - region_y))

    parts = []
    for tb in sorted_by_dist[:2]:
        for line in tb.get("lines", []):
            for span in line.get("spans", []):
                parts.append(span.get("text", ""))
    text = " ".join(parts).strip()
    return text[:max_chars]


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python frq_extract_images.py <pdf_path> <output_dir>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]

    print(f"Extracting images from: {pdf_path}")
    result = extract_images(pdf_path, output_dir)
    print(f"Extracted {len(result)} image region(s)")
    for item in result:
        print(f"  {item['file']} (p{item['page']}, {item['type']}) — {item['nearby_text'][:60]}")
