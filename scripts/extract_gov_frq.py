#!/usr/bin/env python3
"""
AP Government FRQ Image Mapper
Maps extracted chart images to their corresponding FRQ JSON files.

The image extractor already ran and produced images in:
  public/data/ap-government/frq/images/

This script:
1. Renames images to clean names matching the FRQ ID
2. Updates stimulus_image fields in all quantitative_analysis FRQ JSONs

Usage: python extract_gov_frq.py
"""

import json
import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

IMAGES_DIR = r'C:\Ascendly\public\data\ap-government\frq\images'
FRQ_DIR = r'C:\Ascendly\public\data\ap-government\frq'

# Map from extracted image filename → clean target filename → FRQ JSON filename
# All of these are quantitative_analysis FRQs (FRQ #2 in each exam)
IMAGE_MAPPING = [
    # (source_image, clean_name, frq_json_id)
    ('gov-frq-2019-p3-img1.png',       'gov-2019-frq-2.png',         'gov-2019-frq-2'),
    ('gov-frq-set-1-21-p4-img1.png',   'gov-2021-set1-frq-2.png',    'gov-2021-set1-frq-2'),
    ('gov-frq-set-1-22-p4-img1.png',   'gov-2022-set1-frq-2.png',    'gov-2022-set1-frq-2'),
    ('gov-frq-set-1-23-p4-img1.png',   'gov-2023-set1-frq-2.png',    'gov-2023-set1-frq-2'),
    ('gov-frq-set-1-24-p4-img1.png',   'gov-2024-set1-frq-2.png',    'gov-2024-set1-frq-2'),
    ('gov-frq-set-1-25-p4-img1.png',   'gov-2025-set1-frq-2.png',    'gov-2025-set1-frq-2'),
    ('gov-frq-set-2-21-p4-img1.png',   'gov-2021-set2-frq-2.png',    'gov-2021-set2-frq-2'),
    ('gov-frq-set-2-22-p4-img1.png',   'gov-2022-set2-frq-2.png',    'gov-2022-set2-frq-2'),
    ('gov-frq-set-2-23-p4-img1.png',   'gov-2023-set2-frq-2.png',    'gov-2023-set2-frq-2'),
    ('gov-frq-set-2-24-p4-img1.png',   'gov-2024-set2-frq-2.png',    'gov-2024-set2-frq-2'),
    ('gov-frq-set-2-25-p4-img1.png',   'gov-2025-set2-frq-2.png',    'gov-2025-set2-frq-2'),
]


def rename_images():
    """Rename extracted images to clean FRQ-ID-based names."""
    renamed = []
    for src_name, clean_name, frq_id in IMAGE_MAPPING:
        src_path = os.path.join(IMAGES_DIR, src_name)
        dst_path = os.path.join(IMAGES_DIR, clean_name)

        if not os.path.exists(src_path):
            print(f"  WARN: source not found: {src_name}")
            continue

        if os.path.exists(dst_path) and src_path != dst_path:
            os.remove(dst_path)

        shutil.move(src_path, dst_path)
        print(f"  Renamed: {src_name} -> {clean_name}")
        renamed.append((clean_name, frq_id))

    return renamed


def update_frq_json(frq_id, image_filename):
    """Update stimulus_image field in a FRQ JSON file."""
    json_path = os.path.join(FRQ_DIR, f'{frq_id}.json')

    if not os.path.exists(json_path):
        print(f"  WARN: JSON not found: {frq_id}.json")
        return False

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Set the stimulus_image path (web-accessible path)
    image_web_path = f'/data/ap-government/frq/images/{image_filename}'
    data['stimulus_image'] = image_web_path

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"  Updated: {frq_id}.json -> stimulus_image: {image_web_path}")
    return True


def main():
    print("Step 1: Renaming images to clean FRQ-ID-based names...")
    renamed = rename_images()

    print(f"\nStep 2: Updating stimulus_image in FRQ JSONs...")
    for clean_name, frq_id in renamed:
        update_frq_json(frq_id, clean_name)

    print(f"\nDone! Mapped {len(renamed)} images to FRQ JSON files.")


if __name__ == '__main__':
    main()
