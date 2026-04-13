#!/usr/bin/env python3
"""
Maps extracted FRQ images to their correct JSON question files.
Renames images per convention and updates JSON files.

Rules:
- Skip boilerplate page 2 images (periodic table / formula sheets)
- Images that appear before/within a question's text -> stimulus_image
- Images referenced by a specific part -> reference_image
- Naming: {question-id}-stimulus.png or {question-id}-{letter}-ref.png
"""

import json
import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

IMAGES_DIR = r"C:\Ascendly\public\data\ap-chemistry\frq\images"
JSON_DIR = r"C:\Ascendly\public\data\ap-chemistry\frq"
TMP_DIR = r"C:\Ascendly\public\data\ap-chemistry\frq\images\tmp"
WEB_PATH_PREFIX = "/data/ap-chemistry/frq/images/"

# Manual mapping: (image_file, target_json_id, placement)
# placement: "stimulus" OR "part-{letter}"
MANUAL_MAP = [
    # === 2014 ===
    # p2-img1: blank full-page scan -> SKIP (boilerplate)
    ("2014-chem-frq-p8-img2.png", "chem-2014-frq-3", "stimulus"),   # full Cu/Sn galvanic cell
    ("2014-chem-frq-p8-img1.png", "chem-2014-frq-3", "part-c"),     # expanded salt bridge view
    ("2014-chem-frq-p10-img1.png", "chem-2014-frq-4", "stimulus"),  # CO2 pressure vs time graph
    ("2014-chem-frq-p12-img1.png", "chem-2014-frq-6", "stimulus"),  # PP/PVC polymer structures

    # === 2015 ===
    # p2-img1: blank full-page -> SKIP
    # p5-img1: metal-air battery diagram -> frq-1 stimulus
    ("2015-chem-frq-p5-img1.png", "chem-2015-frq-1", "stimulus"),   # metal-air cell
    # p7-img1: ethanol dehydration lab setup -> frq-2 stimulus
    ("2015-chem-frq-p7-img1.png", "chem-2015-frq-2", "stimulus"),   # dehydration apparatus
    # p8-img1: C2H4 and C2H5OH Lewis dot boxes -> frq-2 part-d
    ("2015-chem-frq-p8-img1.png", "chem-2015-frq-2", "part-d"),     # Lewis diagrams
    # p10-img1: pH titration curve (blank with 2 points) -> frq-3 part-e
    ("2015-chem-frq-p10-img1.png", "chem-2015-frq-3", "part-e"),    # titration curve graph
    # p11-img1: Ca2+ ion diagram (starting point for drawing) -> frq-4 part-c
    ("2015-chem-frq-p11-img1.png", "chem-2015-frq-4", "part-c"),    # Ca2+ particle diagram
    # p12-img1: three kinetics graphs (absorbance, ln, 1/abs vs time) -> frq-5 stimulus
    ("2015-chem-frq-p12-img1.png", "chem-2015-frq-5", "stimulus"),  # kinetics graphs

    # === 2016 ===
    # p2-img1: blank full-page -> SKIP
    # p6-img1: LiCl crystal particulate (labeled with arrows) -> frq-1 part-e
    ("2016-chem-frq-p6-img1.png", "chem-2016-frq-1", "part-e"),     # LiCl crystal diagram
    # p8-img1: MI2 experiment (weighing, reaction, collection sequence) -> frq-3 stimulus
    ("2016-chem-frq-p8-img1.png", "chem-2016-frq-3", "stimulus"),   # experiment sequence
    # p11-img1: C4H6 kinetics (3 graphs: [C4H6], ln[C4H6], 1/[C4H6] vs time) -> frq-5 stimulus
    ("2016-chem-frq-p11-img1.png", "chem-2016-frq-5", "stimulus"),  # kinetics graphs
    # p14-img1: buret before/after images -> frq-7 part-a
    ("2016-chem-frq-p14-img1.png", "chem-2016-frq-7", "part-a"),    # buret readings

    # === 2017 ===
    # p2-img1: blank full-page -> SKIP
    # p5-img1: Maxwell-Boltzmann distribution graph -> frq-1 part-b
    ("2017-chem-frq-p5-img1.png", "chem-2017-frq-1", "part-b"),     # MB distribution
    # p8-img1: urea [CO(NH2)2] data table + graph -> frq-2 stimulus (frq-2 about urea decomp)
    ("2017-chem-frq-p8-img1.png", "chem-2017-frq-2", "stimulus"),   # urea kinetics table+graph
    # p9-img1: HNO2/NO2- buffer particulate -> frq-3 part-e
    ("2017-chem-frq-p9-img1.png", "chem-2017-frq-3", "part-e"),     # buffer particulate
    # p10-img1: chromatography diagrams -> frq-4 stimulus
    ("2017-chem-frq-p10-img1.png", "chem-2017-frq-4", "stimulus"),  # chromatography
    # p11-img1: C3H7OH combustion setup (initial/final) -> frq-5 stimulus
    ("2017-chem-frq-p11-img1.png", "chem-2017-frq-5", "stimulus"),  # combustion setup

    # === 2018 ===
    # p2-img1, img2, img3: page 2 formula/reference sheets -> SKIP
    # p6-img1: temperature vs time calorimetry graph -> frq-1 part-d
    ("2018-chem-frq-p6-img1.png", "chem-2018-frq-1", "part-d"),     # temp vs time graph
    # p7-img1: O2/N2/NO particulate (empty box left, products right) -> frq-2 part-a
    ("2018-chem-frq-p7-img1.png", "chem-2018-frq-2", "part-a"),     # NO/N2O products particulate
    # p8-img1: HNO2 titration curve with KOH -> frq-2 part-e
    ("2018-chem-frq-p8-img1.png", "chem-2018-frq-2", "part-e"),     # titration curve
    # p11-img1: HF ionization particulate Figure 1 and 2 -> frq-5 part-a
    ("2018-chem-frq-p11-img1.png", "chem-2018-frq-5", "part-a"),    # HF ionization particulates
    # p12-img1: Cr/Ag galvanic cell diagram -> frq-6 stimulus
    ("2018-chem-frq-p12-img1.png", "chem-2018-frq-6", "stimulus"),  # Cr/Ag cell
    # p13-img1: photoelectron spectrum -> frq-7 stimulus
    ("2018-chem-frq-p13-img1.png", "chem-2018-frq-7", "stimulus"),  # PES

    # === 2019 ===
    # p2-img1, img2, img3: page 2 formula/reference sheets -> SKIP
    # p5-img1: urea + water hydrogen bonding particulate -> frq-1 part-b
    ("2019-chem-frq-p5-img1.png", "chem-2019-frq-1", "part-b"),     # urea H-bonding diagram
    # p6-img1: lab equipment (polystyrene cup, thermometer, etc.) -> frq-1 part-e
    ("2019-chem-frq-p6-img1.png", "chem-2019-frq-1", "part-e"),     # lab equipment
    # p8-img1: Na+/NO3-/CaCO3 incomplete ionic diagram -> frq-3 part-b
    ("2019-chem-frq-p8-img1.png", "chem-2019-frq-3", "part-b"),     # ionic species diagram
    # p11-img1: complete PES with many peaks -> frq-5 stimulus
    ("2019-chem-frq-p11-img1.png", "chem-2019-frq-5", "stimulus"),  # PES
    # p12-img1: three NO2 kinetics graphs -> frq-6 stimulus
    ("2019-chem-frq-p12-img1.png", "chem-2019-frq-6", "stimulus"),  # NO2 kinetics graphs
    # p14-img1: buret initial/final -> frq-7 part-b (student used 50 mL buret)
    ("2019-chem-frq-p14-img1.png", "chem-2019-frq-7", "part-b"),    # buret readings

    # === 2021 ===
    # p2-img1 through p2-img5: page 2 embedded boilerplate -> SKIP
    # p6-img1: HCOOH Lewis dot diagram box (incomplete, to complete) -> frq-1 part-c
    ("2021-chem-frq-p6-img1.png", "chem-2021-frq-1", "part-c"),     # HCOOH Lewis box
    # p7-img1: total pressure vs time graph leveling at 24 atm -> frq-1 part-f
    ("2021-chem-frq-p7-img1.png", "chem-2021-frq-1", "part-f"),     # pressure vs time
    # p8-img1: mass spectrum of Si -> frq-2 part-a
    ("2021-chem-frq-p8-img1.png", "chem-2021-frq-2", "part-a"),     # Si mass spectrum
    # p10-img1: partial PES of Si (missing peak) -> frq-2 part-g
    ("2021-chem-frq-p10-img1.png", "chem-2021-frq-2", "part-g"),    # partial PES
    # p13-img1: calibration curve (absorbance vs concentration) -> frq-3 stimulus
    ("2021-chem-frq-p13-img1.png", "chem-2021-frq-3", "stimulus"),  # calibration curve
    # p16-img1: molten MgCl2 electrolysis cell with Mg and Cl2 -> frq-5 stimulus
    ("2021-chem-frq-p16-img1.png", "chem-2021-frq-5", "stimulus"),  # MgCl2 electrolysis
    # p18-img1: CaSO4/PbSO4 conductivity diagram -> frq-6 part-a
    ("2021-chem-frq-p18-img1.png", "chem-2021-frq-6", "part-a"),    # conductivity diagram
    # p19-img1: O2 in movable piston container -> frq-7 stimulus
    ("2021-chem-frq-p19-img1.png", "chem-2021-frq-7", "stimulus"),  # piston container

    # === 2022 ===
    # p2-img1 through p2-img5: page 2 boilerplate -> SKIP
    # p7-img2: methyl salicylate + salicylic acid structures table -> frq-1 stimulus
    ("2022-chem-frq-p7-img2.png", "chem-2022-frq-1", "stimulus"),   # structures table
    # p7-img1: titration curve HC7H5O3 with NaOH (dashed) -> frq-1 part-e
    ("2022-chem-frq-p7-img1.png", "chem-2022-frq-1", "part-e"),     # titration curve
    # p8-img1: salicylic acid titration curve (labeled) for benzoic acid comparison -> frq-1 part-h
    ("2022-chem-frq-p8-img1.png", "chem-2022-frq-1", "part-h"),     # benzoic acid comparison
    # p9-img1: CO Lewis diagram box (just "C O") -> frq-2 part-b
    ("2022-chem-frq-p9-img1.png", "chem-2022-frq-2", "part-b"),     # CO Lewis box
    # p10-img1: CH3OH/CO/H2 equilibrium particle diagram -> frq-2 part-d
    ("2022-chem-frq-p10-img1.png", "chem-2022-frq-2", "part-d"),    # equilibrium particulate
    # p13-img1: Al/Ag+ -> Al3+/Ag reaction particulate -> frq-3 part-d
    ("2022-chem-frq-p13-img1.png", "chem-2022-frq-3", "part-d"),    # reaction particulate
    # p19-img1: MnO4- absorbance vs wavelength spectrum -> frq-6 part-a
    ("2022-chem-frq-p19-img1.png", "chem-2022-frq-6", "part-a"),    # absorption spectrum
    # p19-img2: graduated cylinder with ~95 mL reading -> frq-6 part-b (dilution procedure)
    ("2022-chem-frq-p19-img2.png", "chem-2022-frq-6", "part-b"),    # graduated cylinder
    # p20-img1: calibration curve (absorbance vs [MnO4-]) with outlier -> frq-6 part-c
    ("2022-chem-frq-p20-img1.png", "chem-2022-frq-6", "part-c"),    # calibration curve
    # p21-img1: oxalate ion C2O4^2- Lewis structure -> frq-7 stimulus
    ("2022-chem-frq-p21-img1.png", "chem-2022-frq-7", "stimulus"),  # oxalate Lewis structure

    # === 2023 ===
    # p2-img1 through p2-img5: page 2 boilerplate -> SKIP
    # p7-img1: alkaline battery diagram + half-reactions table -> frq-1 part-f
    ("2023-chem-frq-p7-img1.png", "chem-2023-frq-1", "part-f"),     # battery + half-reactions
    # p9-img1: Cl2 potential energy diagram -> frq-2 part-c
    ("2023-chem-frq-p9-img1.png", "chem-2023-frq-2", "part-c"),     # PE diagram
    # p9-img2: three AlCl3 Lewis diagrams -> frq-2 part-d
    ("2023-chem-frq-p9-img2.png", "chem-2023-frq-2", "part-d"),     # three Lewis diagrams
    # p10-img1: AlCl3/Al2Cl6 equilibrium particulate -> frq-2 part-e
    ("2023-chem-frq-p10-img1.png", "chem-2023-frq-2", "part-e"),    # equilibrium particulate
    # p17-img1: empty box with Cl- ion and water molecule legend -> frq-5 part-b
    ("2023-chem-frq-p17-img1.png", "chem-2023-frq-5", "part-b"),    # Cl- hydration box
    # p18-img1: HA/A-/H3O+ particulate in circle -> frq-5 part-c
    ("2023-chem-frq-p18-img1.png", "chem-2023-frq-5", "part-c"),    # acid particulate
    # p21-img1: Sr2+/OH- particulate diagram -> frq-7 part-a
    ("2023-chem-frq-p21-img1.png", "chem-2023-frq-7", "part-a"),    # Sr(OH)2 particulate
    # p22-img1: empty white box -> SKIP (just answer area)

    # === 2024 ===
    # p2-img1 through p2-img5: page 2 boilerplate -> SKIP
    # p5-img1: structural formula of lactic acid -> frq-1 part-a
    ("2024-chem-frq-p5-img1.png", "chem-2024-frq-1", "part-a"),     # lactic acid structure
    # p6-img1: pH vs NaOH titration curve -> frq-1 part-b
    ("2024-chem-frq-p6-img1.png", "chem-2024-frq-1", "part-b"),     # titration curve
    # p6-img2: Na+/C3H6O3/C3H5O3- particulate -> frq-1 part-d
    ("2024-chem-frq-p6-img2.png", "chem-2024-frq-1", "part-d"),     # lactic acid particulate
    # p7-img1: blank titration curve "Experiment 1" for drawing -> SKIP (drawing canvas)
    # p15-img2: calorimeter data table + thermometer reading -> frq-4 stimulus
    ("2024-chem-frq-p15-img2.png", "chem-2024-frq-4", "stimulus"),  # calorimeter data
    # p15-img1: water molecules before/after (kinetic energy arrows) -> frq-4 part-b
    ("2024-chem-frq-p15-img1.png", "chem-2024-frq-4", "part-b"),    # water particulate
    # p17-img1: H/I atom particulate box -> frq-5 part-b
    ("2024-chem-frq-p17-img1.png", "chem-2024-frq-5", "part-b"),    # H2/I2/HI particulate
    # p18-img1: moles of HI vs time graph -> frq-5 part-b (second image for same part)
    # Note: reference_image is a single field - prioritize the particulate diagram (p17)
    # p18-img1 shows moles of HI vs time -> frq-5 part-b-ii actually. Skip to avoid conflict.
    # p19-img1: ln[NO2] and 1/[NO2] graphs -> frq-6 stimulus
    ("2024-chem-frq-p19-img1.png", "chem-2024-frq-6", "stimulus"),  # NO2 kinetics graphs
    # p20-img1: NO2 Lewis structure + NO2+ box -> frq-6 part-c
    ("2024-chem-frq-p20-img1.png", "chem-2024-frq-6", "part-c"),    # NO2 Lewis boxes
    # p22-img1: chromatography paper (X and Y compounds) -> frq-7 stimulus
    ("2024-chem-frq-p22-img1.png", "chem-2024-frq-7", "stimulus"),  # chromatography paper

    # === 2025 ===
    # p3-img1: incomplete Mg mass spectrum -> frq-1 part-a
    ("2025-chem-frq-p3-img1.png", "chem-2025-frq-1", "part-a"),     # Mg mass spectrum
    # p4-img1: Mg2+ in water particulate + two beaker diagram -> frq-1 part-b
    ("2025-chem-frq-p4-img1.png", "chem-2025-frq-1", "part-b"),     # Mg2+ hydration + beakers
    # p5-img1: Beaker 1 (Mg(NO3)2) + Beaker 2 (NaOH) + empty Beaker 3 -> frq-1 part-d
    ("2025-chem-frq-p5-img1.png", "chem-2025-frq-1", "part-d"),     # mixing diagram
    # p6-img1: HAsc titration curve -> frq-2 part-b
    ("2025-chem-frq-p6-img1.png", "chem-2025-frq-2", "part-b"),     # HAsc titration curve
    # p8-img1: P4 tetrahedral model + incomplete Lewis diagram box -> frq-3 stimulus
    ("2025-chem-frq-p8-img1.png", "chem-2025-frq-3", "stimulus"),   # P4 structure + Lewis box
    # p9-img1: calorimeter (inner/outer vessel, thermometer, stirrer) -> frq-3 part-b
    ("2025-chem-frq-p9-img1.png", "chem-2025-frq-3", "part-b"),     # calorimeter
    # p10-img1: PCl2/PCl3/PCl5 equilibrium particulate -> frq-3 part-f
    ("2025-chem-frq-p10-img1.png", "chem-2025-frq-3", "part-f"),    # PCl3+Cl2=PCl5 particulate
    # p11-img1: CH2O/CH3OH Lewis structures -> frq-4 part-b
    ("2025-chem-frq-p11-img1.png", "chem-2025-frq-4", "part-b"),    # Lewis structures
    # p13-img1: Zn/Al galvanic cell (0.90V) -> frq-6 stimulus
    ("2025-chem-frq-p13-img1.png", "chem-2025-frq-6", "stimulus"),  # Zn/Al galvanic cell
]


def get_target_filename(json_id, placement):
    """Generate target filename from json_id and placement."""
    if placement == "stimulus":
        return f"{json_id}-stimulus.png"
    elif placement.startswith("part-"):
        letter = placement[5:]
        return f"{json_id}-{letter}-ref.png"
    else:
        raise ValueError(f"Unknown placement: {placement}")


def parse_placement(placement):
    """Parse placement string into (field_type, letter)."""
    if placement == "stimulus":
        return "stimulus", None
    elif placement.startswith("part-"):
        return "part", placement[5:]
    else:
        raise ValueError(f"Unknown placement: {placement}")


def main():
    target_filenames = set()
    renames = []  # (src_path, target_path, target_filename, json_id, placement)

    for src_file, json_id, placement in MANUAL_MAP:
        src_path = os.path.join(IMAGES_DIR, src_file)
        if not os.path.exists(src_path):
            print(f"WARNING: Source not found: {src_file}")
            continue

        target_filename = get_target_filename(json_id, placement)
        target_path = os.path.join(IMAGES_DIR, target_filename)
        target_filenames.add(target_filename)

        print(f"{src_file} -> {target_filename} [{placement} on {json_id}]")
        renames.append((src_path, target_path, target_filename, json_id, placement))

    print(f"\n=== Performing renames ({len(renames)} images) ===")
    for src_path, target_path, target_filename, json_id, placement in renames:
        shutil.copy2(src_path, target_path)

    print(f"\n=== Updating JSON files ===")
    # Group updates by json_id
    updates = {}  # json_id -> {field: value or parts: {letter: value}}
    for src_path, target_path, target_filename, json_id, placement in renames:
        if json_id not in updates:
            updates[json_id] = {}
        web_path = WEB_PATH_PREFIX + target_filename
        field_type, letter = parse_placement(placement)
        if field_type == "stimulus":
            if "stimulus_image" in updates[json_id]:
                print(f"  WARNING: Multiple stimulus images for {json_id}, keeping first")
            else:
                updates[json_id]["stimulus_image"] = web_path
        else:
            if "parts" not in updates[json_id]:
                updates[json_id]["parts"] = {}
            if letter in updates[json_id]["parts"]:
                print(f"  WARNING: Multiple reference_images for {json_id} part-{letter}, keeping first")
            else:
                updates[json_id]["parts"][letter] = web_path

    for json_id, changes in sorted(updates.items()):
        json_path = os.path.join(JSON_DIR, f"{json_id}.json")
        if not os.path.exists(json_path):
            print(f"  WARNING: JSON not found: {json_path}")
            continue

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        modified = False

        if "stimulus_image" in changes:
            data["stimulus_image"] = changes["stimulus_image"]
            print(f"  {json_id}: stimulus_image = {changes['stimulus_image']}")
            modified = True

        if "parts" in changes:
            for letter, web_path in changes["parts"].items():
                found = False
                for part in data.get("parts", []):
                    if part["letter"] == letter:
                        part["reference_image"] = web_path
                        print(f"  {json_id}: parts[{letter}].reference_image = {web_path}")
                        modified = True
                        found = True
                        break
                if not found:
                    print(f"  WARNING: Part '{letter}' not found in {json_id}")

        if modified:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n=== Cleaning up source images (original names) ===")
    for src_file, json_id, placement in MANUAL_MAP:
        src_path = os.path.join(IMAGES_DIR, src_file)
        target_filename = get_target_filename(json_id, placement)
        # Delete the original filename if it's different from the target
        if src_file != target_filename and os.path.exists(src_path):
            os.remove(src_path)
            print(f"  Deleted: {src_file}")

    print(f"\n=== Cleaning up unmatched/boilerplate images ===")
    for fname in sorted(os.listdir(IMAGES_DIR)):
        if not fname.endswith(".png"):
            continue
        if fname not in target_filenames:
            fpath = os.path.join(IMAGES_DIR, fname)
            os.remove(fpath)
            print(f"  Deleted boilerplate: {fname}")

    print(f"\n=== Cleaning up manifests ===")
    for fname in os.listdir(IMAGES_DIR):
        if fname == "image-manifest.json":
            os.remove(os.path.join(IMAGES_DIR, fname))
            print(f"  Deleted: {fname}")

    print(f"\n=== Final state ===")
    final_images = sorted(f for f in os.listdir(IMAGES_DIR) if f.endswith(".png"))
    print(f"Total images: {len(final_images)}")
    for f in final_images:
        print(f"  {f}")


if __name__ == "__main__":
    main()
