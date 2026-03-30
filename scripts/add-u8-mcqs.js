const fs = require('fs');
const u8 = JSON.parse(fs.readFileSync('public/data/ap-chemistry/mcq/unit-8.json', 'utf8'));

const newQuestions = [
  {
    "id": "chem-mcq-8-026",
    "stimulus": {
      "type": "text",
      "content": "A student tests four unknown solutions with pH paper. Solution W has pH 2, Solution X has pH 6, Solution Y has pH 8, and Solution Z has pH 12."
    },
    "question": "Which of the following correctly identifies the acidic and basic solutions?",
    "choices": [
      { "id": "A", "text": "Only Solution W is acidic; only Solution Z is basic", "is_correct": false, "explanation": "Solutions with pH < 7 are acidic; both W (pH 2) and X (pH 6) are acidic. Only Solutions Y and Z are basic." },
      { "id": "B", "text": "Solutions W and X are acidic; Solutions Y and Z are basic", "is_correct": true, "explanation": "pH < 7 is acidic: W (pH 2) and X (pH 6). pH > 7 is basic: Y (pH 8) and Z (pH 12). pH = 7 is neutral." },
      { "id": "C", "text": "All four solutions are acidic because they all have pH less than 14", "is_correct": false, "explanation": "The acidic/basic classification is based on whether pH is below or above 7, not whether pH is below 14. Solutions Y and Z (pH > 7) are basic." },
      { "id": "D", "text": "Solutions W and Z are acidic; Solutions X and Y are neutral", "is_correct": false, "explanation": "Solution Z (pH 12) is strongly basic, not acidic. Solution X (pH 6) is slightly acidic, not neutral." }
    ],
    "difficulty": "easy",
    "unit_objective": "8.A"
  },
  {
    "id": "chem-mcq-8-027",
    "stimulus": { "type": "none" },
    "question": "Which of the following is a strong acid?",
    "choices": [
      { "id": "A", "text": "Acetic acid ($\\text{CH}_3\\text{COOH}$)", "is_correct": false, "explanation": "Acetic acid is a weak acid with $K_a = 1.8 \\times 10^{-5}$; it only partially dissociates in water." },
      { "id": "B", "text": "Hydrofluoric acid (HF)", "is_correct": false, "explanation": "HF is a weak acid ($K_a \\approx 7.2 \\times 10^{-4}$) because the H-F bond is very strong and only partially breaks in water." },
      { "id": "C", "text": "Nitric acid ($\\text{HNO}_3$)", "is_correct": true, "explanation": "$\\text{HNO}_3$ is one of the six strong acids (HCl, HBr, HI, $\\text{HNO}_3$, $\\text{H}_2\\text{SO}_4$, $\\text{HClO}_4$) that dissociate completely in water." },
      { "id": "D", "text": "Carbonic acid ($\\text{H}_2\\text{CO}_3$)", "is_correct": false, "explanation": "Carbonic acid is a weak diprotic acid; it only partially dissociates ($K_{a1} \\approx 4.3 \\times 10^{-7}$)." }
    ],
    "difficulty": "easy",
    "unit_objective": "8.A"
  },
  {
    "id": "chem-mcq-8-028",
    "stimulus": { "type": "none" },
    "question": "A weak acid HA has $K_a = 1.0 \\times 10^{-5}$. Its conjugate base $\\text{A}^-$ has a $K_b$ equal to:",
    "choices": [
      { "id": "A", "text": "$1.0 \\times 10^{-5}$", "is_correct": false, "explanation": "$K_a \\times K_b = K_w = 1.0 \\times 10^{-14}$. If $K_b$ equaled $K_a$, then $K_a \\times K_b = 10^{-10}$, which is not $K_w$." },
      { "id": "B", "text": "$1.0 \\times 10^{-9}$", "is_correct": true, "explanation": "$K_b = K_w / K_a = (1.0 \\times 10^{-14}) / (1.0 \\times 10^{-5}) = 1.0 \\times 10^{-9}$. A weak acid has a conjugate base that is a weak base." },
      { "id": "C", "text": "$1.0 \\times 10^{-14}$", "is_correct": false, "explanation": "$1.0 \\times 10^{-14}$ is $K_w$ itself; $K_b = K_w / K_a$, which requires dividing $K_w$ by $K_a$." },
      { "id": "D", "text": "$1.0 \\times 10^{-19}$", "is_correct": false, "explanation": "This would result from multiplying $K_a \\times K_w$, not from $K_b = K_w / K_a$." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.B"
  },
  {
    "id": "chem-mcq-8-029",
    "stimulus": {
      "type": "text",
      "content": "A student measures the pH of a 0.10 mol/L solution of hydrochloric acid (HCl) and a 0.10 mol/L solution of acetic acid (Ka = 1.8 x 10^-5) at the same temperature."
    },
    "question": "Which of the following best explains why the acetic acid solution has a higher pH than the HCl solution at the same concentration?",
    "choices": [
      { "id": "A", "text": "HCl has a higher molar mass than acetic acid", "is_correct": false, "explanation": "Molar mass does not determine acid strength or pH. The key factor is the degree of dissociation in water." },
      { "id": "B", "text": "Acetic acid only partially dissociates in water, producing fewer $\\text{H}^+$ ions than HCl at the same concentration", "is_correct": true, "explanation": "HCl (strong acid) dissociates 100%, giving $[\\text{H}^+] = 0.10$ mol/L, pH = 1. Acetic acid (weak acid) only partially dissociates, giving $[\\text{H}^+] \\approx 1.34 \\times 10^{-3}$ mol/L, pH \\approx 2.87." },
      { "id": "C", "text": "Acetic acid reacts with water to produce $\\text{OH}^-$ ions, making it more basic", "is_correct": false, "explanation": "Acetic acid reacts with water to donate $\\text{H}^+$ ions, making the solution acidic. It produces $\\text{H}_3\\text{O}^+$, not $\\text{OH}^-$." },
      { "id": "D", "text": "HCl dissociates into two ions while acetic acid dissociates into three ions", "is_correct": false, "explanation": "Ion count per formula unit is not the determining factor. The critical difference is that HCl fully dissociates while acetic acid only partially dissociates." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.B"
  },
  {
    "id": "chem-mcq-8-030",
    "stimulus": { "type": "none" },
    "question": "The Henderson-Hasselbalch equation is $\\text{pH} = \\text{p}K_a + \\log\\dfrac{[\\text{A}^-]}{[\\text{HA}]}$. At the half-equivalence point of a weak acid titration, the pH equals:",
    "choices": [
      { "id": "A", "text": "7", "is_correct": false, "explanation": "pH = 7 at the equivalence point applies only to strong acid-strong base titrations, not weak acid titrations." },
      { "id": "B", "text": "$\\text{p}K_a + \\log(2)$", "is_correct": false, "explanation": "At the half-equivalence point, $[\\text{A}^-] = [\\text{HA}]$, so the log term equals $\\log(1) = 0$, not $\\log(2)$." },
      { "id": "C", "text": "$\\text{p}K_a$", "is_correct": true, "explanation": "At the half-equivalence point, half the acid has been neutralized, so $[\\text{A}^-] = [\\text{HA}]$. Substituting: $\\text{pH} = \\text{p}K_a + \\log(1) = \\text{p}K_a + 0 = \\text{p}K_a$." },
      { "id": "D", "text": "$\\text{p}K_b$", "is_correct": false, "explanation": "$\\text{p}K_b$ is the negative log of the base dissociation constant. pH at the half-equivalence point equals $\\text{p}K_a$ of the weak acid being titrated." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-031",
    "stimulus": {
      "type": "text",
      "content": "A buffer solution is prepared by mixing 0.20 mol of formic acid (HCOOH, pKa = 3.74) and 0.20 mol of sodium formate (HCOONa) in 1.0 L of water."
    },
    "question": "What is the pH of this buffer solution?",
    "choices": [
      { "id": "A", "text": "3.74", "is_correct": true, "explanation": "Using Henderson-Hasselbalch: $\\text{pH} = \\text{p}K_a + \\log([\\text{A}^-]/[\\text{HA}]) = 3.74 + \\log(0.20/0.20) = 3.74 + \\log(1) = 3.74$." },
      { "id": "B", "text": "7.00", "is_correct": false, "explanation": "pH = 7 would require equal concentrations of conjugate pairs with $\\text{p}K_a = 7$. Formic acid has $\\text{p}K_a = 3.74$." },
      { "id": "C", "text": "2.87", "is_correct": false, "explanation": "This is the pH of a 0.10 mol/L weak acid solution without buffer. Equal molar amounts of acid and conjugate base give pH = $\\text{p}K_a$." },
      { "id": "D", "text": "4.08", "is_correct": false, "explanation": "4.08 would result from an incorrect ratio. With equal moles of acid and conjugate base, the ratio is 1, $\\log(1) = 0$, giving pH = $\\text{p}K_a$." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-032",
    "stimulus": {
      "type": "text",
      "content": "A buffer contains 0.10 mol/L of a weak acid (HA) and 0.10 mol/L of its conjugate base (A-). A small amount of strong acid (HCl) is added to the buffer."
    },
    "question": "Which of the following best describes what happens when the strong acid is added?",
    "choices": [
      { "id": "A", "text": "The pH drops dramatically because HCl is a strong acid", "is_correct": false, "explanation": "A buffer resists pH changes. The conjugate base $\\text{A}^-$ reacts with the added $\\text{H}^+$: $\\text{A}^- + \\text{H}^+ \\rightarrow \\text{HA}$, absorbing the added acid and limiting pH change." },
      { "id": "B", "text": "The conjugate base reacts with the added $\\text{H}^+$, consuming it and limiting the pH decrease", "is_correct": true, "explanation": "Buffer action: $\\text{A}^- + \\text{H}^+ \\rightarrow \\text{HA}$. The conjugate base acts as a reservoir that neutralizes added acid, keeping pH nearly constant." },
      { "id": "C", "text": "The weak acid reacts with HCl, forming a neutral product", "is_correct": false, "explanation": "Acids do not react with each other. It is the conjugate base ($\\text{A}^-$) that reacts with the added $\\text{H}^+$ to resist pH change." },
      { "id": "D", "text": "The buffer neutralizes the HCl completely so pH does not change at all", "is_correct": false, "explanation": "Buffers resist but do not completely prevent pH changes. Adding acid shifts the ratio [A-]/[HA] slightly, causing a small decrease in pH." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-033",
    "stimulus": { "type": "none" },
    "question": "Which of the following pairs would make an effective buffer solution?",
    "choices": [
      { "id": "A", "text": "HCl and NaCl", "is_correct": false, "explanation": "HCl is a strong acid that dissociates completely; NaCl is a neutral salt. There is no weak acid/conjugate base pair to resist pH changes." },
      { "id": "B", "text": "$\\text{NH}_3$ and $\\text{NH}_4\\text{Cl}$", "is_correct": true, "explanation": "$\\text{NH}_3$ (weak base) and $\\text{NH}_4^+$ (its conjugate acid from $\\text{NH}_4\\text{Cl}$) form a buffer. NH3 neutralizes added acid; NH4+ neutralizes added base." },
      { "id": "C", "text": "NaOH and NaCl", "is_correct": false, "explanation": "NaOH is a strong base that dissociates completely. Without a conjugate acid, there is no weak acid/base pair to buffer pH changes." },
      { "id": "D", "text": "HCl and NaOH in equal moles", "is_correct": false, "explanation": "Mixing equal moles of strong acid and strong base produces NaCl and water - a neutral salt solution with no buffering capacity." }
    ],
    "difficulty": "easy",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-034",
    "stimulus": {
      "type": "text",
      "content": "A titration curve is plotted for the titration of 25.0 mL of 0.10 mol/L acetic acid (Ka = 1.8 x 10^-5) with 0.10 mol/L NaOH."
    },
    "question": "At the equivalence point of this titration, which of the following best predicts the pH?",
    "choices": [
      { "id": "A", "text": "pH = 7, because acid and base have fully neutralized each other", "is_correct": false, "explanation": "pH = 7 at the equivalence point applies only to strong acid-strong base titrations. Here, the equivalence point contains acetate ion ($\\text{CH}_3\\text{COO}^-$), a weak base that hydrolyzes to give basic pH." },
      { "id": "B", "text": "pH < 7, because excess acetic acid remains", "is_correct": false, "explanation": "At the equivalence point, no excess acetic acid remains - all of it has been neutralized by NaOH. The solution contains only sodium acetate." },
      { "id": "C", "text": "pH > 7, because the product (acetate ion) is a weak base that hydrolyzes water", "is_correct": true, "explanation": "At the equivalence point, all acetic acid has been converted to sodium acetate. The acetate ion ($\\text{CH}_3\\text{COO}^-$) hydrolyzes: $\\text{CH}_3\\text{COO}^- + \\text{H}_2\\text{O} \\rightleftharpoons \\text{CH}_3\\text{COOH} + \\text{OH}^-$, making the solution basic." },
      { "id": "D", "text": "pH = $\\text{p}K_a = 4.74$, because this is the defining point of the titration", "is_correct": false, "explanation": "pH = $\\text{p}K_a$ occurs at the half-equivalence point, not at the equivalence point." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-035",
    "stimulus": { "type": "none" },
    "question": "Sodium acetate ($\\text{CH}_3\\text{COONa}$) dissolves in water to produce a basic solution. Which of the following best explains this observation?",
    "choices": [
      { "id": "A", "text": "The sodium ion reacts with water to produce $\\text{OH}^-$ ions", "is_correct": false, "explanation": "Na+ is the cation of a strong base (NaOH) and is a spectator ion - it does not react with water or affect pH." },
      { "id": "B", "text": "The acetate ion is the conjugate base of a weak acid and accepts a proton from water, producing $\\text{OH}^-$", "is_correct": true, "explanation": "Acetate (weak conjugate base) hydrolyzes: $\\text{CH}_3\\text{COO}^- + \\text{H}_2\\text{O} \\rightleftharpoons \\text{CH}_3\\text{COOH} + \\text{OH}^-$. This increases $[\\text{OH}^-]$, making the solution basic." },
      { "id": "C", "text": "The acetate ion donates a proton to water, producing $\\text{H}_3\\text{O}^+$", "is_correct": false, "explanation": "Acetate is a base, not an acid; it accepts protons. Donating a proton would make the solution acidic, not basic." },
      { "id": "D", "text": "Sodium acetate is a strong electrolyte that increases ion concentration and therefore pH", "is_correct": false, "explanation": "Being a strong electrolyte means complete dissociation into ions, but that alone does not determine pH. The basicity comes from acetate ion hydrolysis." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.C"
  },
  {
    "id": "chem-mcq-8-036",
    "stimulus": {
      "type": "text",
      "content": "The following salts are each dissolved in water at the same concentration: NH4Cl, NaCl, NaCH3COO, AlCl3."
    },
    "question": "Which of the following correctly predicts the pH of each salt solution?",
    "choices": [
      { "id": "A", "text": "$\\text{NH}_4\\text{Cl}$ acidic; NaCl neutral; $\\text{NaCH}_3\\text{COO}$ basic; $\\text{AlCl}_3$ acidic", "is_correct": true, "explanation": "NH4+ (conjugate acid of weak base NH3) hydrolyzes to give acidic solution. NaCl (strong acid + strong base) is neutral. CH3COO- (conjugate base of weak acid) hydrolyzes to give basic solution. Al3+ (small, highly charged metal ion) hydrolyzes to give acidic solution." },
      { "id": "B", "text": "All salts produce neutral solutions because salts are ionic compounds", "is_correct": false, "explanation": "Salts from weak acid/base components undergo hydrolysis. Only salts from strong acid + strong base (like NaCl) are neutral." },
      { "id": "C", "text": "$\\text{NH}_4\\text{Cl}$ basic; NaCl neutral; $\\text{NaCH}_3\\text{COO}$ acidic; $\\text{AlCl}_3$ neutral", "is_correct": false, "explanation": "NH4Cl is acidic (NH4+ donates a proton), not basic. NaCH3COO is basic (CH3COO- accepts a proton), not acidic." },
      { "id": "D", "text": "All salts produce acidic solutions because dissolution releases ions into water", "is_correct": false, "explanation": "Only salts with acidic cations or basic anions produce non-neutral solutions. NaCl dissolves into Na+ and Cl-, both spectator ions, giving neutral pH." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.C"
  },
  {
    "id": "chem-mcq-8-037",
    "stimulus": { "type": "none" },
    "question": "Which of the following correctly compares the $K_a$ values of a strong acid and a weak acid?",
    "choices": [
      { "id": "A", "text": "Strong acids have $K_a < 1$; weak acids have $K_a > 1$", "is_correct": false, "explanation": "This is backwards. Strong acids have very large $K_a$ (essentially $\\gg 1$) because they dissociate completely; weak acids have $K_a \\ll 1$." },
      { "id": "B", "text": "Strong acids have $K_a \\gg 1$; weak acids have $K_a \\ll 1$", "is_correct": true, "explanation": "A large $K_a$ means the equilibrium strongly favors products (complete dissociation) - characteristic of strong acids. A small $K_a$ means partial dissociation - characteristic of weak acids." },
      { "id": "C", "text": "Strong acids have $K_a = 1$; weak acids have $K_a < 1$", "is_correct": false, "explanation": "Strong acids do not have $K_a = 1$; their $K_a$ is essentially undefined because they dissociate completely." },
      { "id": "D", "text": "$K_a$ values are the same for all acids at a given temperature", "is_correct": false, "explanation": "$K_a$ is an acid-specific constant. Different acids have different $K_a$ values at the same temperature." }
    ],
    "difficulty": "easy",
    "unit_objective": "8.B"
  },
  {
    "id": "chem-mcq-8-038",
    "stimulus": {
      "type": "text",
      "content": "A titration curve of a weak base with a strong acid is plotted. The curve shows a gradual change in pH, a buffering region, and a steep drop near the equivalence point."
    },
    "question": "At the equivalence point of this weak base-strong acid titration, which of the following correctly predicts the pH?",
    "choices": [
      { "id": "A", "text": "pH = 7, because the acid and base have fully reacted", "is_correct": false, "explanation": "pH = 7 at the equivalence point occurs only in strong acid-strong base titrations. Here, the conjugate acid of the weak base (e.g., NH4+) remains in solution and makes it acidic." },
      { "id": "B", "text": "pH > 7, because excess strong acid remains", "is_correct": false, "explanation": "At the equivalence point there is no excess strong acid. The slightly acidic pH comes from hydrolysis of the conjugate acid, not from unreacted HCl." },
      { "id": "C", "text": "pH < 7, because the conjugate acid of the weak base hydrolyzes to release $\\text{H}^+$", "is_correct": true, "explanation": "At the equivalence point, the weak base has been fully converted to its conjugate acid (e.g., $\\text{NH}_3 \\rightarrow \\text{NH}_4^+$). $\\text{NH}_4^+$ hydrolyzes: $\\text{NH}_4^+ \\rightleftharpoons \\text{NH}_3 + \\text{H}^+$, making the solution acidic." },
      { "id": "D", "text": "pH = $\\text{p}K_b$ of the weak base", "is_correct": false, "explanation": "pH at the equivalence point is not equal to $\\text{p}K_b$. The pH is determined by the $K_a$ of the conjugate acid." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-039",
    "stimulus": { "type": "none" },
    "question": "Phosphoric acid ($\\text{H}_3\\text{PO}_4$) is a triprotic acid with $K_{a1} \\gg K_{a2} \\gg K_{a3}$. Which of the following best explains this pattern?",
    "choices": [
      { "id": "A", "text": "Each successive dissociation removes a proton from an increasingly negative ion, making removal progressively harder", "is_correct": true, "explanation": "After losing each $\\text{H}^+$, the ion becomes more negatively charged: $\\text{H}_3\\text{PO}_4 \\rightarrow \\text{H}_2\\text{PO}_4^- \\rightarrow \\text{HPO}_4^{2-} \\rightarrow \\text{PO}_4^{3-}$. Removing a proton from an increasingly negative species requires more energy, so each $K_a$ is smaller." },
      { "id": "B", "text": "Each successive $K_a$ is smaller because the acid becomes weaker as concentration decreases during titration", "is_correct": false, "explanation": "$K_a$ values are intrinsic properties of the acid, not dependent on concentration. The decreasing $K_a$ reflects increasing charge on the anion, not changing concentration." },
      { "id": "C", "text": "The three protons in $\\text{H}_3\\text{PO}_4$ have equal dissociation constants because they are all H-O bonds", "is_correct": false, "explanation": "Although all three are O-H bonds, the electrostatic environment around each proton changes with each ionization step, leading to very different $K_a$ values." },
      { "id": "D", "text": "The decreasing $K_a$ pattern is unique to phosphoric acid and does not apply to other polyprotic acids", "is_correct": false, "explanation": "Decreasing successive $K_a$ values is a general feature of all polyprotic acids, including $\\text{H}_2\\text{SO}_4$, $\\text{H}_2\\text{CO}_3$, and others." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.B"
  },
  {
    "id": "chem-mcq-8-040",
    "stimulus": {
      "type": "text",
      "content": "A chemistry student prepares four aqueous solutions at 25 degrees C: (1) 0.10 mol/L HCl, (2) 0.10 mol/L HNO3, (3) 0.10 mol/L HF (Ka = 7.2 x 10^-4), (4) 0.10 mol/L CH3COOH (Ka = 1.8 x 10^-5)."
    },
    "question": "Which of the following correctly ranks the solutions from lowest to highest pH?",
    "choices": [
      { "id": "A", "text": "HCl = $\\text{HNO}_3$ < HF < $\\text{CH}_3\\text{COOH}$", "is_correct": true, "explanation": "HCl and HNO3 (strong acids) fully dissociate giving pH = 1 each. HF is a stronger weak acid ($K_a = 7.2 \\times 10^{-4}$) giving lower pH than acetic acid ($K_a = 1.8 \\times 10^{-5}$). Ranking lowest to highest pH: HCl = HNO3 < HF < CH3COOH." },
      { "id": "B", "text": "$\\text{CH}_3\\text{COOH}$ < HF < HCl = $\\text{HNO}_3$", "is_correct": false, "explanation": "This is reversed. Strong acids (HCl, HNO3) have the lowest pH (highest H+ concentration) due to complete dissociation, not the weakest acids." },
      { "id": "C", "text": "HF < $\\text{CH}_3\\text{COOH}$ < HCl < $\\text{HNO}_3$", "is_correct": false, "explanation": "HCl and HNO3 are both strong acids at equal concentration, so they have the same (lowest) pH. And they have lower pH than either weak acid." },
      { "id": "D", "text": "All four solutions have the same pH because they have the same concentration", "is_correct": false, "explanation": "Same concentration does not mean same pH. Strong acids dissociate 100%, giving much more H+ than weak acids at the same molarity." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.B"
  },
  {
    "id": "chem-mcq-8-041",
    "stimulus": { "type": "none" },
    "question": "A solution has $[\\text{OH}^-] = 1.0 \\times 10^{-4}$ mol/L at 25 degrees C. What is the pH of this solution?",
    "choices": [
      { "id": "A", "text": "4", "is_correct": false, "explanation": "pH = 4 corresponds to pOH = 10, meaning $[\\text{OH}^-] = 10^{-10}$ mol/L - much lower than $10^{-4}$ mol/L." },
      { "id": "B", "text": "10", "is_correct": true, "explanation": "pOH = $-\\log(1.0 \\times 10^{-4}) = 4$. pH = 14 - pOH = 14 - 4 = 10. The solution is basic (pH > 7) because $[\\text{OH}^-]$ exceeds $[\\text{H}^+]$." },
      { "id": "C", "text": "14", "is_correct": false, "explanation": "pH = 14 corresponds to $[\\text{OH}^-] = 1.0$ mol/L, a 1.0 mol/L strong base solution - much more basic than $10^{-4}$ mol/L." },
      { "id": "D", "text": "7", "is_correct": false, "explanation": "pH = 7 is neutral, meaning $[\\text{OH}^-] = [\\text{H}^+] = 10^{-7}$ mol/L. A solution with $[\\text{OH}^-] = 10^{-4}$ mol/L is basic (pH = 10)." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.A"
  },
  {
    "id": "chem-mcq-8-042",
    "stimulus": {
      "type": "text",
      "content": "A student titrates 50.0 mL of 0.10 mol/L weak acid HA (Ka = 1.0 x 10^-5) with 0.10 mol/L NaOH. The titration is monitored with a pH meter."
    },
    "question": "At what volume of added NaOH does the buffer region of this titration reach its maximum buffering capacity?",
    "choices": [
      { "id": "A", "text": "0 mL, before any NaOH is added", "is_correct": false, "explanation": "Before NaOH is added, there is only weak acid - no conjugate base present. Buffer capacity requires both weak acid and conjugate base components." },
      { "id": "B", "text": "25.0 mL (half-equivalence point)", "is_correct": true, "explanation": "Maximum buffer capacity occurs when $[\\text{HA}] = [\\text{A}^-]$, at the half-equivalence point. Here, 25.0 mL of NaOH converts exactly half the acid to conjugate base." },
      { "id": "C", "text": "50.0 mL (equivalence point)", "is_correct": false, "explanation": "At the equivalence point, all the weak acid has been converted to conjugate base. There is no weak acid remaining, so there is no buffer capacity." },
      { "id": "D", "text": "100.0 mL, after the equivalence point", "is_correct": false, "explanation": "After the equivalence point, excess strong base (NaOH) dominates. Buffer capacity is destroyed because the weak acid component has been exhausted." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-043",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes the relationship between $K_a$ and $K_b$ for a conjugate acid-base pair at 25 degrees C?",
    "choices": [
      { "id": "A", "text": "$K_a + K_b = K_w$", "is_correct": false, "explanation": "The relationship involves multiplication, not addition: $K_a \\times K_b = K_w = 1.0 \\times 10^{-14}$ at 25 degrees C." },
      { "id": "B", "text": "$K_a \\times K_b = K_w = 1.0 \\times 10^{-14}$", "is_correct": true, "explanation": "For any conjugate acid-base pair, the product of $K_a$ and $K_b$ always equals $K_w$ at 25 degrees C. This allows calculation of $K_b$ from $K_a$: $K_b = K_w / K_a$." },
      { "id": "C", "text": "$K_a = K_b$ for any conjugate pair", "is_correct": false, "explanation": "$K_a = K_b$ only when both equal $\\sqrt{K_w} = 10^{-7}$. In general, $K_a \\neq K_b$ for a conjugate pair; their product equals $K_w$." },
      { "id": "D", "text": "$K_a / K_b = K_w$", "is_correct": false, "explanation": "Division of $K_a$ by $K_b$ does not equal $K_w$ in general. The correct relationship is $K_a \\times K_b = K_w$." }
    ],
    "difficulty": "easy",
    "unit_objective": "8.B"
  },
  {
    "id": "chem-mcq-8-044",
    "stimulus": {
      "type": "text",
      "content": "Sulfuric acid (H2SO4) is a diprotic acid. The first dissociation is complete (strong acid behavior): H2SO4 -> H+ + HSO4-. The second dissociation is partial: HSO4- <-> H+ + SO4(2-), Ka2 = 1.2 x 10^-2."
    },
    "question": "For a dilute 0.010 mol/L $\\text{H}_2\\text{SO}_4$ solution, which of the following is most accurate about the pH?",
    "choices": [
      { "id": "A", "text": "pH = 2.0 exactly, from the first dissociation only", "is_correct": false, "explanation": "The first dissociation gives $[\\text{H}^+] = 0.010$ mol/L, pH = 2.0. However, $K_{a2} = 0.012$ is significant at this low concentration and the second dissociation provides additional $\\text{H}^+$, lowering pH below 2.0." },
      { "id": "B", "text": "pH < 2.0, because the second dissociation provides additional $\\text{H}^+$ ions", "is_correct": true, "explanation": "At 0.010 mol/L, $K_{a2} = 0.012$ is comparable to the concentration, so the second dissociation is significant. Total $[\\text{H}^+]$ exceeds 0.010 mol/L, giving pH < 2.0." },
      { "id": "C", "text": "pH > 2.0, because partial dissociation of $\\text{HSO}_4^-$ reduces total $\\text{H}^+$ concentration", "is_correct": false, "explanation": "The second dissociation adds more $\\text{H}^+$ ions - it does not reduce $[\\text{H}^+]$. pH is lower, not higher, than 2.0." },
      { "id": "D", "text": "pH = 1.0, because $\\text{H}_2\\text{SO}_4$ always produces twice as many protons as HCl at the same concentration", "is_correct": false, "explanation": "pH = 1.0 would require $[\\text{H}^+] = 0.10$ mol/L. The first dissociation gives only 0.010 mol/L $\\text{H}^+$; even with the second step, $[\\text{H}^+]$ does not reach 0.10 mol/L at this dilution." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.B"
  },
  {
    "id": "chem-mcq-8-045",
    "stimulus": { "type": "none" },
    "question": "Which of the following correctly identifies an amphoteric species?",
    "choices": [
      { "id": "A", "text": "$\\text{H}_2\\text{O}$ only", "is_correct": false, "explanation": "Water is amphoteric, but it is not the only amphoteric species. $\\text{HCO}_3^-$, $\\text{HSO}_4^-$, and $\\text{H}_2\\text{PO}_4^-$ are also amphoteric." },
      { "id": "B", "text": "$\\text{Cl}^-$, because it can combine with or release $\\text{H}^+$", "is_correct": false, "explanation": "Cl- is the conjugate base of the strong acid HCl. It does not react with water and is not amphoteric - it is a spectator ion in aqueous solution." },
      { "id": "C", "text": "$\\text{HCO}_3^-$, because it can donate a proton (to become $\\text{CO}_3^{2-}$) or accept a proton (to become $\\text{H}_2\\text{CO}_3$)", "is_correct": true, "explanation": "An amphoteric species can act as both an acid and a base. $\\text{HCO}_3^-$ donates $\\text{H}^+$ to become $\\text{CO}_3^{2-}$ (acting as acid) or accepts $\\text{H}^+$ to become $\\text{H}_2\\text{CO}_3$ (acting as base)." },
      { "id": "D", "text": "$\\text{NaOH}$, because it contains both Na+ and OH- ions", "is_correct": false, "explanation": "NaOH is a strong base only - Na+ is a spectator and OH- only accepts protons. NaOH cannot donate protons, so it is not amphoteric." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.A"
  },
  {
    "id": "chem-mcq-8-046",
    "stimulus": {
      "type": "text",
      "content": "A chemistry student compares two buffer solutions: Buffer I contains 0.50 mol/L acetic acid and 0.50 mol/L sodium acetate. Buffer II contains 0.050 mol/L acetic acid and 0.050 mol/L sodium acetate."
    },
    "question": "Which of the following correctly compares the pH and buffering capacity of the two solutions?",
    "choices": [
      { "id": "A", "text": "Buffer I has a higher pH than Buffer II; Buffer I has greater buffering capacity", "is_correct": false, "explanation": "Both buffers have the same [A-]/[HA] ratio = 1, giving identical pH = pKa = 4.74. Only buffering capacity differs." },
      { "id": "B", "text": "Both buffers have the same pH; Buffer I has greater buffering capacity because it contains more moles of buffer components", "is_correct": true, "explanation": "pH depends only on the ratio [A-]/[HA] (both = 1 here), so pH = pKa = 4.74 for both. Buffering capacity depends on absolute amounts; Buffer I has 10x more buffer components, so it can resist more added acid or base." },
      { "id": "C", "text": "Buffer II has a higher pH because dilute solutions are more basic", "is_correct": false, "explanation": "Dilution does not change pH for a buffer with equal concentrations of weak acid and conjugate base - the ratio [A-]/[HA] stays constant at 1. pH = pKa regardless of concentration." },
      { "id": "D", "text": "Both buffers have the same pH and the same buffering capacity because they have the same pKa", "is_correct": false, "explanation": "Same pKa means same pH because the ratio is also identical. However, buffering capacity depends on the number of moles of each component. Buffer I has greater capacity." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-047",
    "stimulus": { "type": "none" },
    "question": "Hydrochloric acid (HCl) has a much larger $K_a$ than hydrofluoric acid (HF). What structural difference best explains the greater acid strength of HCl?",
    "choices": [
      { "id": "A", "text": "The H-Cl bond is weaker than the H-F bond, making it easier to break and release $\\text{H}^+$", "is_correct": true, "explanation": "Bond enthalpy of H-F (~567 kJ/mol) is much greater than H-Cl (~432 kJ/mol). The stronger H-F bond requires more energy to break, so HF donates H+ much less readily than HCl, making HCl the stronger acid." },
      { "id": "B", "text": "Cl has a higher electronegativity than F, increasing the polarity of the H-Cl bond", "is_correct": false, "explanation": "F is more electronegative than Cl (F: 4.0, Cl: 3.0). The greater polarity of H-F would suggest it should be a stronger acid, but the H-F bond strength dominates for these binary acids." },
      { "id": "C", "text": "HCl has a higher molar mass, making it more soluble in water", "is_correct": false, "explanation": "Molar mass and solubility do not determine acid strength. HCl's greater acid strength relative to HF is due to bond strength." },
      { "id": "D", "text": "HCl molecules form stronger hydrogen bonds with water, facilitating ionization", "is_correct": false, "explanation": "HF actually forms stronger hydrogen bonds with water than HCl. Yet HCl is the stronger acid because the weaker H-Cl bond is easier to break." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.B"
  },
  {
    "id": "chem-mcq-8-048",
    "stimulus": {
      "type": "text",
      "content": "A buffer solution has pH = 5.00 and is prepared using acetic acid (Ka = 1.8 x 10^-5, pKa = 4.74) and sodium acetate."
    },
    "question": "What is the ratio $[\\text{CH}_3\\text{COO}^-]/[\\text{CH}_3\\text{COOH}]$ in this buffer?",
    "choices": [
      { "id": "A", "text": "1.82", "is_correct": true, "explanation": "Using Henderson-Hasselbalch: $5.00 = 4.74 + \\log([\\text{A}^-]/[\\text{HA}])$; $\\log([\\text{A}^-]/[\\text{HA}]) = 0.26$; $[\\text{A}^-]/[\\text{HA}] = 10^{0.26} \\approx 1.82$. Since pH > pKa, conjugate base dominates." },
      { "id": "B", "text": "0.55", "is_correct": false, "explanation": "A ratio of 0.55 means [HA] > [A-], which gives pH < pKa. Since pH (5.00) > pKa (4.74), the conjugate base must exceed the acid." },
      { "id": "C", "text": "1.00", "is_correct": false, "explanation": "A ratio of 1.00 gives pH = pKa = 4.74. The buffer pH is 5.00, higher than pKa, so the conjugate base exceeds the acid and the ratio is greater than 1." },
      { "id": "D", "text": "3.46", "is_correct": false, "explanation": "$10^{0.26} \\approx 1.82$, not 3.46. A ratio of 3.46 would give $\\log(3.46) \\approx 0.54$, meaning pH = 4.74 + 0.54 = 5.28, not 5.00." }
    ],
    "difficulty": "hard",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-049",
    "stimulus": { "type": "none" },
    "question": "Which of the following correctly predicts whether a 0.10 mol/L solution of ammonium chloride ($\\text{NH}_4\\text{Cl}$) is acidic, basic, or neutral?",
    "choices": [
      { "id": "A", "text": "Neutral, because NH4Cl contains both a cation and anion that cancel each other", "is_correct": false, "explanation": "Charge neutrality does not imply pH neutrality. The NH4+ cation is a weak acid (conjugate acid of the weak base NH3) that hydrolyzes water to give H+, making the solution acidic." },
      { "id": "B", "text": "Basic, because Cl- is a base that reacts with water to produce OH-", "is_correct": false, "explanation": "Cl- is the conjugate base of the strong acid HCl. It is too weak a base to accept protons from water and does not affect pH." },
      { "id": "C", "text": "Acidic, because $\\text{NH}_4^+$ is the conjugate acid of a weak base and donates $\\text{H}^+$ to water", "is_correct": true, "explanation": "$\\text{NH}_4^+ \\rightleftharpoons \\text{NH}_3 + \\text{H}^+$ - NH4+ donates a proton to water because NH3 is a weak base. This hydrolysis increases $[\\text{H}^+]$, giving an acidic solution." },
      { "id": "D", "text": "Basic, because NH4Cl contains nitrogen, which is always basic in solution", "is_correct": false, "explanation": "Not all nitrogen-containing species are basic in solution. NH4+ is acidic; the acidity or basicity depends on whether the ion accepts or donates protons." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.C"
  },
  {
    "id": "chem-mcq-8-050",
    "stimulus": {
      "type": "text",
      "content": "A student adds 10.0 mL of 0.10 mol/L HCl to 100.0 mL of a buffer made of 0.10 mol/L acetic acid (Ka = 1.8 x 10^-5) and 0.10 mol/L sodium acetate."
    },
    "question": "Which of the following best predicts the effect of adding the HCl on the buffer pH?",
    "choices": [
      { "id": "A", "text": "pH decreases slightly as some acetate ion is converted to acetic acid by the added $\\text{H}^+$", "is_correct": true, "explanation": "Reaction: $\\text{CH}_3\\text{COO}^- + \\text{H}^+ \\rightarrow \\text{CH}_3\\text{COOH}$. This converts some $\\text{A}^-$ to HA, decreasing the [A-]/[HA] ratio and slightly lowering pH per Henderson-Hasselbalch." },
      { "id": "B", "text": "pH drops dramatically to below 2", "is_correct": false, "explanation": "The buffer resists dramatic pH change. Only a small amount of HCl (0.001 mol) is added relative to 0.010 mol each of acetic acid and acetate; the buffer absorbs it without dramatic change." },
      { "id": "C", "text": "pH increases because acetic acid neutralizes the HCl", "is_correct": false, "explanation": "Adding acid (HCl) always decreases pH, never increases it. The acetate ion reacts with the added H+, limiting the decrease but not reversing it." },
      { "id": "D", "text": "pH remains exactly the same because buffers are immune to acid addition", "is_correct": false, "explanation": "Buffers resist but do not completely prevent pH changes. The addition of HCl shifts the acid-base ratio slightly, causing a small, measurable decrease in pH." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.D"
  },
  {
    "id": "chem-mcq-8-051",
    "stimulus": { "type": "none" },
    "question": "A Lewis acid is best defined as a species that:",
    "choices": [
      { "id": "A", "text": "Donates a proton ($\\text{H}^+$) to a base", "is_correct": false, "explanation": "Donating a proton is the Bronsted-Lowry acid definition. The Lewis definition is broader and does not require proton transfer." },
      { "id": "B", "text": "Accepts an electron pair from a Lewis base", "is_correct": true, "explanation": "A Lewis acid accepts an electron pair from a Lewis base to form a coordinate covalent bond. This extends acid-base theory beyond proton transfer - e.g., BF3 and Al3+ are Lewis acids that accept electron pairs." },
      { "id": "C", "text": "Produces $\\text{H}^+$ ions when dissolved in water", "is_correct": false, "explanation": "This is the Arrhenius acid definition. The Lewis definition applies even in non-aqueous systems and does not require water or H+ production." },
      { "id": "D", "text": "Donates an electron pair to a Lewis acid", "is_correct": false, "explanation": "Donating an electron pair is the definition of a Lewis base, not a Lewis acid. Lewis acid = electron pair acceptor; Lewis base = electron pair donor." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.A"
  },
  {
    "id": "chem-mcq-8-052",
    "stimulus": {
      "type": "text",
      "content": "A 0.10 mol/L solution of a weak acid has a pH of 3.0. Another 0.10 mol/L solution of a different weak acid has a pH of 4.0."
    },
    "question": "Which of the following correctly compares the Ka values of the two acids?",
    "choices": [
      { "id": "A", "text": "The acid with pH 3.0 has a larger $K_a$ because lower pH means more $\\text{H}^+$ produced (greater dissociation)", "is_correct": true, "explanation": "Lower pH at the same concentration means more $[\\text{H}^+]$, which means more dissociation and larger Ka. The acid with pH 3.0 has $[\\text{H}^+] = 10^{-3}$ mol/L vs. $10^{-4}$ mol/L for pH 4.0, so its Ka is larger." },
      { "id": "B", "text": "The acid with pH 4.0 has a larger $K_a$ because higher pH means a stronger acid", "is_correct": false, "explanation": "Higher pH means lower $[\\text{H}^+]$, indicating less dissociation and a weaker acid (smaller Ka). Lower pH corresponds to stronger (more dissociated) weak acid." },
      { "id": "C", "text": "Both acids have equal $K_a$ values because they have the same concentration", "is_correct": false, "explanation": "Same concentration does not give the same Ka. Ka is an intrinsic acid property; different Ka values can exist at any shared concentration." },
      { "id": "D", "text": "$K_a$ cannot be compared from pH data alone", "is_correct": false, "explanation": "Ka can be estimated from pH and concentration: $K_a \\approx [\\text{H}^+]^2/C$ for a weak acid. Lower pH at equal concentration directly indicates a larger Ka." }
    ],
    "difficulty": "medium",
    "unit_objective": "8.B"
  }
];

u8.questions = u8.questions.concat(newQuestions);
fs.writeFileSync('public/data/ap-chemistry/mcq/unit-8.json', JSON.stringify(u8, null, 2));
console.log('unit-8 MCQ questions now:', u8.questions.length);
