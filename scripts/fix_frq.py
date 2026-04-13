#!/usr/bin/env python3
"""
FRQ JSON Text Fixer
Fixes text formatting issues from PDF extraction in released FRQ JSON files.
"""

import json
import os
import re
import sys
from pathlib import Path
from copy import deepcopy

# Directories to scan
FRQ_DIRS = [
    "C:/Ascendly/public/data/ap-calculus-ab/frq",
    "C:/Ascendly/public/data/ap-chemistry/frq",
    "C:/Ascendly/public/data/ap-world-history/frq",
    "C:/Ascendly/public/data/ap-government/frq",
    "C:/Ascendly/public/data/ap-psychology/frq",
    "C:/Ascendly/public/data/ap-precalculus/frq",
]

changes_log = []

def log_change(filepath, field, before, after):
    changes_log.append({
        'file': filepath.split('/')[-1],
        'field': field,
        'before': before[:200],
        'after': after[:200],
    })
    print(f"  FIXED [{field}]")
    print(f"    BEFORE: {before[:120]}")
    print(f"    AFTER:  {after[:120]}")

def fix_text(text: str, filepath: str, field: str) -> str:
    """Apply all fixes to a text string."""
    if not text or not isinstance(text, str):
        return text

    original = text

    # ===========================
    # UNIVERSAL FIXES (all subjects)
    # ===========================

    # 1. Remove (cid:XXX) sequences - PDF character ID artifacts
    # These are often page headers, footers, or garbled content from CID fonts
    text = re.sub(r'\(cid:\d+\)+', '', text)

    # 2. Fix degree sign encoded as (cid:146) - already handled above
    # But also fix other common encodings
    text = text.replace('\x92', "'")  # Windows smart quote
    text = text.replace('\x93', '"')  # Windows smart quote
    text = text.replace('\x94', '"')  # Windows smart quote
    text = text.replace('\x96', '–')  # en dash
    text = text.replace('\x97', '—')  # em dash

    # 3. Fix multiplication sign encoded as ¥
    text = text.replace(' ¥ ', ' × ')
    text = text.replace('¥ 10', '× 10')

    # 4. Remove PDF page headers/footers embedded in text
    # College Board copyright lines
    text = re.sub(r'© \d{4} The College Board[^\n]*\n', '', text)
    text = re.sub(r'Visit the College Board on the Web:[^\n]*\n', '', text)
    text = re.sub(r'GO ON TO THE NEXT PAGE\.[^\n]*\n', '', text)
    text = re.sub(r'-\d+-\s*\n', '', text)
    text = re.sub(r'\d{4} AP[®\u00ae][^\n]*FREE-RESPONSE QUESTIONS\s*\n', '', text)

    # Also handle without newlines (at end of text)
    text = re.sub(r'© \d{4} The College Board\.?.*$', '', text, flags=re.DOTALL)
    text = re.sub(r'Visit the College Board on the Web:.*$', '', text, flags=re.DOTALL)
    text = re.sub(r'\s*GO ON TO THE NEXT PAGE\.\s*$', '', text)
    text = re.sub(r'\s*-\d+-\s*$', '', text)

    # Garbled CID-encoded strings (sequences of (cid:xx) already removed, but leftover spaces)
    text = re.sub(r'\s{3,}', '  ', text)  # Collapse excessive whitespace

    # 5. Fix double spaces that aren't leading
    text = re.sub(r'(?<!\n)  +(?!\n)', ' ', text)

    # ===========================
    # CHEMISTRY-SPECIFIC FIXES
    # ===========================

    is_chem = 'ap-chemistry' in filepath
    is_calc = 'ap-calculus' in filepath or 'ap-precalculus' in filepath

    if is_chem:
        # Fix equilibrium constants with spaces
        # K a -> $K_a$, K b -> $K_b$, K sp -> $K_{sp}$, K eq -> $K_{eq}$, K w -> $K_w$
        # Only when not already in KaTeX

        # Pattern: K followed by space and subscript word
        text = re.sub(r'\bK\s+sp\b', r'$K_{sp}$', text)
        text = re.sub(r'\bK\s+eq\b', r'$K_{eq}$', text)
        text = re.sub(r'\bpK\s+a\b', r'$pK_a$', text)
        text = re.sub(r'\bpK\s+b\b', r'$pK_b$', text)
        text = re.sub(r'\bK\s+a\b(?!\s*=?\s*\d)', r'$K_a$', text)
        text = re.sub(r'\bK\s+b\b(?!\s*=?\s*\d)', r'$K_b$', text)
        text = re.sub(r'\bK\s+c\b', r'$K_c$', text)
        text = re.sub(r'\bK\s+p\b', r'$K_p$', text)
        text = re.sub(r'\bK\s+w\b', r'$K_w$', text)

        # Fix Delta G, Delta H, Delta S with degree or not
        # Already in KaTeX in newer files, but older ones may have plain text
        text = text.replace('DG°', '$\\Delta G°$')
        text = text.replace('DH°', '$\\Delta H°$')
        text = text.replace('DS°', '$\\Delta S°$')
        text = text.replace('ΔG°', '$\\Delta G°$')
        text = text.replace('ΔH°', '$\\Delta H°$')
        text = text.replace('ΔS°', '$\\Delta S°$')

        # Fix "rxn" subscript in thermodynamic values
        text = re.sub(r'\bkJ/mol\s+rxn\b', r'kJ/mol$_{rxn}$', text)
        text = re.sub(r'\bkJ mol\s*-\s*1\s+rxn\b', r'kJ/mol$_{rxn}$', text)

        # Fix garbled "S^soln" type patterns
        text = re.sub(r'\bS\^soln\b', r'$\\Delta S^{soln}$', text)

        # Fix common garbled chemical formulas
        # Water: H O with no subscript -> H₂O -> $H_2O$
        # Be careful to only fix specific known patterns

        # Fix "H O(l)" -> "$H_2O(l)$" - water
        text = re.sub(r'\bH O\(l\)', r'$H_2O$(l)', text)
        text = re.sub(r'\bH O\(g\)', r'$H_2O$(g)', text)
        text = re.sub(r'\bH O\(aq\)', r'$H_2O$(aq)', text)
        text = re.sub(r'\bH O\(s\)', r'$H_2O$(s)', text)
        # Standalone H O at end or followed by space
        text = re.sub(r'\bH O\b(?![\(\)])', r'$H_2O$', text)

        # Fix hydrogen peroxide H O (should be H2O2)
        # This is tricky - H2O2 often appears as "H O " in tables
        # Need context... leave for now, too risky

        # Fix common subscript-2 molecules
        text = re.sub(r'\bO\s+2\b(?!\+)', r'$O_2$', text)  # O 2 -> O₂ (but not O2+ ions)
        text = re.sub(r'\bN\s+2\b(?!\s*O)', r'$N_2$', text)  # N 2 -> N₂ (not N2O)
        text = re.sub(r'\bCl\s+2\b', r'$Cl_2$', text)
        text = re.sub(r'\bBr\s+2\b', r'$Br_2$', text)
        text = re.sub(r'\bI\s+2\b', r'$I_2$', text)
        text = re.sub(r'\bF\s+2\b', r'$F_2$', text)
        text = re.sub(r'\bH\s+2\b(?!\s*O)', r'$H_2$', text)  # H 2 -> H₂ (not H2O)

        # Fix NO3 variants: NO with superscript minus
        text = re.sub(r'\bNO\s*[-−]\b', r'$NO_3^-$', text)  # NO- context

        # Fix SO4, SO3 patterns
        text = re.sub(r'\bS O\s+4\b', r'$SO_4$', text)
        text = re.sub(r'\bS O\s+3\b', r'$SO_3$', text)
        text = re.sub(r'\bS O\s+2\b', r'$SO_2$', text)

        # Fix CO2 patterns
        text = re.sub(r'\bCO\s+2\b', r'$CO_2$', text)
        text = re.sub(r'\bCO\s+3\b', r'$CO_3$', text)

        # Fix Al2O3, Na2O type patterns
        text = re.sub(r'\bAl\s+O\b', r'$Al_2O_3$', text)  # Al O -> Al₂O₃
        text = re.sub(r'\bNa\s+O\b', r'$Na_2O$', text)   # Na O -> Na₂O

        # Fix "× 10−" style (scientific notation)
        text = re.sub(r'×\s+10\s*([−-])\s*(\d+)', r'× 10$^{\1\2}$', text)
        text = re.sub(r'×\s*10\s*([−-])(\d+)', r'× 10$^{\1\2}$', text)

        # Fix (cid: artifacts) already done above
        # Remove trailing copyright/page junk that got embedded
        # Already done above

    # ===========================
    # CALC-SPECIFIC FIXES
    # ===========================

    if is_calc:
        # Fix "g 4 " type expressions (function evaluation)
        # "Find g 4 , g 4 , and g 4 ." ->
        # Very context specific - need to handle manually for these
        pass

    # ===========================
    # TRAILING WHITESPACE / CLEANUP
    # ===========================

    # Trim excessive trailing whitespace
    text = text.rstrip()

    # Fix leading whitespace on lines
    lines = text.split('\n')
    # Remove completely empty lines at start/end
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    text = '\n'.join(lines)

    return text


def fix_value(value, filepath, field):
    """Fix a JSON value recursively."""
    if isinstance(value, str):
        fixed = fix_text(value, filepath, field)
        if fixed != value:
            log_change(filepath, field, value, fixed)
        return fixed
    elif isinstance(value, list):
        return [fix_value(item, filepath, f"{field}[{i}]") for i, item in enumerate(value)]
    elif isinstance(value, dict):
        return {k: fix_value(v, filepath, f"{field}.{k}") for k, v in value.items()}
    return value


def fix_specific_fields(data: dict, filepath: str) -> dict:
    """Fix only the relevant fields in an FRQ JSON structure."""
    data = deepcopy(data)

    # Fix stimulus
    if 'stimulus' in data and data['stimulus']:
        fixed = fix_text(data['stimulus'], filepath, 'stimulus')
        if fixed != data['stimulus']:
            log_change(filepath, 'stimulus', data['stimulus'], fixed)
            data['stimulus'] = fixed

    # Fix parts
    if 'parts' in data and isinstance(data['parts'], list):
        for i, part in enumerate(data['parts']):
            if not isinstance(part, dict):
                continue

            # Fix prompt
            if 'prompt' in part and part['prompt']:
                fixed = fix_text(part['prompt'], filepath, f'parts[{i}].prompt')
                if fixed != part['prompt']:
                    log_change(filepath, f'parts[{i}].prompt', part['prompt'], fixed)
                    data['parts'][i]['prompt'] = fixed

            # Fix rubric_criteria
            if 'rubric_criteria' in part and isinstance(part['rubric_criteria'], list):
                for j, criterion in enumerate(part['rubric_criteria']):
                    if isinstance(criterion, str) and criterion:
                        fixed = fix_text(criterion, filepath, f'parts[{i}].rubric_criteria[{j}]')
                        if fixed != criterion:
                            log_change(filepath, f'parts[{i}].rubric_criteria[{j}]', criterion, fixed)
                            data['parts'][i]['rubric_criteria'][j] = fixed
                    elif isinstance(criterion, dict):
                        for k, v in criterion.items():
                            if isinstance(v, str) and v:
                                fixed = fix_text(v, filepath, f'parts[{i}].rubric_criteria[{j}].{k}')
                                if fixed != v:
                                    log_change(filepath, f'parts[{i}].rubric_criteria[{j}].{k}', v, fixed)
                                    data['parts'][i]['rubric_criteria'][j][k] = fixed

            # Fix scoring_notes
            if 'scoring_notes' in part and part['scoring_notes']:
                fixed = fix_text(part['scoring_notes'], filepath, f'parts[{i}].scoring_notes')
                if fixed != part['scoring_notes']:
                    log_change(filepath, f'parts[{i}].scoring_notes', part['scoring_notes'], fixed)
                    data['parts'][i]['scoring_notes'] = fixed

    # Fix documents (DBQ)
    if 'documents' in data and isinstance(data['documents'], list):
        for i, doc in enumerate(data['documents']):
            if not isinstance(doc, dict):
                continue
            for field_name in ['content', 'source', 'title']:
                if field_name in doc and doc[field_name]:
                    fixed = fix_text(doc[field_name], filepath, f'documents[{i}].{field_name}')
                    if fixed != doc[field_name]:
                        log_change(filepath, f'documents[{i}].{field_name}', doc[field_name], fixed)
                        data['documents'][i][field_name] = fixed

    return data


def process_file(filepath: str) -> bool:
    """Process a single file. Returns True if changes were made."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"  ERROR: Cannot parse {filepath}: {e}", file=sys.stderr)
        return False

    # Only fix released FRQs
    if data.get('source') != 'released':
        return False

    fixed_data = fix_specific_fields(data, filepath)

    # Check if anything changed
    if fixed_data == data:
        return False

    # Write the fixed data back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, indent=2, ensure_ascii=False)
    f_name = filepath.split('/')[-1]
    print(f"\n[WROTE] {f_name}")
    return True


def main():
    files_processed = 0
    files_changed = 0

    for frq_dir in FRQ_DIRS:
        if not os.path.exists(frq_dir):
            print(f"WARNING: Directory does not exist: {frq_dir}", file=sys.stderr)
            continue

        print(f"\n{'='*60}")
        print(f"Processing {frq_dir}")
        print('='*60)

        json_files = sorted(Path(frq_dir).glob('*.json'))
        for json_file in json_files:
            if json_file.name in ['manifest.json', 'image-manifest.json']:
                continue

            files_processed += 1
            before_count = len(changes_log)

            changed = process_file(str(json_file))
            if changed:
                files_changed += 1
                changes = len(changes_log) - before_count
                print(f"  [{json_file.name}] {changes} fixes applied")

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Files processed: {files_processed}")
    print(f"Files changed: {files_changed}")
    print(f"Total fixes applied: {len(changes_log)}")

    # Write changes log
    log_path = "C:/Ascendly/scripts/fix_log.json"
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(changes_log, f, indent=2, ensure_ascii=False)
    print(f"\nChanges log written to: {log_path}")


if __name__ == '__main__':
    main()
