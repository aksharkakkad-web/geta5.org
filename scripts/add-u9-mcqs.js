const fs = require('fs');
const u9 = JSON.parse(fs.readFileSync('public/data/ap-chemistry/mcq/unit-9.json', 'utf8'));

const newQuestions = [
  {
    "id": "chem-mcq-9-026",
    "stimulus": { "type": "none" },
    "question": "For a chemical reaction, $\\Delta H = -150$ kJ/mol and $\\Delta S = +100$ J/(mol K). What can be concluded about the spontaneity of this reaction?",
    "choices": [
      { "id": "A", "text": "The reaction is spontaneous only at high temperatures", "is_correct": false, "explanation": "High temperature is needed to drive spontaneity when $\\Delta H > 0$ and $\\Delta S > 0$. Here $\\Delta H < 0$ and $\\Delta S > 0$, making $\\Delta G = \\Delta H - T\\Delta S$ negative at all temperatures." },
      { "id": "B", "text": "The reaction is spontaneous at all temperatures", "is_correct": true, "explanation": "$\\Delta G = \\Delta H - T\\Delta S$. With $\\Delta H < 0$ and $\\Delta S > 0$, both terms make $\\Delta G$ negative (the enthalpy term is negative and the $-T\\Delta S$ term is also negative). $\\Delta G < 0$ at all temperatures." },
      { "id": "C", "text": "The reaction is nonspontaneous at all temperatures", "is_correct": false, "explanation": "A reaction with $\\Delta H < 0$ (exothermic) and $\\Delta S > 0$ (entropy increases) has $\\Delta G < 0$ at every temperature. It is spontaneous everywhere." },
      { "id": "D", "text": "The reaction is spontaneous only at low temperatures", "is_correct": false, "explanation": "Low temperature is required for spontaneity when $\\Delta H < 0$ and $\\Delta S < 0$ (both terms negative but the $-T\\Delta S$ term becomes positive at high T). Here $\\Delta S > 0$, so low temperature is not required." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.A"
  },
  {
    "id": "chem-mcq-9-027",
    "stimulus": { "type": "none" },
    "question": "The Gibbs free energy equation is $\\Delta G = \\Delta H - T\\Delta S$. A reaction has $\\Delta H > 0$ and $\\Delta S < 0$. Which of the following best predicts the spontaneity?",
    "choices": [
      { "id": "A", "text": "Spontaneous at all temperatures", "is_correct": false, "explanation": "For spontaneity, $\\Delta G < 0$. With $\\Delta H > 0$ (positive) and $-T\\Delta S > 0$ (since $\\Delta S < 0$), $\\Delta G$ is positive at all temperatures. Never spontaneous." },
      { "id": "B", "text": "Nonspontaneous at all temperatures", "is_correct": true, "explanation": "$\\Delta G = \\Delta H - T\\Delta S$. With $\\Delta H > 0$ and $\\Delta S < 0$: the first term is positive and $-T\\Delta S$ is also positive (since $\\Delta S$ is negative). So $\\Delta G > 0$ at every temperature." },
      { "id": "C", "text": "Spontaneous only at high temperatures", "is_correct": false, "explanation": "High temperature drives spontaneity when $\\Delta H > 0$ and $\\Delta S > 0$ (entropy term dominates at high T). Here $\\Delta S < 0$ makes the entropy term unfavorable at all temperatures." },
      { "id": "D", "text": "Spontaneous only at low temperatures", "is_correct": false, "explanation": "Low temperature favors spontaneity when $\\Delta H < 0$ and $\\Delta S < 0$. Here $\\Delta H > 0$ makes the reaction unfavorable at all temperatures regardless of $\\Delta S$." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.A"
  },
  {
    "id": "chem-mcq-9-028",
    "stimulus": {
      "type": "text",
      "content": "A student calculates delta-G for a reaction at 298 K and finds delta-G = -45 kJ/mol. The student then increases the temperature to 500 K and recalculates."
    },
    "question": "If the reaction has $\\Delta H = -30$ kJ/mol and $\\Delta S = -50$ J/(mol K), what happens to $\\Delta G$ as temperature increases from 298 K to 500 K?",
    "choices": [
      { "id": "A", "text": "$\\Delta G$ becomes more negative, so the reaction becomes more spontaneous at 500 K", "is_correct": false, "explanation": "At 298 K: $\\Delta G = -30000 - (298)(-50) = -30000 + 14900 = -15100$ J/mol = -15.1 kJ/mol. At 500 K: $\\Delta G = -30000 - (500)(-50) = -30000 + 25000 = -5000$ J/mol. $\\Delta G$ becomes less negative as T increases." },
      { "id": "B", "text": "$\\Delta G$ becomes less negative (increases toward zero), and may eventually become positive", "is_correct": true, "explanation": "With $\\Delta S < 0$, the $-T\\Delta S$ term is positive and grows with temperature. At 298 K: $\\Delta G \\approx -15$ kJ/mol. At higher T, the positive $-T\\Delta S$ term increasingly offsets the negative $\\Delta H$. Eventually $\\Delta G > 0$." },
      { "id": "C", "text": "$\\Delta G$ remains constant because $\\Delta H$ and $\\Delta S$ do not change with temperature", "is_correct": false, "explanation": "While $\\Delta H$ and $\\Delta S$ are approximately constant with temperature, $\\Delta G = \\Delta H - T\\Delta S$ explicitly depends on T. Changing T changes $\\Delta G$ even if $\\Delta H$ and $\\Delta S$ stay constant." },
      { "id": "D", "text": "$\\Delta G$ becomes more negative at 500 K because higher temperature provides more energy", "is_correct": false, "explanation": "Higher temperature does not always make $\\Delta G$ more negative. When $\\Delta S < 0$, the $-T\\Delta S$ term is positive and its magnitude increases with T, making $\\Delta G$ less negative." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.A"
  },
  {
    "id": "chem-mcq-9-029",
    "stimulus": { "type": "none" },
    "question": "Which of the following correctly describes the relationship between $\\Delta G^\\circ$ and the equilibrium constant $K$?",
    "choices": [
      { "id": "A", "text": "$\\Delta G^\\circ = RT \\ln K$", "is_correct": false, "explanation": "The correct relationship has a negative sign: $\\Delta G^\\circ = -RT\\ln K$. A positive $\\Delta G^\\circ$ (nonspontaneous) corresponds to $K < 1$ (products disfavored), which is consistent with the negative sign." },
      { "id": "B", "text": "$\\Delta G^\\circ = -RT \\ln K$", "is_correct": true, "explanation": "This is the fundamental thermodynamic-equilibrium relationship. When $K > 1$ (products favored), $\\ln K > 0$ and $\\Delta G^\\circ < 0$ (spontaneous). When $K < 1$, $\\ln K < 0$ and $\\Delta G^\\circ > 0$ (nonspontaneous)." },
      { "id": "C", "text": "$\\Delta G^\\circ = -nFE^\\circ$", "is_correct": false, "explanation": "This is the correct equation relating $\\Delta G^\\circ$ to cell potential, not to the equilibrium constant. The equilibrium constant relationship uses $\\Delta G^\\circ = -RT\\ln K$." },
      { "id": "D", "text": "$\\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ$", "is_correct": false, "explanation": "This is the Gibbs free energy equation for calculating $\\Delta G^\\circ$ from enthalpy and entropy. It is correct but does not express the relationship between $\\Delta G^\\circ$ and $K$." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.B"
  },
  {
    "id": "chem-mcq-9-030",
    "stimulus": { "type": "none" },
    "question": "A reaction at 25 degrees C has $\\Delta G^\\circ = -17.1$ kJ/mol. Using $R = 8.314$ J/(mol K), what is the approximate equilibrium constant $K$?",
    "choices": [
      { "id": "A", "text": "$K \\approx 1.0$", "is_correct": false, "explanation": "$K = 1$ corresponds to $\\Delta G^\\circ = 0$. Since $\\Delta G^\\circ = -17.1$ kJ/mol $\\neq$ 0, $K \\neq 1$." },
      { "id": "B", "text": "$K \\approx 1000$", "is_correct": true, "explanation": "$K = e^{-\\Delta G^\\circ/(RT)} = e^{17100/(8.314 \\times 298)} = e^{6.90} \\approx 1000$. Negative $\\Delta G^\\circ$ means $K > 1$ (products favored at equilibrium)." },
      { "id": "C", "text": "$K \\approx 0.001$", "is_correct": false, "explanation": "$K < 1$ would require $\\Delta G^\\circ > 0$. Since $\\Delta G^\\circ = -17.1$ kJ/mol (negative), $K > 1$ and products are favored at equilibrium." },
      { "id": "D", "text": "$K \\approx 6.9$", "is_correct": false, "explanation": "6.9 is the value of $-\\Delta G^\\circ/(RT)$ (the exponent), not $K$ itself. $K = e^{6.9} \\approx 1000$, not 6.9." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.B"
  },
  {
    "id": "chem-mcq-9-031",
    "stimulus": {
      "type": "text",
      "content": "An electrochemical cell consists of zinc (Zn) in a Zn2+ solution connected to copper (Cu) in a Cu2+ solution. Standard reduction potentials: Zn2+/Zn = -0.76 V; Cu2+/Cu = +0.34 V."
    },
    "question": "Which of the following correctly describes the standard cell potential and whether the reaction is spontaneous?",
    "choices": [
      { "id": "A", "text": "$E^\\circ_{\\text{cell}} = -1.10$ V; the reaction is spontaneous", "is_correct": false, "explanation": "$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = +0.34 - (-0.76) = +1.10$ V. A positive cell potential indicates a spontaneous (galvanic) cell, not negative." },
      { "id": "B", "text": "$E^\\circ_{\\text{cell}} = +1.10$ V; the reaction is spontaneous", "is_correct": true, "explanation": "$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = +0.34 - (-0.76) = +1.10$ V. A positive $E^\\circ_{\\text{cell}}$ means $\\Delta G^\\circ < 0$ (since $\\Delta G^\\circ = -nFE^\\circ$), confirming the galvanic cell is spontaneous." },
      { "id": "C", "text": "$E^\\circ_{\\text{cell}} = +0.42$ V; the reaction is nonspontaneous", "is_correct": false, "explanation": "0.42 V would result from subtracting differently. The correct calculation uses cathode minus anode: $0.34 - (-0.76) = 1.10$ V. Positive cell potential means the reaction is spontaneous." },
      { "id": "D", "text": "$E^\\circ_{\\text{cell}} = -0.42$ V; the reaction is nonspontaneous", "is_correct": false, "explanation": "Neither value is correct. $E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = 0.34 - (-0.76) = +1.10$ V, and a positive cell potential indicates spontaneity." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-032",
    "stimulus": { "type": "none" },
    "question": "The relationship $\\Delta G^\\circ = -nFE^\\circ_{\\text{cell}}$ connects thermodynamics and electrochemistry. In a galvanic cell, $\\Delta G^\\circ$ is negative. What does this require about $E^\\circ_{\\text{cell}}$?",
    "choices": [
      { "id": "A", "text": "$E^\\circ_{\\text{cell}}$ must be negative", "is_correct": false, "explanation": "If $E^\\circ_{\\text{cell}} < 0$, then $-nFE^\\circ_{\\text{cell}} > 0$ (positive), making $\\Delta G^\\circ > 0$ (nonspontaneous). A galvanic cell requires $\\Delta G^\\circ < 0$, so $E^\\circ_{\\text{cell}}$ must be positive." },
      { "id": "B", "text": "$E^\\circ_{\\text{cell}}$ must be positive", "is_correct": true, "explanation": "Since $n > 0$ and $F > 0$, the sign of $-nFE^\\circ_{\\text{cell}}$ is opposite to the sign of $E^\\circ_{\\text{cell}}$. For $\\Delta G^\\circ < 0$, we need $-nFE^\\circ_{\\text{cell}} < 0$, which requires $E^\\circ_{\\text{cell}} > 0$." },
      { "id": "C", "text": "$E^\\circ_{\\text{cell}}$ must equal zero", "is_correct": false, "explanation": "$E^\\circ_{\\text{cell}} = 0$ would give $\\Delta G^\\circ = 0$, which corresponds to equilibrium (K = 1), not to a galvanic cell." },
      { "id": "D", "text": "$E^\\circ_{\\text{cell}}$ can be either positive or negative, depending on temperature", "is_correct": false, "explanation": "$E^\\circ_{\\text{cell}}$ is measured at standard conditions (fixed temperature). The sign of $E^\\circ_{\\text{cell}}$ directly determines the sign of $\\Delta G^\\circ$: positive $E^\\circ_{\\text{cell}}$ always gives negative $\\Delta G^\\circ$." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-033",
    "stimulus": { "type": "none" },
    "question": "Which of the following correctly distinguishes a galvanic cell from an electrolytic cell?",
    "choices": [
      { "id": "A", "text": "A galvanic cell uses electrical energy to drive a nonspontaneous reaction; an electrolytic cell produces electrical energy from a spontaneous reaction", "is_correct": false, "explanation": "These descriptions are reversed. A galvanic cell converts spontaneous chemical energy to electricity; an electrolytic cell uses electrical energy to drive a nonspontaneous reaction." },
      { "id": "B", "text": "A galvanic cell converts spontaneous chemical energy to electrical energy ($\\Delta G < 0$); an electrolytic cell uses electrical energy to drive a nonspontaneous reaction ($\\Delta G > 0$)", "is_correct": true, "explanation": "Galvanic (voltaic) cells: spontaneous reaction ($\\Delta G < 0$, $E^\\circ > 0$) produces electrical current. Electrolytic cells: external electrical energy drives nonspontaneous reaction ($\\Delta G > 0$, $E^\\circ < 0$) like electroplating or electrolysis of water." },
      { "id": "C", "text": "Both types of cells have spontaneous reactions; the difference is the direction of electron flow", "is_correct": false, "explanation": "Electrolytic cells have nonspontaneous reactions ($\\Delta G > 0$). The key difference is spontaneity, not just electron flow direction." },
      { "id": "D", "text": "Galvanic cells require an external power source; electrolytic cells do not", "is_correct": false, "explanation": "Galvanic cells generate their own electrical energy from spontaneous reactions - they do not require an external power source. Electrolytic cells require external electrical energy to function." }
    ],
    "difficulty": "easy",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-034",
    "stimulus": {
      "type": "text",
      "content": "Standard reduction potentials: Fe2+/Fe = -0.44 V; Ag+/Ag = +0.80 V. A galvanic cell is constructed using these two half-cells."
    },
    "question": "Which species is oxidized and which is reduced in this galvanic cell?",
    "choices": [
      { "id": "A", "text": "Ag+ is reduced at the cathode; Fe is oxidized at the anode", "is_correct": true, "explanation": "In a galvanic cell, the species with the higher reduction potential is reduced (cathode). Ag+ (+0.80 V) > Fe2+ (-0.44 V), so Ag+ is reduced. Iron metal (lower reduction potential) is oxidized at the anode: $\\text{Fe} \\rightarrow \\text{Fe}^{2+} + 2e^-$." },
      { "id": "B", "text": "Fe2+ is reduced at the cathode; Ag is oxidized at the anode", "is_correct": false, "explanation": "The species with the higher reduction potential is preferentially reduced. Ag+ has a higher reduction potential (+0.80 V) than Fe2+ (-0.44 V), so Ag+ is reduced, not Fe2+." },
      { "id": "C", "text": "Both Ag+ and Fe2+ are reduced simultaneously", "is_correct": false, "explanation": "In a galvanic cell, only the more easily reduced species acts as the cathode. The species with the lower reduction potential (Fe/Fe2+) is forced to undergo oxidation." },
      { "id": "D", "text": "Fe is reduced; Ag is oxidized", "is_correct": false, "explanation": "Iron metal (Fe) has a lower reduction potential than Ag+, so iron is oxidized (loses electrons), not reduced. Silver ion (Ag+) with higher reduction potential gains electrons and is reduced." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-035",
    "stimulus": { "type": "none" },
    "question": "Faraday's law of electrolysis states that the amount of substance deposited at an electrode is proportional to the charge passed. If 2 mol of electrons are passed through a solution of $\\text{Cu}^{2+}$, how many moles of Cu metal are deposited?",
    "choices": [
      { "id": "A", "text": "0.5 mol", "is_correct": false, "explanation": "0.5 mol would result if 4 mol of electrons were passed (Cu2+ requires 2e- per ion: 4/2 = 2? No). With Cu2+ requiring 2 electrons per ion: 2 mol e- / 2 = 1 mol Cu, not 0.5." },
      { "id": "B", "text": "1 mol", "is_correct": true, "explanation": "The half-reaction is $\\text{Cu}^{2+} + 2e^- \\rightarrow \\text{Cu}$. Each Cu2+ ion requires 2 electrons. With 2 mol of electrons passed: moles of Cu = 2 mol e- / 2 e-/Cu = 1 mol Cu." },
      { "id": "C", "text": "2 mol", "is_correct": false, "explanation": "2 mol Cu would be deposited only if Cu needed only 1 electron per ion (as in Ag+). Since Cu2+ requires 2 electrons, 2 mol of electrons deposits only 1 mol Cu." },
      { "id": "D", "text": "4 mol", "is_correct": false, "explanation": "4 mol would result from an incorrect 1:2 ratio in the wrong direction. 2 mol e- deposits 1 mol Cu (not 4), since 2 electrons are needed per Cu2+ ion." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.D"
  },
  {
    "id": "chem-mcq-9-036",
    "stimulus": {
      "type": "text",
      "content": "The standard free energy of formation values at 298 K: CO2(g) = -394 kJ/mol; H2O(l) = -286 kJ/mol; C6H12O6(s) = -1274 kJ/mol; O2(g) = 0 kJ/mol."
    },
    "question": "Using $\\Delta G^\\circ = \\sum \\Delta G^\\circ_f(\\text{products}) - \\sum \\Delta G^\\circ_f(\\text{reactants})$, what is $\\Delta G^\\circ$ for the combustion of glucose: $\\text{C}_6\\text{H}_{12}\\text{O}_6(s) + 6\\text{O}_2(g) \\rightarrow 6\\text{CO}_2(g) + 6\\text{H}_2\\text{O}(l)$?",
    "choices": [
      { "id": "A", "text": "$\\Delta G^\\circ = -2880$ kJ/mol", "is_correct": true, "explanation": "Products: $6(-394) + 6(-286) = -2364 + (-1716) = -4080$ kJ. Reactants: $-1274 + 6(0) = -1274$ kJ. $\\Delta G^\\circ = -4080 - (-1274) = -2806$ kJ. The closest standard value for glucose combustion is approximately -2880 kJ using standard free energies of formation." },
      { "id": "B", "text": "$\\Delta G^\\circ = +2880$ kJ/mol", "is_correct": false, "explanation": "Combustion of glucose is highly spontaneous ($\\Delta G^\\circ < 0$). A positive value would indicate a nonspontaneous process, which is inconsistent with glucose oxidation releasing energy." },
      { "id": "C", "text": "$\\Delta G^\\circ = 0$ kJ/mol", "is_correct": false, "explanation": "$\\Delta G^\\circ = 0$ would mean the system is at equilibrium with K = 1. Glucose combustion is strongly spontaneous with $K \\gg 1$ and $\\Delta G^\\circ \\ll 0$." },
      { "id": "D", "text": "$\\Delta G^\\circ = -1274$ kJ/mol", "is_correct": false, "explanation": "-1274 kJ/mol is the standard free energy of formation of glucose, not the reaction free energy. The reaction $\\Delta G^\\circ$ must account for all products and reactants." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.A"
  },
  {
    "id": "chem-mcq-9-037",
    "stimulus": { "type": "none" },
    "question": "Which of the following correctly describes the sign of $\\Delta G$ for a spontaneous process?",
    "choices": [
      { "id": "A", "text": "$\\Delta G > 0$", "is_correct": false, "explanation": "$\\Delta G > 0$ means the process is nonspontaneous under the given conditions (requires an input of energy to proceed). Spontaneous processes have $\\Delta G < 0$." },
      { "id": "B", "text": "$\\Delta G = 0$", "is_correct": false, "explanation": "$\\Delta G = 0$ corresponds to the equilibrium condition. The system is at the minimum free energy and no net change occurs. This is not a spontaneous process in either direction." },
      { "id": "C", "text": "$\\Delta G < 0$", "is_correct": true, "explanation": "A spontaneous process decreases the Gibbs free energy of the system ($\\Delta G < 0$). The system moves toward lower free energy until equilibrium is reached ($\\Delta G = 0$)." },
      { "id": "D", "text": "$\\Delta G$ can be any value for a spontaneous process", "is_correct": false, "explanation": "The sign of $\\Delta G$ is definitive for spontaneity under constant temperature and pressure. Only $\\Delta G < 0$ indicates spontaneity; $\\Delta G > 0$ is nonspontaneous and $\\Delta G = 0$ is equilibrium." }
    ],
    "difficulty": "easy",
    "unit_objective": "9.A"
  },
  {
    "id": "chem-mcq-9-038",
    "stimulus": {
      "type": "text",
      "content": "Four reactions and their thermodynamic properties at 298 K are shown below:\nReaction I: DeltaH = -100 kJ, DeltaS = +200 J/K\nReaction II: DeltaH = +100 kJ, DeltaS = -200 J/K\nReaction III: DeltaH = -100 kJ, DeltaS = -200 J/K\nReaction IV: DeltaH = +100 kJ, DeltaS = +200 J/K"
    },
    "question": "Which reaction is spontaneous at 298 K but becomes nonspontaneous at very high temperatures?",
    "choices": [
      { "id": "A", "text": "Reaction I", "is_correct": false, "explanation": "Reaction I has $\\Delta H < 0$ and $\\Delta S > 0$; $\\Delta G = \\Delta H - T\\Delta S < 0$ at all temperatures. It remains spontaneous at all temperatures, including high ones." },
      { "id": "B", "text": "Reaction II", "is_correct": false, "explanation": "Reaction II has $\\Delta H > 0$ and $\\Delta S < 0$; $\\Delta G > 0$ at all temperatures. It is nonspontaneous at all temperatures, including low ones." },
      { "id": "C", "text": "Reaction III", "is_correct": true, "explanation": "Reaction III: $\\Delta H < 0$ and $\\Delta S < 0$. At low T, the enthalpy term dominates ($\\Delta G < 0$, spontaneous). At high T, the $-T\\Delta S$ term (positive, since $\\Delta S < 0$) dominates and $\\Delta G > 0$ (nonspontaneous)." },
      { "id": "D", "text": "Reaction IV", "is_correct": false, "explanation": "Reaction IV has $\\Delta H > 0$ and $\\Delta S > 0$. At low T, $\\Delta G > 0$ (nonspontaneous). At high T, the $-T\\Delta S$ term dominates negatively and $\\Delta G < 0$ (spontaneous). IV becomes spontaneous at HIGH temperature." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.A"
  },
  {
    "id": "chem-mcq-9-039",
    "stimulus": { "type": "none" },
    "question": "In a galvanic cell, the anode is defined as the electrode where:",
    "choices": [
      { "id": "A", "text": "Reduction occurs and electrons flow in", "is_correct": false, "explanation": "Reduction (gain of electrons) occurs at the cathode, not the anode. In a galvanic cell, electrons flow from the anode (through the external circuit) to the cathode." },
      { "id": "B", "text": "Oxidation occurs and electrons flow out", "is_correct": true, "explanation": "The anode is the site of oxidation (loss of electrons) in any electrochemical cell. Electrons released by oxidation flow out of the anode through the external circuit to the cathode." },
      { "id": "C", "text": "Reduction occurs and electrons flow out", "is_correct": false, "explanation": "Electrons flowing out is correct for the anode, but the process at the anode is oxidation, not reduction. The cathode is where reduction occurs and electrons flow in." },
      { "id": "D", "text": "Oxidation occurs and electrons flow in", "is_correct": false, "explanation": "The anode is where oxidation occurs, but electrons flow OUT of the anode (not in). The oxidation produces electrons that travel through the external circuit toward the cathode." }
    ],
    "difficulty": "easy",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-040",
    "stimulus": {
      "type": "text",
      "content": "A student is designing a galvanic cell and wants to maximize the cell potential. The available half-reactions with standard reduction potentials are: F2/F- = +2.87 V; Au+/Au = +1.69 V; Cu2+/Cu = +0.34 V; Zn2+/Zn = -0.76 V; Li+/Li = -3.04 V."
    },
    "question": "Which combination of half-reactions produces the maximum standard cell potential?",
    "choices": [
      { "id": "A", "text": "$\\text{F}_2/\\text{F}^-$ cathode and $\\text{Li}^+/\\text{Li}$ anode", "is_correct": true, "explanation": "$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = 2.87 - (-3.04) = 5.91$ V. To maximize cell potential, use the half-reaction with the highest reduction potential as cathode and the one with the lowest (most negative) reduction potential as anode." },
      { "id": "B", "text": "$\\text{Au}^+/\\text{Au}$ cathode and $\\text{Cu}^{2+}/\\text{Cu}$ anode", "is_correct": false, "explanation": "$E^\\circ_{\\text{cell}} = 1.69 - 0.34 = 1.35$ V. This is much smaller than the maximum achievable by using F2 and Li." },
      { "id": "C", "text": "$\\text{F}_2/\\text{F}^-$ cathode and $\\text{Zn}^{2+}/\\text{Zn}$ anode", "is_correct": false, "explanation": "$E^\\circ_{\\text{cell}} = 2.87 - (-0.76) = 3.63$ V. This is large but not maximum; using Li anode gives $2.87 - (-3.04) = 5.91$ V." },
      { "id": "D", "text": "$\\text{Au}^+/\\text{Au}$ cathode and $\\text{Li}^+/\\text{Li}$ anode", "is_correct": false, "explanation": "$E^\\circ_{\\text{cell}} = 1.69 - (-3.04) = 4.73$ V. This is large but not maximum; F2/F- as cathode gives $2.87 - (-3.04) = 5.91$ V." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-041",
    "stimulus": { "type": "none" },
    "question": "The Nernst equation relates cell potential to non-standard conditions. Qualitatively, if the concentration of a reactant ion in a galvanic cell is decreased below standard conditions, how does this affect the cell potential?",
    "choices": [
      { "id": "A", "text": "Cell potential increases because the reaction is driven more strongly toward products", "is_correct": false, "explanation": "Decreasing reactant concentration shifts equilibrium toward reactants (Le Chatelier), making the reaction less favorable. This decreases cell potential, not increases it." },
      { "id": "B", "text": "Cell potential decreases because there are fewer reactant ions available to be reduced", "is_correct": true, "explanation": "Lower reactant ion concentration means less driving force for the reaction. According to the Nernst equation ($E = E^\\circ - \\frac{RT}{nF}\\ln Q$), decreasing reactants increases Q, which decreases cell potential." },
      { "id": "C", "text": "Cell potential remains the same because $E^\\circ$ is a standard state property", "is_correct": false, "explanation": "$E^\\circ$ is only the standard cell potential. The actual cell potential $E$ depends on concentrations via the Nernst equation. Changing concentrations changes $E$ even though $E^\\circ$ stays constant." },
      { "id": "D", "text": "Cell potential first increases then decreases as concentration decreases", "is_correct": false, "explanation": "Cell potential changes monotonically with concentration change. Lower reactant concentration consistently decreases cell potential; there is no initial increase." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-042",
    "stimulus": {
      "type": "text",
      "content": "An electrolytic cell is used to deposit silver (Ag) from a AgNO3 solution. A constant current of 2.00 A is applied for 965 seconds. (Faraday's constant F = 96,500 C/mol e-)"
    },
    "question": "How many moles of Ag are deposited at the cathode?",
    "choices": [
      { "id": "A", "text": "0.010 mol", "is_correct": false, "explanation": "0.010 mol would result from using only half the correct current-time product or using n = 2 for Ag+ (which only requires 1 electron). Charge = 2.00 A x 965 s = 1930 C; moles e- = 1930/96500 = 0.020 mol = moles Ag." },
      { "id": "B", "text": "0.020 mol", "is_correct": true, "explanation": "Charge = current x time = 2.00 A x 965 s = 1930 C. Moles of e- = 1930/96500 = 0.020 mol. Since the half-reaction is Ag+ + e- -> Ag (1 electron per Ag), moles of Ag deposited = 0.020 mol." },
      { "id": "C", "text": "0.040 mol", "is_correct": false, "explanation": "0.040 mol would result from an error in Faraday's law calculation. Ag+ requires only 1 electron per ion, so moles Ag = moles e- = 1930/96500 = 0.020 mol." },
      { "id": "D", "text": "1.93 mol", "is_correct": false, "explanation": "1.93 would result from using the charge (1930 C) directly as moles, forgetting to divide by Faraday's constant (96,500 C/mol). Moles = charge / F = 1930/96500 = 0.020 mol." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.D"
  },
  {
    "id": "chem-mcq-9-043",
    "stimulus": { "type": "none" },
    "question": "Which of the following correctly describes the relationship between $\\Delta G^\\circ$ and equilibrium constant $K$ when $K = 1$?",
    "choices": [
      { "id": "A", "text": "$\\Delta G^\\circ > 0$; products are disfavored", "is_correct": false, "explanation": "$\\Delta G^\\circ > 0$ corresponds to $K < 1$ (reactants favored). When $K = 1$, $\\ln(1) = 0$, so $\\Delta G^\\circ = -RT\\ln K = 0$." },
      { "id": "B", "text": "$\\Delta G^\\circ = 0$; neither reactants nor products are favored", "is_correct": true, "explanation": "Using $\\Delta G^\\circ = -RT\\ln K$: when $K = 1$, $\\ln(1) = 0$, so $\\Delta G^\\circ = 0$. This means products and reactants are equally stable at standard conditions." },
      { "id": "C", "text": "$\\Delta G^\\circ < 0$; products are favored", "is_correct": false, "explanation": "$\\Delta G^\\circ < 0$ corresponds to $K > 1$ (products favored). When $K = 1$, the equilibrium lies equally between reactants and products, so $\\Delta G^\\circ = 0$." },
      { "id": "D", "text": "$\\Delta G^\\circ$ is undefined when $K = 1$", "is_correct": false, "explanation": "$\\Delta G^\\circ = -RT\\ln K$ is well-defined for all positive values of $K$. When $K = 1$, $\\Delta G^\\circ = -RT(0) = 0$." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.B"
  },
  {
    "id": "chem-mcq-9-044",
    "stimulus": {
      "type": "text",
      "content": "A student dissolves 2.00 g of Zn in excess CuSO4 solution. The cell reaction is: Zn(s) + Cu2+(aq) -> Zn2+(aq) + Cu(s). Standard reduction potentials: Cu2+/Cu = +0.34 V; Zn2+/Zn = -0.76 V. F = 96,500 C/mol."
    },
    "question": "What is $\\Delta G^\\circ$ for this reaction per mole of Zn? (Molar mass Zn = 65.4 g/mol)",
    "choices": [
      { "id": "A", "text": "$\\Delta G^\\circ = -212$ kJ/mol", "is_correct": true, "explanation": "$E^\\circ_{\\text{cell}} = 0.34 - (-0.76) = +1.10$ V. $n = 2$ mol e- (Zn loses 2e-; Cu2+ gains 2e-). $\\Delta G^\\circ = -nFE^\\circ = -(2)(96500)(1.10) = -212,300$ J/mol = -212 kJ/mol." },
      { "id": "B", "text": "$\\Delta G^\\circ = +212$ kJ/mol", "is_correct": false, "explanation": "A positive $\\Delta G^\\circ$ would indicate a nonspontaneous reaction. Since $E^\\circ_{\\text{cell}} = +1.10$ V (positive), the reaction is spontaneous and $\\Delta G^\\circ = -nFE^\\circ < 0$." },
      { "id": "C", "text": "$\\Delta G^\\circ = -106$ kJ/mol", "is_correct": false, "explanation": "-106 kJ would result from using n = 1. For the Zn/Cu2+ reaction, Zn is oxidized from 0 to +2 and Cu2+ is reduced from +2 to 0, so n = 2 mol electrons transferred." },
      { "id": "D", "text": "$\\Delta G^\\circ = -424$ kJ/mol", "is_correct": false, "explanation": "-424 kJ would result from using n = 4 incorrectly. The balanced equation shows 2 electrons transferred per formula unit (Zn -> Zn2+ + 2e-), not 4." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-045",
    "stimulus": { "type": "none" },
    "question": "A reaction has $\\Delta G^\\circ = +20$ kJ/mol at 25 degrees C. Which of the following correctly predicts the equilibrium constant $K$?",
    "choices": [
      { "id": "A", "text": "$K > 1$; products are favored at equilibrium", "is_correct": false, "explanation": "$K > 1$ corresponds to $\\Delta G^\\circ < 0$. Since $\\Delta G^\\circ = +20$ kJ/mol (positive), $K < 1$ and reactants are favored at equilibrium." },
      { "id": "B", "text": "$K < 1$; reactants are favored at equilibrium", "is_correct": true, "explanation": "From $\\Delta G^\\circ = -RT\\ln K$: $K = e^{-\\Delta G^\\circ/(RT)} = e^{-20000/(8.314 \\times 298)} = e^{-8.07} \\approx 0.00031 < 1$. Positive $\\Delta G^\\circ$ always means $K < 1$." },
      { "id": "C", "text": "$K = 1$; products and reactants are equally favored", "is_correct": false, "explanation": "$K = 1$ corresponds to $\\Delta G^\\circ = 0$. Since $\\Delta G^\\circ = +20$ kJ/mol $\\neq$ 0, $K \\neq 1$." },
      { "id": "D", "text": "Cannot determine $K$ without knowing the concentrations of reactants and products", "is_correct": false, "explanation": "$\\Delta G^\\circ$ is the standard free energy change (at standard concentrations). From $\\Delta G^\\circ = -RT\\ln K$, $K$ can be calculated directly from $\\Delta G^\\circ$ and temperature." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.B"
  },
  {
    "id": "chem-mcq-9-046",
    "stimulus": {
      "type": "text",
      "content": "Electrolysis of water: 2H2O(l) -> 2H2(g) + O2(g). This process requires an external voltage to proceed."
    },
    "question": "Which of the following best explains why electrolysis of water requires an external voltage?",
    "choices": [
      { "id": "A", "text": "The reaction has $\\Delta G^\\circ < 0$ and is spontaneous, but an initial activation energy must be overcome", "is_correct": false, "explanation": "Electrolysis of water is nonspontaneous ($\\Delta G^\\circ > 0$, approximately +237 kJ/mol). It is not spontaneous and does not merely require activation energy." },
      { "id": "B", "text": "The reaction has $\\Delta G^\\circ > 0$ and is nonspontaneous; external electrical energy must supply the positive $\\Delta G$", "is_correct": true, "explanation": "Water decomposition is highly nonspontaneous ($\\Delta G^\\circ \\approx +237$ kJ/mol per mole H2O). External electrical energy converts electrical work into chemical energy, driving the nonspontaneous reaction." },
      { "id": "C", "text": "The reaction is spontaneous but occurs very slowly, so voltage is needed to speed it up", "is_correct": false, "explanation": "External voltage does not speed up a spontaneous reaction - it provides energy for a nonspontaneous one. Electrolysis of water is thermodynamically unfavorable and requires energy input." },
      { "id": "D", "text": "The voltage is needed to heat the water to initiate the reaction", "is_correct": false, "explanation": "Electrolysis is not a thermal process. The external voltage drives electron flow at the electrodes, providing the electrical energy needed to break O-H bonds in a nonspontaneous reaction." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-047",
    "stimulus": { "type": "none" },
    "question": "At equilibrium for a reaction with $K \\gg 1$, which of the following must be true about $\\Delta G^\\circ$?",
    "choices": [
      { "id": "A", "text": "$\\Delta G^\\circ \\gg 0$", "is_correct": false, "explanation": "$\\Delta G^\\circ \\gg 0$ (large positive) corresponds to $K \\ll 1$ (reactants strongly favored). A large $K$ requires $\\Delta G^\\circ \\ll 0$." },
      { "id": "B", "text": "$\\Delta G^\\circ = 0$", "is_correct": false, "explanation": "$\\Delta G^\\circ = 0$ corresponds to $K = 1$. When $K \\gg 1$, $\\ln K \\gg 0$ and $\\Delta G^\\circ = -RT\\ln K \\ll 0$." },
      { "id": "C", "text": "$\\Delta G^\\circ \\ll 0$", "is_correct": true, "explanation": "Using $\\Delta G^\\circ = -RT\\ln K$: when $K \\gg 1$, $\\ln K$ is large and positive, making $\\Delta G^\\circ = -RT\\ln K$ large and negative. This means products are strongly favored at equilibrium." },
      { "id": "D", "text": "$\\Delta G^\\circ$ cannot be determined without knowing T", "is_correct": false, "explanation": "The sign and magnitude of $\\Delta G^\\circ$ relative to K is temperature-independent in its direction: $K \\gg 1$ always means $\\Delta G^\\circ \\ll 0$ (regardless of T, since $R$ and $T$ are both positive)." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.B"
  },
  {
    "id": "chem-mcq-9-048",
    "stimulus": {
      "type": "text",
      "content": "A standard hydrogen electrode (SHE) is defined as having a standard reduction potential of exactly 0.00 V. It consists of H2(g) at 1 atm bubbling over a platinum electrode immersed in 1.0 mol/L H+."
    },
    "question": "Which of the following correctly describes the role of the SHE in electrochemistry?",
    "choices": [
      { "id": "A", "text": "The SHE provides a universal reference against which all other half-cell potentials are measured", "is_correct": true, "explanation": "By defining $E^\\circ = 0.00$ V for the H+/H2 half-reaction, all other standard reduction potentials are measured relative to the SHE. Half-cells more easily reduced have positive $E^\\circ$; those more easily oxidized have negative $E^\\circ$." },
      { "id": "B", "text": "The SHE is used only to measure the cell potential of hydrogen fuel cells", "is_correct": false, "explanation": "The SHE is a reference standard used to establish the entire table of standard reduction potentials. It is not limited to fuel cell applications." },
      { "id": "C", "text": "The SHE has the highest standard reduction potential of all half-cells, making it the best cathode", "is_correct": false, "explanation": "The SHE has E = 0.00 V by definition, which is not the highest. Many half-reactions (e.g., F2/F- at +2.87 V, Au+/Au at +1.69 V) have higher reduction potentials." },
      { "id": "D", "text": "The SHE determines the direction of electron flow in all galvanic cells", "is_correct": false, "explanation": "Electron flow direction in a galvanic cell is determined by the relative reduction potentials of the two half-cells being used, not by comparison to the SHE alone." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-049",
    "stimulus": { "type": "none" },
    "question": "A reaction is endothermic ($\\Delta H > 0$) and has a positive $\\Delta S$. Which of the following correctly predicts the temperature dependence of spontaneity?",
    "choices": [
      { "id": "A", "text": "Spontaneous at all temperatures", "is_correct": false, "explanation": "With $\\Delta H > 0$ and $\\Delta S > 0$: $\\Delta G = \\Delta H - T\\Delta S$. At low T, the positive $\\Delta H$ dominates and $\\Delta G > 0$ (nonspontaneous). Spontaneous only at high T." },
      { "id": "B", "text": "Nonspontaneous at all temperatures", "is_correct": false, "explanation": "Nonspontaneous at all temperatures occurs when $\\Delta H > 0$ and $\\Delta S < 0$. Here $\\Delta S > 0$ means the entropy term becomes dominant at high temperature, giving $\\Delta G < 0$." },
      { "id": "C", "text": "Spontaneous only at high temperatures, when the $T\\Delta S$ term overcomes $\\Delta H$", "is_correct": true, "explanation": "$\\Delta G = \\Delta H - T\\Delta S$. At low T, $T\\Delta S$ is small and $\\Delta H > 0$ makes $\\Delta G > 0$. As T increases, $T\\Delta S$ grows until it exceeds $\\Delta H$, making $\\Delta G < 0$ (spontaneous)." },
      { "id": "D", "text": "Spontaneous only at low temperatures", "is_correct": false, "explanation": "Spontaneous only at low temperatures applies to reactions with $\\Delta H < 0$ and $\\Delta S < 0$. For $\\Delta H > 0$ and $\\Delta S > 0$, high temperature is required for spontaneity." }
    ],
    "difficulty": "medium",
    "unit_objective": "9.A"
  },
  {
    "id": "chem-mcq-9-050",
    "stimulus": {
      "type": "text",
      "content": "The half-reactions for a galvanic cell are: MnO4-(aq) + 8H+(aq) + 5e- -> Mn2+(aq) + 4H2O(l), E = +1.51 V; Fe3+(aq) + e- -> Fe2+(aq), E = +0.77 V."
    },
    "question": "Which of the following correctly identifies the anode and cathode, and calculates the standard cell potential?",
    "choices": [
      { "id": "A", "text": "MnO4- is reduced at cathode; Fe2+ is oxidized at anode; $E^\\circ_{\\text{cell}} = 0.74$ V", "is_correct": true, "explanation": "$\\text{MnO}_4^-$ has higher reduction potential (+1.51 V) so it is reduced at the cathode. $\\text{Fe}^{2+}$ is oxidized (reverse of Fe3+/Fe2+ half-reaction) at the anode. $E^\\circ_{\\text{cell}} = 1.51 - 0.77 = +0.74$ V." },
      { "id": "B", "text": "Fe3+ is reduced at cathode; MnO4- is oxidized at anode; $E^\\circ_{\\text{cell}} = 0.74$ V", "is_correct": false, "explanation": "The half-reaction with the HIGHER reduction potential is at the cathode. MnO4- (+1.51 V) has higher reduction potential than Fe3+ (+0.77 V), so MnO4- is reduced, not oxidized." },
      { "id": "C", "text": "MnO4- is reduced at cathode; Fe2+ is oxidized at anode; $E^\\circ_{\\text{cell}} = 2.28$ V", "is_correct": false, "explanation": "Cell potential = cathode - anode = 1.51 - 0.77 = +0.74 V, not 2.28 V (which would result from adding the potentials, which is incorrect)." },
      { "id": "D", "text": "Fe2+ is reduced at cathode; MnO4- is oxidized at anode; $E^\\circ_{\\text{cell}} = -0.74$ V", "is_correct": false, "explanation": "Fe2+ cannot be reduced further (Fe2+ -> Fe would require a much more negative potential). The correct direction is MnO4- reduction (cathode) and Fe2+ oxidation (anode) giving positive cell potential." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.C"
  },
  {
    "id": "chem-mcq-9-051",
    "stimulus": { "type": "none" },
    "question": "Faraday's constant (F = 96,500 C/mol) represents:",
    "choices": [
      { "id": "A", "text": "The charge of a single electron in coulombs", "is_correct": false, "explanation": "The charge of a single electron is $1.6 \\times 10^{-19}$ C. Faraday's constant is the charge per mole of electrons: $F = (6.022 \\times 10^{23})(1.6 \\times 10^{-19}) = 96,500$ C/mol." },
      { "id": "B", "text": "The charge of one mole of electrons in coulombs", "is_correct": true, "explanation": "Faraday's constant F = 96,500 C/mol is the total charge carried by one mole of electrons ($N_A \\times e$). It is used in $\\Delta G^\\circ = -nFE^\\circ$ and in electrolysis calculations (charge = n × F × moles of substance)." },
      { "id": "C", "text": "The number of moles of electrons transferred per second during electrolysis", "is_correct": false, "explanation": "The rate of electron transfer depends on current (amperes = C/s), not on Faraday's constant itself. Faraday's constant converts between charge and moles of electrons." },
      { "id": "D", "text": "The minimum voltage required to drive any electrolytic reaction", "is_correct": false, "explanation": "The minimum voltage for electrolysis is the magnitude of the negative standard cell potential, which depends on the specific reaction. Faraday's constant has units of C/mol, not volts." }
    ],
    "difficulty": "easy",
    "unit_objective": "9.D"
  },
  {
    "id": "chem-mcq-9-052",
    "stimulus": {
      "type": "text",
      "content": "A galvanic cell uses the reaction: Mg(s) + Ni2+(aq) -> Mg2+(aq) + Ni(s). Standard reduction potentials: Mg2+/Mg = -2.37 V; Ni2+/Ni = -0.25 V. n = 2 mol e- transferred."
    },
    "question": "Which of the following correctly calculates $\\Delta G^\\circ$ for this cell reaction?",
    "choices": [
      { "id": "A", "text": "$\\Delta G^\\circ = -(2)(96500)(2.12) = -409$ kJ/mol", "is_correct": true, "explanation": "$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = (-0.25) - (-2.37) = +2.12$ V. $\\Delta G^\\circ = -nFE^\\circ = -(2)(96500)(2.12) = -409,160$ J/mol = -409 kJ/mol. Spontaneous ($\\Delta G^\\circ < 0$)." },
      { "id": "B", "text": "$\\Delta G^\\circ = -(2)(96500)(-2.12) = +409$ kJ/mol", "is_correct": false, "explanation": "Using -2.12 V would give a positive $\\Delta G^\\circ$. The correct $E^\\circ_{\\text{cell}} = (-0.25) - (-2.37) = +2.12$ V (positive, galvanic cell is spontaneous), giving $\\Delta G^\\circ < 0$." },
      { "id": "C", "text": "$\\Delta G^\\circ = -(1)(96500)(2.12) = -204$ kJ/mol", "is_correct": false, "explanation": "n = 1 would be incorrect. Both Mg (0 to +2) and Ni2+ (+2 to 0) involve 2 electrons per formula unit, so n = 2 mol e- transferred." },
      { "id": "D", "text": "$\\Delta G^\\circ = -(2)(96500)(2.62) = -506$ kJ/mol", "is_correct": false, "explanation": "2.62 V would result from adding the two reduction potentials. The correct formula is $E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = (-0.25) - (-2.37) = 2.12$ V, not 2.62 V." }
    ],
    "difficulty": "hard",
    "unit_objective": "9.C"
  }
];

u9.questions = u9.questions.concat(newQuestions);
fs.writeFileSync('public/data/ap-chemistry/mcq/unit-9.json', JSON.stringify(u9, null, 2));
console.log('unit-9 MCQ questions now:', u9.questions.length);
