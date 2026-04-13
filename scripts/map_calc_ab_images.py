#!/usr/bin/env python3
"""
Map extracted images to Calc AB FRQ JSON files.

This script:
1. Re-runs image extraction on each PDF to collect per-PDF manifests
2. Uses heuristics to determine which FRQ each image belongs to
3. Renames images to {frq_id}-stimulus.png or {frq_id}-{letter}-ref.png
4. Updates JSON files with stimulus_image / reference_image fields

Calc AB PDF page structure:
- Pages 1: cover/boilerplate (skip)
- Pages 2-4 typically: Part A (FRQs 1-3), calculator allowed
- Later pages: Part B (FRQs 4-6), no calculator

FRQ 1-2: calculator allowed (Part A, first ~3 pages after cover)
FRQ 3-6: no calculator (Part B, remaining pages)
"""

import fitz
import json
import os
import re
import sys
import shutil

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

QUESTIONS_DIR = r'C:\Ascendly\content-sources\frq-pdfs\ap-calculus-ab\questions'
IMAGES_DIR = r'C:\Ascendly\public\data\ap-calculus-ab\frq\images'
FRQ_DIR = r'C:\Ascendly\public\data\ap-calculus-ab\frq'

# Map year -> PDF filename
YEAR_PDF_MAP = {
    2005: 'calc 05 frq.pdf',
    2006: 'calc 06 frq.pdf',
    2007: 'calc 07 frq.pdf',
    2008: 'calc 08 frq.pdf',
    2009: 'calc 09 frq.pdf',
    2010: 'calc 2010 frq.pdf',
    2011: 'calc 2011 frq.pdf',
    2012: 'calc 2012 frq.pdf',
    2013: 'calc 2013 frq.pdf',
    2014: 'calc 2014 frq.pdf',
    2015: 'calc 2015 frq.pdf',
    2016: 'calc 2016 frq.pdf',
    2017: 'calc 2017 frq.pdf',
    2018: 'calc ab 2018 frq.pdf',
    2019: 'calc ab 2019 frq.pdf',
    2021: 'Calc AB 2021 frq.pdf',
    2022: 'Calc AB 2022 Frq.pdf',
    2023: 'Calc AB 2023 FRQ.pdf',
    2024: 'Calc AB 2024 FRQ.pdf',
    2025: 'Calc AB 2025 FRQ.pdf',
}

# Known boilerplate-only images to skip (by nearby_text patterns)
BOILERPLATE_PATTERNS = [
    r'^AP\s*®?\s*Calculus',
    r'^\s*CALCULUS AB\s*\n?\s*SECTION II',
    r'^(A GRAPHING CALCULATOR|NO CALCULATOR)',
    r'Free-Response Questions',
    r'Time—\d+ minutes',
]


def is_boilerplate(nearby_text):
    """Determine if an image is just boilerplate (cover, section header)."""
    for pattern in BOILERPLATE_PATTERNS:
        if re.search(pattern, nearby_text, re.IGNORECASE):
            # More specifically skip if ONLY these patterns are present
            # Some boilerplate pages also have question content
            lower = nearby_text.lower()
            has_question_content = any(kw in lower for kw in [
                'figure', 'graph', 'shaded region', 'slope field', 'axes',
                'let r be', 'bounded by', 'the curve', 'function f', 'function g',
                'table', 'velocity', 'rate', 'particle', 'region', 'differential equation',
                'sketch', 'plot', 'draw'
            ])
            if not has_question_content:
                return True
    return False


def get_pdf_page_structure(pdf_path):
    """
    Analyze PDF to determine which pages contain which FRQs.
    Returns dict: {page_num: frq_num}
    """
    doc = fitz.open(pdf_path)
    page_to_frq = {}

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        page_num = page_idx + 1
        text = page.get_text()

        # Detect "Begin your response to QUESTION N" (modern format)
        m = re.search(r'Begin your response to QUESTION\s+(\d+)', text, re.IGNORECASE)
        if m:
            q_num = int(m.group(1))
            page_to_frq[page_num] = q_num
            continue

        # Detect "Part B" section start (means next questions are 4-6)
        if re.search(r'SECTION II.*Part B', text, re.DOTALL | re.IGNORECASE):
            page_to_frq[page_num] = 4  # Part B starts with FRQ 4
            continue

        # Detect "Part A" section (means FRQs 1-3)
        if re.search(r'SECTION II.*Part A', text, re.DOTALL | re.IGNORECASE):
            page_to_frq[page_num] = 1
            continue

        # Detect standalone question number at start of content
        # Match "N." at start of paragraph (question number)
        for q_num in range(1, 7):
            pattern = rf'(?:^|\n)\s*{q_num}\.\s+\w'
            if re.search(pattern, text, re.MULTILINE):
                page_to_frq[page_num] = q_num
                break

        # Also check for explicit "QUESTION N" label
        q_label = re.search(r'QUESTION\s+(\d+)', text, re.IGNORECASE)
        if q_label and page_num not in page_to_frq:
            page_to_frq[page_num] = int(q_label.group(1))

    doc.close()
    return page_to_frq


def assign_frq_to_image(img_info, page_to_frq, year):
    """
    Determine which FRQ an image belongs to based on its page number
    and nearby text content.

    Returns (frq_num, image_type) where image_type is 'stimulus' or a part letter for 'reference'
    """
    page_num = img_info['page']
    nearby = img_info['nearby_text']

    # Check if it's a slope field or axes (reference image for a specific part)
    is_slope_field = bool(re.search(r'slope field|axes provided|sketch|draw.*graph', nearby, re.IGNORECASE))

    # Determine FRQ number from page mapping
    frq_num = page_to_frq.get(page_num)

    if frq_num is None:
        # Try to infer from page number position
        # For most PDFs: page 1 = cover, pages 2-4 = Part A (FRQ 1-3), pages 5+ = Part B (FRQ 4-6)
        pdf_total_pages = max(page_to_frq.keys()) if page_to_frq else 10
        if page_num == 1:
            return None, None  # Cover page
        elif page_num <= 4:
            frq_num = page_num - 1  # rough estimate
        else:
            frq_num = min(page_num - 1, 6)

    # Check nearby text for more specific FRQ identification
    # Look for question number mentions
    for qn in range(1, 7):
        if re.search(rf'\b{qn}\.\s', nearby[:30]):
            frq_num = qn
            break

    if frq_num and 1 <= frq_num <= 6:
        if is_slope_field:
            return frq_num, 'a'  # Most slope fields are part (a)
        else:
            return frq_num, 'stimulus'

    return None, None


def get_year_from_pdf_basename(basename):
    """Extract year from PDF basename (e.g., 'calc-05-frq' -> 2005)."""
    m = re.search(r'(\d{2,4})', basename)
    if not m:
        return None
    y = int(m.group(1))
    if y < 100:
        y += 2000
    return y


def extract_and_map_images_for_year(year, pdf_filename):
    """
    Extract images and map them to FRQ JSON files for one year.
    Returns dict of {frq_id: {stimulus_image: path, parts_refs: {letter: path}}}
    """
    pdf_path = os.path.join(QUESTIONS_DIR, pdf_filename)
    if not os.path.exists(pdf_path):
        print(f"  SKIP {year}: PDF not found")
        return {}

    print(f"\nMapping images for {year}...")

    # Analyze page structure
    page_to_frq = get_pdf_page_structure(pdf_path)
    print(f"  Page->FRQ map: {page_to_frq}")

    # Find existing images for this year
    # The basename was sanitized: spaces -> dashes, lowercase
    basename = os.path.splitext(pdf_filename)[0].replace(' ', '-').lower()
    year_images = []
    for fname in os.listdir(IMAGES_DIR):
        if fname.startswith(basename + '-p') and fname.endswith('.png'):
            # Parse page number from filename
            m = re.search(r'-p(\d+)-img', fname)
            if m:
                page_num = int(m.group(1))
                year_images.append({'file': fname, 'page': page_num})

    if not year_images:
        print(f"  No images found for {year} (basename: {basename})")
        return {}

    print(f"  Found {len(year_images)} images: {[i['file'] for i in year_images]}")

    # Need nearby text - re-read from PDF for context
    doc = fitz.open(pdf_path)
    img_infos = []
    for img in year_images:
        page = doc[img['page'] - 1]
        text_blocks = page.get_text("dict")["blocks"]
        text_str = page.get_text()[:300]  # First 300 chars of page text
        img['nearby_text'] = text_str
        img_infos.append(img)
    doc.close()

    # Filter boilerplate
    frq_images = {}
    for img in img_infos:
        if is_boilerplate(img['nearby_text']):
            print(f"  SKIP (boilerplate): {img['file']}")
            continue

        # Get page-based FRQ assignment
        page_num = img['page']
        frq_num = page_to_frq.get(page_num)

        if frq_num is None:
            print(f"  SKIP (no FRQ mapping for page {page_num}): {img['file']}")
            continue

        # Determine image type (stimulus or reference)
        is_slope_field = bool(re.search(
            r'slope field|axes provided|sketch|draw.*graph|the point.*comma|through the point',
            img['nearby_text'], re.IGNORECASE
        ))

        frq_id = f"calc-ab-{year}-frq-{frq_num}"
        img_type = 'reference' if is_slope_field else 'stimulus'

        if frq_id not in frq_images:
            frq_images[frq_id] = {'stimulus': None, 'references': {}}

        if img_type == 'stimulus' and frq_images[frq_id]['stimulus'] is None:
            frq_images[frq_id]['stimulus'] = img['file']
            print(f"  -> {frq_id} stimulus: {img['file']}")
        elif img_type == 'reference':
            # Default to part 'a' for reference images
            frq_images[frq_id]['references']['a'] = img['file']
            print(f"  -> {frq_id} reference(a): {img['file']}")
        else:
            print(f"  -> {frq_id} (already has stimulus, skipping): {img['file']}")

    return frq_images, basename


def rename_and_update_json(year, frq_images, basename):
    """Rename images to convention and update JSON files."""
    updated_count = 0

    for frq_id, images in frq_images.items():
        json_path = os.path.join(FRQ_DIR, f"{frq_id}.json")
        if not os.path.exists(json_path):
            print(f"  JSON not found: {json_path}")
            continue

        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"  JSON parse error for {json_path}: {e}")
            continue

        changed = False

        # Handle stimulus image
        if images.get('stimulus'):
            old_file = images['stimulus']
            new_file = f"{frq_id}-stimulus.png"
            old_path = os.path.join(IMAGES_DIR, old_file)
            new_path = os.path.join(IMAGES_DIR, new_file)

            if os.path.exists(old_path) and not os.path.exists(new_path):
                shutil.copy2(old_path, new_path)
                print(f"    Renamed {old_file} -> {new_file}")

            if os.path.exists(new_path):
                web_path = f"/data/ap-calculus-ab/frq/images/{new_file}"
                if data.get('stimulus_image') != web_path:
                    data['stimulus_image'] = web_path
                    changed = True

        # Handle reference images
        for letter, ref_file in images.get('references', {}).items():
            old_path = os.path.join(IMAGES_DIR, ref_file)
            new_file = f"{frq_id}-{letter}-ref.png"
            new_path = os.path.join(IMAGES_DIR, new_file)

            if os.path.exists(old_path) and not os.path.exists(new_path):
                shutil.copy2(old_path, new_path)
                print(f"    Renamed {ref_file} -> {new_file}")

            if os.path.exists(new_path):
                web_path = f"/data/ap-calculus-ab/frq/images/{new_file}"
                # Update the part in the JSON
                for part in data['parts']:
                    if part['letter'] == letter and part.get('requires_drawing', False):
                        if part.get('reference_image') != web_path:
                            part['reference_image'] = web_path
                            changed = True

        if changed:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            updated_count += 1
            print(f"    Updated: {json_path}")

    return updated_count


def main():
    """Main function to map all images."""
    all_updated = 0

    for year, pdf_filename in sorted(YEAR_PDF_MAP.items()):
        result = extract_and_map_images_for_year(year, pdf_filename)
        if not result:
            continue

        frq_images, basename = result
        if frq_images:
            updated = rename_and_update_json(year, frq_images, basename)
            all_updated += updated

    print(f"\nDone! Updated {all_updated} JSON files with image references.")


if __name__ == '__main__':
    main()
