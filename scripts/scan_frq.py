#!/usr/bin/env python3
"""
FRQ JSON Quality Auditor
Scans all released FRQ JSON files for text formatting issues from PDF extraction.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Directories to scan
FRQ_DIRS = [
    "C:/Ascendly/public/data/ap-calculus-ab/frq",
    "C:/Ascendly/public/data/ap-chemistry/frq",
    "C:/Ascendly/public/data/ap-world-history/frq",
    "C:/Ascendly/public/data/ap-government/frq",
    "C:/Ascendly/public/data/ap-psychology/frq",
    "C:/Ascendly/public/data/ap-precalculus/frq",
]

issues_found = []

def check_text(text: str, filepath: str, field: str) -> List[Dict]:
    """Check a text string for formatting issues."""
    if not text or not isinstance(text, str):
        return []

    found = []

    # 1. Broken spacing: single letters surrounded by spaces (not math variables)
    # e.g. "re sult" — letters with space that are part of a longer word
    # Look for patterns like "word s word" where 's' is a split character
    # Actually check for sequences like "sub sti tu tion"
    broken_spacing = re.findall(r'\b([a-z]{2,})\s([a-z]{1,3})\s([a-z]{2,})\b', text)
    for match in broken_spacing:
        # Heuristic: if middle piece is 1-2 chars and all lowercase, suspicious
        if len(match[1]) <= 2 and not match[1] in ['of', 'to', 'in', 'at', 'by', 'on', 'as', 'an', 'or', 'if', 'it', 'is', 'be', 'we', 'he', 'me', 'my', 'up', 'do', 'no', 'so', 'go', 'us', 'am', 'vs', 'AP', 'km', 'mg', 'mL', 'pH', 'cm', 'nm', 'eV']:
            found.append({
                'file': filepath,
                'field': field,
                'issue': 'Possible broken spacing',
                'text': f"...{match[0]} {match[1]} {match[2]}..."
            })

    # 2. Chemistry formula garbling: standalone element symbols with space
    # e.g. "H O" (should be H₂O), "CO 2" (should be CO₂), "N O" (N₂O)
    chem_garbled = re.findall(r'\b([A-Z][a-z]?)\s+([A-Z][a-z]?)\b(?!\s*[a-z])', text)
    element_symbols = {'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Ag', 'Au', 'Pb', 'Hg', 'I', 'Br', 'Mn', 'Cr', 'Co', 'Ni'}
    for match in chem_garbled:
        if match[0] in element_symbols and match[1] in element_symbols:
            found.append({
                'file': filepath,
                'field': field,
                'issue': f'Garbled chemistry formula: "{match[0]} {match[1]}" - elements with space',
                'text': f"...{match[0]} {match[1]}..."
            })

    # 3. Common garbled formulas with numbers and spaces
    # e.g. "CO 2", "H 2", "O 2", "N 2"
    chem_num_space = re.findall(r'\b([A-Z][a-z]?\d*)\s+(\d+)\b', text)
    for match in chem_num_space:
        if match[0].rstrip('0123456789') in element_symbols:
            found.append({
                'file': filepath,
                'field': field,
                'issue': f'Garbled formula subscript: "{match[0]} {match[1]}" - number detached from symbol',
                'text': f"...{match[0]} {match[1]}..."
            })

    # 4. Check for garbled formulas like "N2O 5" or "H2 SO4"
    garbled_compound = re.findall(r'([A-Z][a-z]?\d+[A-Z][a-z]?\d*)\s+(\d+)', text)
    for match in garbled_compound:
        found.append({
            'file': filepath,
            'field': field,
            'issue': f'Garbled compound formula: "{match[0]} {match[1]}"',
            'text': f"...{match[0]} {match[1]}..."
        })

    # 5. Check for lines that appear to be merged from PDF line breaks
    # Very long strings with no periods or punctuation
    sentences = text.split('.')
    for sent in sentences:
        if len(sent) > 500 and ' ' in sent:
            # Check if it's suspiciously dense
            words = sent.split()
            avg_word_len = sum(len(w) for w in words) / len(words) if words else 0
            if avg_word_len > 8:  # unusually long average word = merged words
                found.append({
                    'file': filepath,
                    'field': field,
                    'issue': 'Possible merged words (very long words in text)',
                    'text': sent[:200] + '...'
                })

    # 6. Garbled special characters: unicode replacement chars, boxes
    if '\ufffd' in text or '\u25a1' in text or '\u0000' in text:
        found.append({
            'file': filepath,
            'field': field,
            'issue': 'Unicode replacement character or garbled encoding',
            'text': text[:200]
        })

    # 7. Orphaned footnote markers: isolated numbers after text
    orphan_footnotes = re.findall(r'(?<=[a-z.,;])\s*\b([1-9])\b\s*(?=[A-Z])', text)
    for match in orphan_footnotes:
        found.append({
            'file': filepath,
            'field': field,
            'issue': f'Possible orphaned footnote marker: "{match}"',
            'text': text[:100]
        })

    # 8. Double spaces
    if '  ' in text and not text.startswith('  '):
        # Find all instances
        for m in re.finditer(r'  +', text):
            context_start = max(0, m.start()-20)
            context_end = min(len(text), m.end()+20)
            found.append({
                'file': filepath,
                'field': field,
                'issue': 'Double/extra spaces in text',
                'text': f"...{repr(text[context_start:context_end])}..."
            })
            break  # Only report once per field

    # 9. Math notation without KaTeX: x^2, x_1 outside of $...$
    # But check if they're already inside KaTeX
    # Strip KaTeX regions first
    text_no_katex = re.sub(r'\$[^$]+\$', '[KATEX]', text)

    # Check for bare superscripts like "x^2" or "x^n" outside KaTeX
    bare_superscript = re.findall(r'(?<!\$)[a-zA-Z\d]\^[a-zA-Z\d]+(?!\$)', text_no_katex)
    for match in bare_superscript:
        found.append({
            'file': filepath,
            'field': field,
            'issue': f'Bare superscript notation outside KaTeX: "{match}"',
            'text': f"...{match}..."
        })

    # 10. Detect "x 2" pattern where it should be "x²" or "$x^2$"
    # In non-chemistry context
    bare_exp = re.findall(r'\b([a-z])\s+([2-9])\b(?!\s*[a-zA-Z])', text_no_katex)
    for match in bare_exp:
        found.append({
            'file': filepath,
            'field': field,
            'issue': f'Possible broken exponent: "{match[0]} {match[1]}" should be "${{ {match[0]}^{match[1]} }}$"',
            'text': f"...{match[0]} {match[1]}..."
        })

    # 11. Check for sequences of single space-separated letters (garbled words)
    single_letter_seq = re.findall(r'\b([a-z] ){3,}[a-z]\b', text)
    for match in single_letter_seq:
        found.append({
            'file': filepath,
            'field': field,
            'issue': f'Sequence of single letters (garbled word): "{match}"',
            'text': f"...{match}..."
        })

    return found


def extract_text_fields(data: Any, filepath: str) -> List[Tuple[str, str]]:
    """Recursively extract text fields to check from a JSON object."""
    fields = []

    if isinstance(data, dict):
        # Check stimulus
        if 'stimulus' in data and data['stimulus']:
            fields.append((data['stimulus'], 'stimulus'))

        # Check parts
        if 'parts' in data and isinstance(data['parts'], list):
            for i, part in enumerate(data['parts']):
                if isinstance(part, dict):
                    if 'prompt' in part and part['prompt']:
                        fields.append((part['prompt'], f'parts[{i}].prompt'))
                    if 'rubric_criteria' in part and isinstance(part['rubric_criteria'], list):
                        for j, criterion in enumerate(part['rubric_criteria']):
                            if isinstance(criterion, str) and criterion:
                                fields.append((criterion, f'parts[{i}].rubric_criteria[{j}]'))
                            elif isinstance(criterion, dict):
                                for k, v in criterion.items():
                                    if isinstance(v, str) and v:
                                        fields.append((v, f'parts[{i}].rubric_criteria[{j}].{k}'))
                    if 'scoring_notes' in part and part['scoring_notes']:
                        fields.append((part['scoring_notes'], f'parts[{i}].scoring_notes'))

        # Check documents (DBQ)
        if 'documents' in data and isinstance(data['documents'], list):
            for i, doc in enumerate(data['documents']):
                if isinstance(doc, dict):
                    if 'content' in doc and doc['content']:
                        fields.append((doc['content'], f'documents[{i}].content'))
                    if 'source' in doc and doc['source']:
                        fields.append((doc['source'], f'documents[{i}].source'))
                    if 'title' in doc and doc['title']:
                        fields.append((doc['title'], f'documents[{i}].title'))

    return fields


def scan_file(filepath: str) -> List[Dict]:
    """Scan a single JSON file for issues."""
    issues = []

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        issues.append({
            'file': filepath,
            'field': 'FILE',
            'issue': f'Cannot parse JSON: {e}',
            'text': ''
        })
        return issues

    # Only check released FRQs
    if data.get('source') != 'released':
        return []

    # Extract all text fields
    fields = extract_text_fields(data, filepath)

    for text, field_name in fields:
        field_issues = check_text(text, filepath, field_name)
        issues.extend(field_issues)

    return issues


def main():
    all_issues = []
    files_scanned = 0
    released_files = 0

    for frq_dir in FRQ_DIRS:
        if not os.path.exists(frq_dir):
            print(f"WARNING: Directory does not exist: {frq_dir}", file=sys.stderr)
            continue

        print(f"\n=== Scanning {frq_dir} ===", file=sys.stderr)

        json_files = sorted(Path(frq_dir).glob('*.json'))
        for json_file in json_files:
            if json_file.name in ['manifest.json', 'image-manifest.json']:
                continue

            files_scanned += 1

            # Quick check if released
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                if data.get('source') == 'released':
                    released_files += 1
            except:
                pass

            issues = scan_file(str(json_file))
            all_issues.extend(issues)

            if issues:
                print(f"  [{json_file.name}] {len(issues)} issues", file=sys.stderr)

    print(f"\n=== SUMMARY ===", file=sys.stderr)
    print(f"Files scanned: {files_scanned}", file=sys.stderr)
    print(f"Released files: {released_files}", file=sys.stderr)
    print(f"Total issues found: {len(all_issues)}", file=sys.stderr)

    # Output issues as JSON for further processing
    print(json.dumps(all_issues, indent=2))

    return all_issues


if __name__ == '__main__':
    main()
