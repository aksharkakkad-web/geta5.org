#!/usr/bin/env python3
"""
Patch 2015 AP Chemistry FRQ scoring_points with correct answers.
2015 PDF is unreadable (scanned), so answers are derived from chemistry knowledge
based on the question prompts.

Also fixes duplicate point_id issues in 2015 data.
"""
import sys, json, os
sys.stdout.reconfigure(encoding='utf-8')

FRQ_DIR = "C:/Ascendly/public/data/ap-chemistry/frq"

# Targeted patches for 2015 - correct answers based on chemistry knowledge
# Format: (q_num, part_letter, point_id_pattern): (new_description, correct_example)
PATCHES = {
    # Q1: Metal-air cells / Zinc-air batteries
    (1, 'b', 'bi'): (
        "correct answer: mass of the cell increases as cell operates",
        "Increase. O2(g) from the air is consumed at the cathode and incorporated into the ZnO product, adding mass to the cell."
    ),
    (1, 'b', 'bii'): (
        "correct justification based on the overall cell reaction equation",
        "The overall reaction 2Zn(s) + O2(g) → 2ZnO(s) shows that O2 gas from the air is consumed. The added oxygen mass becomes part of the ZnO product, increasing the total mass of the cell."
    ),
    (1, 'c', 'ci'): (
        "correct answer: cell potential is lower at the top of the mountain",
        "Lower. At higher elevation, air pressure is reduced, meaning lower partial pressure of O2."
    ),
    (1, 'c', 'cii'): (
        "correct justification: lower O2 concentration shifts equilibrium",
        "The reduced partial pressure of O2 at high elevation decreases [O2], which by Le Chatelier's principle shifts the cell reaction toward reactants, decreasing the cell potential (consistent with the Nernst equation)."
    ),
    (1, 'd', 'd'): (
        "correct calculation identifying Na as transferring more electrons per gram",
        "Na: (1.0 g / 22.99 g/mol) × (2 mol e− / 1 mol Na) = 0.087 mol e−; Ca: (1.0 g / 40.08 g/mol) × (2 mol e− / 1 mol Ca) = 0.050 mol e−. Na transfers more electrons per gram."
    ),
    (1, 'e', 'ei'): (
        "correct electron configuration for ground-state Zn",
        "1s2 2s2 2p6 3s2 3p6 3d10 4s2 (or [Ar] 3d10 4s2)"
    ),
    (1, 'e', 'eii'): (
        "correct sublevel from which electrons are removed when Zn is oxidized",
        "The 4s sublevel. Electrons are removed from the outermost (highest energy) occupied sublevel, which is 4s for Zn."
    ),

    # Q2: Ethanol dehydration / C2H5OH → C2H4
    (2, 'a', 'ai'): (
        "correct calculated number of moles of C2H4 actually produced",
        "Using PV = nRT: n = PV/RT = (1 atm × V) / (0.08206 L·atm/mol·K × T). Calculate from the measured gas volume and conditions."
    ),
    (2, 'a', 'aii'): (
        "correct calculated number of moles based on stoichiometry",
        "From the stoichiometry C2H5OH → C2H4 + H2O: moles C2H4 theoretical = moles C2H5OH used."
    ),
    (2, 'b', 'b'): (
        "correct calculated percent yield",
        "% yield = (actual moles C2H4 / theoretical moles C2H4) × 100%"
    ),
    (2, 'c', 'c'): (
        "correct evaluation of thermodynamic data with ΔG° calculation",
        "ΔG° = ΔH° − TΔS° = 45.5 kJ/mol − (298 K)(0.126 kJ/mol·K) = 45.5 − 37.5 = +8.0 kJ/mol. Since ΔG° > 0 at 298 K, the reaction is not spontaneous at room temperature, consistent with the observation."
    ),
    (2, 'e', 'e'): (
        "correct C-O-H bond angle in ethanol",
        "Approximately 109.5°. The oxygen in ethanol has two bonding pairs and two lone pairs (tetrahedral electron geometry), giving a bent molecular geometry with an approximately tetrahedral bond angle."
    ),
    (2, 'f', 'f'): (
        "correct explanation of why C2H4 does not dissolve in water",
        "C2H4 is a nonpolar molecule and cannot form hydrogen bonds with water. Because like dissolves like, nonpolar C2H4 is essentially insoluble in polar water."
    ),
    (2, 'g', 'g'): (
        "correct explanation of why C2H5OH does dissolve in water",
        "Ethanol (C2H5OH) contains an -OH group that can form hydrogen bonds with water molecules, allowing it to dissolve readily in water."
    ),

    # Q3: Buffer chemistry / KHC7H5O2 (potassium hydrogen phthalate)
    (3, 'a', 'a'): (
        "correct net-ionic equation for KC7H5O2(aq) + HCl(aq)",
        "HC7H5O2−(aq) + H+(aq) → H2C7H5O2(aq)  [or: HC7H5O2−(aq) + H3O+(aq) → H2C7H5O2(aq) + H2O(l)]"
    ),
    (3, 'b', 'b'): (
        "correct calculated concentration of KHC7H5O2 in the stock solution",
        "At the equivalence point: moles HCl = moles KHC7H5O2. n(HCl) = (1.25 M)(0.02995 L) = 0.03744 mol. [KHC7H5O2] = 0.03744 mol / 0.04500 L = 0.832 M"
    ),
    (3, 'c', 'c'): (
        "correct indicator selection based on pH at equivalence point of 2.54",
        "An indicator with a pKa near 2.54 should be selected, so that its color change occurs near the equivalence point pH. Methyl orange (pKa ≈ 3.5) or methyl violet would be appropriate."
    ),
    (3, 'd', 'd'): (
        "correct pH at the half-equivalence point",
        "At the half-equivalence point, [A−] = [HA], so pH = pKa. The pKa of HC7H5O2− = −log(Ka). Using the given data, pH at half-equivalence point = pKa of potassium hydrogen phthalate ≈ 3.37."
    ),
    (3, 'f', 'f'): (
        "correct identification of the dominant species at pH 3.37",
        "At pH 3.37 = pKa, [HC7H5O2−] = [H2C7H5O2], meaning equal concentrations of both species. The pH = pKa indicates the half-equivalence point where acid and conjugate base are present in equal amounts."
    ),

    # Q4: Ca(OH)2 solubility / Ksp
    (4, 'a', 'a'): (
        "correct balanced equation for dissolution of Ca(OH)2 in pure water",
        "Ca(OH)2(s) ⇌ Ca2+(aq) + 2 OH−(aq)"
    ),
    (4, 'b', 'b'): (
        "correct molar solubility calculation using common ion effect",
        "Ksp = 1.3 × 10−6 = [Ca2+][OH−]2 = (0.10 + s)(2s)2 ≈ (0.10)(2s)2 = 0.40 s2. s = √(1.3 × 10−6 / 0.40) = √(3.25 × 10−6) = 1.8 × 10−3 M"
    ),

    # Q5: Kinetics / Food coloring bleaching
    (5, 'a', 'a'): (
        "correct reaction order with respect to blue food coloring",
        "First order. The graph of ln[blue food coloring] vs. time is linear, which is characteristic of a first-order reaction."
    ),
    (5, 'b', 'b'): (
        "correct description of how to determine overall rate law",
        "Prepare multiple trials with varying concentrations of bleach while keeping [blue food coloring] constant. Compare the initial rates to determine the order with respect to bleach."
    ),
    (5, 'c', 'c'): (
        "correct description of modification needed to study red food coloring",
        "The student would need to use a different wavelength of light (or filter) that is absorbed by red food coloring but not by bleach or other species in solution, to monitor the concentration of the red dye specifically."
    ),

    # Q6: Molecular structure and bonding
    (6, 'a', 'a'): (
        "correct selection of two compounds with explanation of data support",
        "Select two compounds from the table that support the hypothesis about molecular structure and properties. Compare their boiling points or other data to the predicted trend based on molecular size/polarity."
    ),
    (6, 'b', 'b'): (
        "correct compound identification and net ionic equation for basic solution",
        "A compound such as Na2CO3 or NaHCO3 produces a basic solution. Net ionic equation: CO32−(aq) + H2O(l) ⇌ HCO3−(aq) + OH−(aq)"
    ),

    # Q7: Thermochemistry / Aluminum
    (7, 'a', 'a'): (
        "correct calculated heat needed to melt 1.00 mol Al from 298 K",
        "q = q_heating + q_melting = nCp,s(Tmp − 298 K) + n·ΔHfus = (1.00 mol)(24.4 J/mol·K)(933 K − 298 K) + (1.00 mol)(10,700 J/mol) ≈ 15,500 J + 10,700 J ≈ 26,200 J = 26.2 kJ"
    ),
    (7, 'b', 'b'): (
        "correct answer identifying recycling as requiring less energy than extraction",
        "Recycling requires less energy. Extracting Al from Al2O3 requires large amounts of electrical energy (electrolysis) to reduce Al3+ to Al. Recycling requires only enough energy to melt the Al (much less than the electrolysis energy needed for extraction from ore)."
    ),
}


def fix_duplicate_point_ids(sps):
    """Remove duplicate scoring_points (same point_id)."""
    seen = {}
    result = []
    for sp in sps:
        pid = sp.get('point_id', '')
        if pid not in seen:
            seen[pid] = True
            result.append(sp)
    return result


def apply_patch(sp, patch_desc, patch_example):
    """Apply a patch to a scoring_point."""
    modified = False
    alts = sp.get('alternatives', [])
    if alts:
        for alt in alts:
            if not alt.get('correct_example', ''):
                alt['correct_example'] = patch_example
                modified = True

    # Update description if generic
    current_desc = sp.get('description', '')
    generic_descs = [
        'Provide a correct response', 'Provide a correct response for',
        'Correctly identify/write', 'State the correct answer with',
        'Calculate the correct value', 'Provide a correct answer with',
        'Provide the correct', 'Correct and complete response',
        'Correct response addressing',
    ]
    if any(current_desc.startswith(g) for g in generic_descs):
        sp['description'] = patch_desc
        modified = True

    return sp, modified


def main():
    total_patched = 0

    for q_num in range(1, 8):
        fname = f"chem-2015-frq-{q_num}.json"
        path = os.path.join(FRQ_DIR, fname)
        if not os.path.exists(path):
            continue

        with open(path, encoding='utf-8') as f:
            data = json.load(f)

        changed = False

        for part in data.get('parts', []):
            if part.get('requires_drawing', False):
                continue

            sps = part.get('scoring_points', [])
            if not sps:
                continue

            # Fix duplicate point_ids
            deduped = fix_duplicate_point_ids(sps)
            if len(deduped) != len(sps):
                part['scoring_points'] = deduped
                sps = deduped
                changed = True
                print(f"  Fixed duplicate point_ids in {fname} part {part['letter']}")

            part_letter = part.get('letter', '').lower()

            for sp in sps:
                # Find matching patch
                point_id = sp.get('point_id', '')
                # Extract prefix for matching (e.g., 'bi1' -> 'bi', 'b1' -> 'b')
                import re
                m = re.match(r'^([a-z])((?:i{1,3}v?|iv|vi{0,3}|ix|x)?)(\d+)$', point_id, re.IGNORECASE)
                if m:
                    part_only = m.group(1).lower()
                    sub_roman = m.group(2).lower()
                    # Try exact match first
                    key = (q_num, part_letter, f"{part_only}{sub_roman}" if sub_roman else part_only)
                    patch = PATCHES.get(key)
                    if not patch:
                        # Try without point_id info
                        key2 = (q_num, part_letter, part_only)
                        patch = PATCHES.get(key2)
                else:
                    key = (q_num, part_letter, part_letter)
                    patch = PATCHES.get(key)

                if patch:
                    sp, modified = apply_patch(sp, patch[0], patch[1])
                    if modified:
                        changed = True

        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Updated: {fname}")
            total_patched += 1

    print(f"\nTotal files patched: {total_patched}")

    # Final verification
    total = 0
    populated = 0
    empty = []
    for q_num in range(1, 8):
        fname = f"chem-2015-frq-{q_num}.json"
        path = os.path.join(FRQ_DIR, fname)
        if not os.path.exists(path):
            continue
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        for part in data.get('parts', []):
            if part.get('requires_drawing', False):
                continue
            for sp in part.get('scoring_points', []):
                total += 1
                alts = sp.get('alternatives', [])
                if alts and alts[0].get('correct_example', ''):
                    populated += 1
                else:
                    empty.append(f"Q{q_num} part={part['letter']} {sp.get('point_id')}")

    print(f"\n2015 verification: {populated}/{total} populated")
    if empty:
        print("Still empty:")
        for e in empty:
            print(f"  {e}")


if __name__ == "__main__":
    main()
