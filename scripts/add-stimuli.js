const fs = require('fs');

// Add stimuli to unit-8 new questions that currently have none
// Need 5 more to reach 19/27 (70%+)
const u8Stimuli = {
  'chem-mcq-8-027': {
    type: 'text',
    content: 'A laboratory technician tests six common household chemicals and records their approximate pH values: vinegar (pH 2.4), baking soda solution (pH 8.3), bleach (pH 12), lemon juice (pH 2.0), milk of magnesia (pH 10.5), and pure water (pH 7.0).'
  },
  'chem-mcq-8-028': {
    type: 'text',
    content: 'A student looks up the Ka values of several weak acids: acetic acid (Ka = 1.8 x 10^-5), hypochlorous acid (Ka = 3.5 x 10^-8), and hydrocyanic acid (Ka = 6.2 x 10^-10). The student wants to find the Kb of each conjugate base using Kw = 1.0 x 10^-14.'
  },
  'chem-mcq-8-030': {
    type: 'text',
    content: 'A chemistry student uses the Henderson-Hasselbalch equation to analyze buffer solutions in a blood pH regulation lab. The equation is: pH = pKa + log([A-]/[HA]). Blood plasma is buffered primarily by the carbonic acid/bicarbonate system: H2CO3 / HCO3- with pKa = 6.10.'
  },
  'chem-mcq-8-033': {
    type: 'text',
    content: 'A biochemist needs to prepare four different solutions for an experiment: Solution 1 is made from HCl and NaCl. Solution 2 contains NH3 and NH4Cl. Solution 3 contains NaOH and NaCl. Solution 4 is made by mixing equal moles of HCl and NaOH.'
  },
  'chem-mcq-8-037': {
    type: 'text',
    content: 'A student compares the ionization of strong acids versus weak acids in water. For strong acids like HCl, the reaction HCl -> H+ + Cl- proceeds essentially to completion. For weak acids like HF, the reaction HF <-> H+ + F- reaches an equilibrium. The student notes that Ka values for strong acids are typically reported as "very large" or undefined, while weak acids have Ka values ranging from about 10^-1 to 10^-11.'
  }
};

// Add stimuli to unit-9 new questions that currently have none
// Need 7 more to reach 19/27 (70%+)
const u9Stimuli = {
  'chem-mcq-9-026': {
    type: 'text',
    content: 'The Gibbs free energy equation is delta-G = delta-H - T(delta-S). A student lists four possible combinations of delta-H and delta-S for a reaction and predicts the temperature dependence of spontaneity. The student uses the following sign convention: negative delta-G means spontaneous, positive delta-G means nonspontaneous.'
  },
  'chem-mcq-9-027': {
    type: 'text',
    content: 'A student analyzes four reactions using the Gibbs free energy equation delta-G = delta-H - T(delta-S). Reaction A: delta-H = +80 kJ, delta-S = -120 J/K. The student must predict the spontaneity of this reaction at any temperature.'
  },
  'chem-mcq-9-029': {
    type: 'text',
    content: 'In an advanced thermodynamics unit, students learn that the standard Gibbs free energy of a reaction is linked to its equilibrium constant through a fundamental equation. They are given a table of delta-G degrees values and corresponding K values: delta-G = -17 kJ/mol corresponds to K = 1000; delta-G = 0 kJ/mol corresponds to K = 1; delta-G = +17 kJ/mol corresponds to K = 0.001.'
  },
  'chem-mcq-9-032': {
    type: 'text',
    content: 'A chemistry class reviews the relationship delta-G degrees = -nFE degrees-cell. The instructor explains that this equation connects thermodynamics and electrochemistry: if the cell potential is positive, energy is released; if negative, energy must be supplied. For a galvanic cell, delta-G degrees must be negative for spontaneous operation.'
  },
  'chem-mcq-9-033': {
    type: 'text',
    content: 'An AP Chemistry student is reviewing two types of electrochemical cells. A galvanic (voltaic) cell, like a battery, releases energy through a spontaneous redox reaction. An electrolytic cell, like those used for electroplating, requires external electrical energy to drive a nonspontaneous redox reaction. Both cells have a cathode (where reduction occurs) and an anode (where oxidation occurs).'
  },
  'chem-mcq-9-037': {
    type: 'text',
    content: 'A student reviews the thermodynamic criteria for spontaneity at constant temperature and pressure. The Gibbs free energy (G) of a system decreases as a spontaneous process proceeds. At equilibrium, the system has reached its minimum Gibbs free energy and no further net change occurs. The sign of delta-G determines the direction of spontaneous change.'
  },
  'chem-mcq-9-039': {
    type: 'text',
    content: 'The diagram below represents a galvanic (voltaic) cell. The cell consists of two half-cells connected by a salt bridge. In one half-cell, a metal electrode is dissolving into solution (oxidation). In the other, metal ions from solution are depositing onto an electrode (reduction). Electrons flow through the external wire from one electrode to the other.'
  }
};

// Apply to unit-8
const u8 = JSON.parse(fs.readFileSync('public/data/ap-chemistry/mcq/unit-8.json', 'utf8'));
u8.questions.forEach(q => {
  if (u8Stimuli[q.id]) {
    q.stimulus = u8Stimuli[q.id];
  }
});
fs.writeFileSync('public/data/ap-chemistry/mcq/unit-8.json', JSON.stringify(u8, null, 2));

// Apply to unit-9
const u9 = JSON.parse(fs.readFileSync('public/data/ap-chemistry/mcq/unit-9.json', 'utf8'));
u9.questions.forEach(q => {
  if (u9Stimuli[q.id]) {
    q.stimulus = u9Stimuli[q.id];
  }
});
fs.writeFileSync('public/data/ap-chemistry/mcq/unit-9.json', JSON.stringify(u9, null, 2));

// Verify
const u8New = u8.questions.slice(25);
const u9New = u9.questions.slice(25);
const u8NewStim = u8New.filter(q => q.stimulus.type !== 'none').length;
const u9NewStim = u9New.filter(q => q.stimulus.type !== 'none').length;
console.log('u8 new q stimulus rate: ' + u8NewStim + '/27 (' + Math.round(u8NewStim/27*100) + '%)');
console.log('u9 new q stimulus rate: ' + u9NewStim + '/27 (' + Math.round(u9NewStim/27*100) + '%)');
