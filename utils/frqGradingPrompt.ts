// utils/frqGradingPrompt.ts
// Builds system prompts for FRQ grading and auditing.
// Two passes in strict mode: grader → auditor (downgrades weak credits only).

import type { FRQ, FRQDocument, FRQPart, FRQScoringPoint, GradingStrictness } from '@/utils/frqSession'

// ─── Per-Subject General Rubric Blocks ────────────────────────────────────────
// Math subjects have no general rubric — scoring is entirely question-specific.

const RUBRICS: Record<string, string> = {
  'ap-psychology': `## AP Psychology FRQ General Rubric (New 2024-2025 Format, first administered May 2025)
Section I: 75 MCQs, 90 minutes, 66.7% of score. Section II: AAQ + EBQ, 70 min total, 33.3% of score.
  - AAQ: 25 min (10 reading + 15 writing)
  - EBQ: 45 min (15 reading + 30 writing)

Both FRQs worth 7 points. The old "use these concepts to explain" FRQs are obsolete.

FRQ 1: ARTICLE ANALYSIS QUESTION (AAQ) — 7 points across SIX parts (A–F)
- Part A: Research Method (1 pt) — Accurately identify the methodology (experiment, correlational, case study, naturalistic observation, meta-analysis)
- Part B: Research Variable (1 pt) — Measurable/quantifiable (operational) definition as used in the study
- Part C: Statistic Interpretation (1 pt) — Explains what the identified statistic means in context (not a restatement)
- Part D: Ethical Guidelines (1 pt) — Identifies an ethical guideline ACTUALLY APPLIED in the study (not one that should have been)
- Part E: Generalizability (1 pt) — Explains extent using specific participant-variable evidence
- Part F: Argumentation (2 pts — tiered):
    1 pt = uses a specific result OR names a concept (not both)
    2 pts = uses specific accurately-interpreted finding AND explains how it supports/refutes the concept/hypothesis

FRQ 2: EVIDENCE-BASED QUESTION (EBQ) — 7 points: distribution 1 + 1 + 2 + 1 + 2
- Part A: Claim (1 pt) — Defensible, specific claim relevant to the question
- Part B(i): Evidence from Source 1 (1 pt) — One correctly cited, specific, accurate, relevant piece
- Part B(ii): Explanation + Application (2 pts — tiered):
    1 pt = explains evidence-claim relationship
    2 pts = additionally applies a CED-named psych perspective/theory/concept/research finding
- Part C(i): Evidence from Different Source (1 pt) — Different source, different evidence
- Part C(ii): Explanation + Application (2 pts — tiered): Same two-tier as B(ii), but must apply a DIFFERENT CED-named concept

KEY EBQ RULES (2025 SG):
- Citations delimit evidence from reasoning ("All text before the citation will be considered evidence")
- The claim (Part A) can earn regardless of whether B/C succeed
- Certain concepts that appear in the source materials themselves (e.g. "confederate", "statistically significant", "operant conditioning" per 2025 SG) may not earn the application point — the concept must come from student knowledge

GENERAL SCORING NOTES:
- Each point earned independently
- Definitions alone are NOT sufficient — must connect to the scenario/study
- Accept reasonable synonyms for AP terms
- No penalty for extra incorrect info unless it contradicts the correct answer
- AAQ Ethical Guidelines point is STRICT — the guideline must be one the researchers actually applied, not one they should have applied`,

  'ap-world-history': `## AP World History: Modern FRQ General Rubric (CED 2020, 2023 refinement, current through May 2026)

Exam weighting:
- Section I Part B: 3 SAQs, 40 min, 20% of score (Q1/Q2 required; Q3 OR Q4 choice)
- Section II: 1 DBQ (60 min recommended including 15-min reading, 25%) + 1 LEQ (40 min recommended, 15%)

GENERAL NOTES (all types):
- Each row scored independently
- Historically defensible content required; minor errors acceptable if they don't detract
- Essays are first-draft prose — grammar/spelling not penalized unless meaning is obscured
- "Identify" = specific answer (name, term, phrase)
- "Describe" = relevant characteristics with detail
- "Explain" = how/why reasoning

DBQ SCORING (7 points) — scoring rows (2024 SG):
- A Thesis/Claim (1 pt): Historically defensible thesis that establishes a line of reasoning, located in intro or conclusion, more than a restatement
- B Contextualization (1 pt): Broader events/developments/processes before, during, or continuing after the time frame relevant to prompt. More than a phrase or reference
- C Evidence from Documents (1 pt): ACCURATELY DESCRIBES (not just quotes) content of at least 3 documents
- C Evidence from Documents+ (+1 pt, total 2): SUPPORTS an argument using at least 4 documents. The 4 may be spread across sub-arguments or counterarguments
- C Evidence Beyond Documents (1 pt): At least one ADDITIONAL specific piece of evidence beyond the documents, different from contextualization, more than a phrase
- D Sourcing (HAPP) (1 pt): For at least 2 documents, EXPLAIN how or why the doc's Historical situation, Audience, Purpose, OR Point of view is relevant to an argument. Merely identifying HAPP does NOT earn
- D Complex Understanding (1 pt): Sophisticated argumentation (multiple themes, causes/effects, continuities/changes, cross-period) OR effective evidence use (all 7 docs, sourcing 4+ docs, or combining docs with outside evidence). Must be developed — more than a phrase

LEQ SCORING (6 points):
- A Thesis/Claim (1 pt): Same criteria as DBQ thesis
- B Contextualization (1 pt): Same criteria as DBQ contextualization
- C Evidence (1 pt): At least 2 specific and relevant pieces of evidence
- C Evidence supports argument (+1 pt, total 2): Uses at least 2 specific + relevant pieces to SUPPORT an argument
- D Historical Reasoning (1 pt): Uses comparison, causation, or continuity/change to frame an argument (may be uneven)
- D Complexity (1 pt): Same as DBQ complexity. Effective-evidence path for LEQ requires at least 4 pieces supporting a nuanced argument

SAQ SCORING (3 points per question): Parts (a), (b), (c) scored 1 pt each independently
- Q1 has a secondary-source stimulus; Q2 has a primary-source stimulus; Q3 and Q4 have no stimulus

SCORING NOTES:
- Complex Understanding is the lowest-earned row — requires development, not just a phrase
- HAPP requires explaining how/why the element matters, not just identification
- 2023 refinement: 4 documents may be used across sub-arguments or counterarguments — this language held through 2024 and 2025`,

  'ap-government': `## AP U.S. Government and Politics FRQ General Rubric (CED 2023, 2024/2025 SG — current through May 2026)

Section II: 100 minutes, 50% of exam. Always 4 FRQs in this fixed order:

QUESTION 1: CONCEPT APPLICATION (3 pts, ~20 min)
- A Describe (1 pt): Describe a concept illustrated in the scenario
- B Explain (1 pt): Explain HOW that concept affects/produces a political outcome in the scenario
- C Explain (1 pt): Explain HOW a DIFFERENT actor/institution could respond, counteract, or apply the concept. (Must apply to a NEW actor — restating B fails)

QUESTION 2: QUANTITATIVE ANALYSIS (4 pts, ~20 min)
- A Identify (1 pt): Specific data value/category
- B Describe (1 pt): Pattern, trend, similarity, or difference
- C Conclude (1 pt): Draw a conclusion about what the data imply
- D Explain (1 pt): HOW the data/trend relates to a political principle, institution, process, policy, or behavior

QUESTION 3: SCOTUS COMPARISON (4 pts, ~20 min) — THREE lettered parts (NOT four):
- A Identify (1 pt): Identify a constitutional clause/provision/amendment common to the required AND non-required cases
- B TIERED (1 or 2 pts):
    1 pt = Describe relevant facts OR the holding of the REQUIRED case
    2 pts = Explain HOW the facts of BOTH cases led to similar or different holdings
- C Explain (1 pt): Explain how the decision relates to a political institution, process, behavior, or democratic principle
(A non-required case on this FRQ is always accompanied by a summary of facts, issue, and holding per CED p.27)

QUESTION 4: ARGUMENT ESSAY (6 pts, ~40 min) — four rows:
- A Claim/Thesis (1 pt): Defensible claim/thesis establishing a line of reasoning. May appear anywhere in response
- B Evidence (0-3 pts tiered):
    1 pt = one relevant piece
    2 pts = one specific + relevant piece supporting thesis, OR two relevant pieces
    3 pts = two specific + relevant pieces supporting thesis, AT LEAST ONE from a listed foundational document. Requires Row A
- C Reasoning (1 pt): Use classification, process, causation, or comparison to explain how/why evidence supports the argument. Requires specific + relevant evidence
- D Alternate Perspectives (1 pt): DESCRIBE an alternate perspective AND REBUT/REFUTE it. Merely stating the opposing view fails. Requires Row A

REQUIRED FOUNDATIONAL DOCUMENTS (9):
Declaration of Independence; Articles of Confederation; U.S. Constitution; Federalist 10; Brutus 1; Federalist 51; Federalist 70; Federalist 78; Letter from a Birmingham Jail.

REQUIRED SUPREME COURT CASES (14 — Roe v. Wade REMOVED Fall 2023):
Marbury v. Madison (1803); McCulloch v. Maryland (1819); Schenck v. U.S. (1919); Brown v. Board (1954); Baker v. Carr (1962); Engel v. Vitale (1962); Gideon v. Wainwright (1963); Tinker v. Des Moines (1969); NYT v. U.S. (1971); Wisconsin v. Yoder (1972); Shaw v. Reno (1993); U.S. v. Lopez (1995); McDonald v. Chicago (2010); Citizens United v. FEC (2010).

GENERAL NOTES:
- "Identify" = indicate/provide info without elaboration
- "Describe" = relevant characteristics (more than mentioning a term)
- "Explain" = how/why a relationship exists
- Row D phrase "rebuttal or refutation" is load-bearing — identifying without refuting fails
- Row B evidence tier 3 requires Row A thesis
- Row D rebuttal requires Row A thesis`,

  'ap-calculus-ab': `## AP Calculus AB FRQ General Scoring Notes (CED 2024, current through May 2026)
Section II: 6 FRQs × 9 points = 54 total points, 90 minutes, 50% of exam.
Part A: 2 FRQs (Q1-Q2), GRAPHING CALCULATOR REQUIRED, 30 minutes.
Part B: 4 FRQs (Q3-Q6), NO calculator, 60 minutes.

GENERAL SCORING CONVENTIONS:
- Each point is earned independently — no deductions for wrong work elsewhere
- Must SHOW WORK: a correct answer with no supporting work earns 0 on "show work" points
- +C requirement: any antiderivative/indefinite integral that omits +C loses 1 point (once per question, not per part)
- UNITS: if the problem specifies units and the answer requires them, missing/wrong units loses 1 point (once per question)
- Decimal precision: final answers must be accurate to 3+ decimal places unless stated otherwise
- Sign analysis: for increasing/decreasing or concavity arguments, must explicitly state the sign of the derivative, not just "it's positive"
- Equivalent expressions earn full credit (e.g., 1-cos(x) = -cos(x)+1)
- Alternative valid methods earn full credit if mathematically sound and reach the correct answer
- Simplification is NOT required unless the problem says "simplify"
- Limit notation: must use proper limit notation, not just "plug in" or "as x approaches"`,

  'ap-calculus-bc': `## AP Calculus BC FRQ General Scoring Notes (CED 2024, current through May 2026)
Section II: 6 FRQs × 9 points = 54 total points, 90 minutes, 50% of exam.
Part A: 2 FRQs (Q1-Q2), CALCULATOR REQUIRED, 30 minutes.
Part B: 4 FRQs (Q3-Q6), NO calculator, 60 minutes.
Q1, Q3, Q4 typically shared with AB; Q2, Q5, Q6 are BC-only.
BC includes all AB content plus series, parametric/polar, and advanced integration.

GENERAL SCORING CONVENTIONS:
- All AP Calculus AB scoring conventions apply (show work, +C, units, decimal precision, sign analysis, equivalent expressions)
- Series convergence: must name the test used AND show all conditions are met — "by the ratio test it converges" alone is insufficient
- Interval of convergence: must check endpoints separately and state the interval with correct brackets/parentheses
- Parametric/polar: must show the setup (integral bounds, integrand) not just the answer
- Integration by parts / partial fractions: show the decomposition or u/dv choices, not just the final antiderivative
- Taylor/Maclaurin: if asked for "first n terms," provide exactly n nonzero terms
- Euler's method: must show the iterative steps, not just the final approximation
- Lagrange error bound: must state and apply the bound formula with correct (n+1)th derivative bound`,

  'ap-precalculus': `## AP Precalculus FRQ General Scoring Notes (CED 2025, current through May 2026)
Section II: 4 FRQs × 6 points = 24 total points, 60 minutes, 37.5% of exam.

FIXED TASK MODELS in order:
- Q1: Function Concepts — calculator REQUIRED, Part A (2-2-2 distribution)
- Q2: Modeling a Non-Periodic Context — calculator REQUIRED, Part A (2-3-1 distribution; Part B has i/ii/iii = 3pts, Part C = 1pt)
- Q3: Modeling a Periodic Context — calculator NOT PERMITTED, Part B (2-2-2)
- Q4: Symbolic Manipulations — calculator NOT PERMITTED, Part B (2-2-2)

Unit 4 (vectors/matrices/parametric) is NOT assessed.
Calculator capabilities required: plot graphs, find zeros/intersections/min/max, tabulate, numerically solve, compute regression equations (linear/quadratic/cubic/quartic/exponential/logarithmic/sinusoidal) with residual plotting. Does NOT require numerical derivative/integral.

PARTIAL CREDIT: 2-point parts use "First Column / Second Column" grading — student earns 1 pt by meeting one criterion from each of two columns.

DECIMAL ACCURACY (Q1 & Q2 only): 3 decimal places (rounded or truncated). Trailing zeros not required. The FIRST decimal-presentation error per question is FORGIVEN; subsequent parts remain eligible. Q2 additionally penalizes the first part where exact form is given when decimals were required.

LIMIT NOTATION (end behavior): Response must include all four components — \`lim\`, \`x → ∞\` (or -∞), the function, and the value. Missing "x → ∞" earns only partial credit.

SINUSOIDAL Q3(B): Must use form $h(t) = a\\sin(b(t+c))+d$. Cosine-form answers receive partial credit only.

GENERAL SCORING CONVENTIONS:
- Each point is earned independently
- Must SHOW WORK: correct answers without supporting reasoning earn 0 on "justify" or "show work" points
- EXACT VALUES required on no-calculator questions — decimal approximations earn 0 unless the problem says "approximate"
- Calculator questions: round to 3+ decimal places unless stated otherwise
- Function notation must be used correctly — f(x) not just "the function"
- Transformations: must describe both the type and direction (e.g., "horizontal shift left 3" not just "shift")
- Domain restrictions: must state in interval or inequality notation, not just words
- End behavior: must reference the function values approaching a limit, not just "goes up" or "goes down"
- Inverse functions: verify domain/range swap is stated when required
- Logarithmic/exponential equivalence: either form accepted if mathematically correct`,

  'ap-chemistry': `## AP Chemistry FRQ General Scoring Notes (CED 2024, current through May 2026)
Section II: 7 FRQs = 46 total points, 105 minutes. Calculators PERMITTED throughout Section II.
- Q1, Q2, Q3: LONG FRQs, 10 points each (23 minutes each recommended). Q1 is almost always lab-based with explicit error-propagation analysis.
- Q4, Q5, Q6, Q7: SHORT FRQs, 4 points each (9 minutes each recommended).
- Every exam requires at least one particulate-level drawing.
- Periodic Table and Equations/Constants sheet provided.

GENERAL SCORING CONVENTIONS:
- Each point is earned independently
- Significant figures: answers must use correct sig figs based on given data. Wrong sig figs on a calculation loses 1 point (once per question, not per part)
- UNITS: must include correct units on final numerical answers. Missing/wrong units loses 1 point (once per question)
- Balanced equations: coefficients must be lowest whole-number ratios. Fractional coefficients earn 0 unless the problem specifies otherwise
- Particulate diagrams: must show correct relative numbers AND types of particles
- Equilibrium expressions: products over reactants, pure solids/liquids omitted
- Thermodynamics sign conventions: exothermic = negative ΔH, endothermic = positive ΔH — reversed signs earn 0
- "Justify" or "Explain" requires connecting the claim to specific chemical principles — restating the claim is insufficient
- Accept reasonable equivalent chemical terminology (e.g., "dissociate" = "ionize" for strong acids in water)
- Electron configurations: accept noble gas shorthand or full notation
- Lewis structures: must show all lone pairs and formal charges if nonzero`,
}

// ─── Output Schema ────────────────────────────────────────────────────────────

const OUTPUT_SCHEMA = `OUTPUT FORMAT — respond with raw JSON only (no markdown fences):
{
  "parts": [
    {
      "letter": "a",
      "point_results": [
        {
          "point_id": "a1",
          "description": "<copy of description>",
          "earned": 0,
          "max": 1,
          "confidence": 0.95,
          "sub_results": [
            { "element": "<required_element text>", "student_evidence_quote": "<EXACT verbatim substring of student response, or empty string if absent>", "met": false }
          ],
          "reasoning": "<1 sentence>",
          "suggestion": "<if earned=0: 1-2 sentences explaining what was needed AND how the student's own words could be improved to earn this point. Reference the correct_example if available. If the student was completely off-topic, explain what the rubric required instead. null if earned=max>"
        }
      ],
      "earned": 0,
      "max": 1,
      "feedback": "<1-2 sentences on what was done well>",
      "missed": "<1-2 sentences on what was missing, or null if full marks>"
    }
  ],
  "total_score": 0,
  "max_score": 0,
  "takeaway": "<one key improvement tip>"
}

CONFIDENCE RULE: Set confidence between 0 and 1 for each point_result. Use 0.9+ when the rubric criteria clearly match or clearly don't match the student's response. Use 0.6-0.9 when the response is ambiguous or borderline. Use below 0.6 only when you genuinely cannot determine if the criterion is met. Be calibrated — don't default to 0.95 on everything.

SUGGESTION RULE: For each missed point (earned=0), the suggestion MUST:
1. Reference what the student actually wrote (quote their words if they wrote anything relevant)
2. Explain specifically what was missing or incorrect
3. Show how their response could be revised to earn the point — build on their attempt, don't replace it entirely
4. ANCHOR to the correct_example: your suggested improvement MUST be consistent with the "Reference example" from the scoring rubric. Do NOT invent criteria beyond what the rubric specifies.
5. If the student was completely off-topic, explain what the rubric required and adapt the correct_example to a student-friendly model response.
Set suggestion to null for earned points.

EVIDENCE RULE: student_evidence_quote MUST be a verbatim substring of the student's response for that part. If you cannot find supporting text, use empty string "" and mark met: false. Do NOT paraphrase or invent quotes.
QUOTING RULE: Quote SHORT contiguous substrings — one sentence or key phrase at most. Do NOT combine non-adjacent sentences into a single quote. If evidence spans multiple sentences, quote the MOST relevant single sentence. The server will reject quotes that skip text in the middle.

ESSAY COMPLETENESS RULE (CRITICAL — violations will be rejected): For essay-type questions (DBQ, LEQ, argument_essay, essay, ebq), the student writes ONE essay or one body of text that is graded against MULTIPLE rubric parts. You MUST return a result for EVERY part listed in the rubric — do NOT skip parts just because the response is a single essay. Grade each part's criteria independently against the full response text.

HARD REQUIREMENTS for your JSON output:
1. The "parts" array MUST have EXACTLY one entry per rubric part (same letters as the rubric).
2. Each part's "point_results" array MUST have EXACTLY one entry per point_id listed in that part's rubric. If the rubric says part "b" has points b1, b2, and b3, you must return point_results for b1, b2, AND b3 — even if all three are 0.
3. If a criterion is not met, set earned=0 and describe what was missing in reasoning + suggestion. Do NOT omit the entry.
4. Count your output: if the rubric has N parts and M total scoring_points across those parts, your output must have N entries in "parts" and M total entries across all "point_results" arrays. Verify before submitting.`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderScoringPoints(points: FRQScoringPoint[]): string {
  return points.map(sp => {
    const alts = sp.alternatives.map((alt, i) => {
      const elements = alt.required_elements.map(e => `          - ${e}`).join('\n')
      return `        Alternative ${i + 1} — ALL of:\n${elements}\n        Reference example: ${alt.correct_example}`
    }).join('\n')
    const wrongs = sp.wrong_examples.map(w => `        - ${w}`).join('\n')
    const traps = sp.common_traps?.length
      ? `\n      COMMON TRAPS:\n${sp.common_traps.map(t => `        - ${t}`).join('\n')}`
      : ''
    return `    POINT ${sp.point_id} [${sp.point_value} pt]: ${sp.description}
      ALTERNATIVES (any ONE earns the point):
${alts}
      WRONG ANSWERS (0 points):
${wrongs}${traps}`
  }).join('\n\n')
}

function renderLegacyCriteria(part: FRQPart): string {
  const criteria = part.rubric_criteria.map((c, i) => `      ${i + 1}. ${c}`).join('\n')
  const notes = part.scoring_notes ? `\n    Scoring notes: ${part.scoring_notes}` : ''
  return `    Scoring criteria:\n${criteria}${notes}`
}

function renderPartBlock(part: FRQPart): string {
  const header = `  PART (${part.letter}) — "${part.prompt}"`
  if (part.scoring_points?.length) {
    return `${header}\n${renderScoringPoints(part.scoring_points)}`
  }
  return `${header}\n${renderLegacyCriteria(part)}`
}

function renderStudentBlock(parts: FRQPart[], responses: Record<string, string>, frqType?: string): string {
  // Essay-type FRQs (DBQ, LEQ, essay, argument_essay) store the full response
  // under the 'essay' key. The student writes ONE essay that is graded against
  // multiple rubric rows. Present the essay ONCE — do NOT repeat it per part,
  // as this confuses the LLM into thinking there are separate responses.
  const essayText = (responses['essay'] ?? '').trim()
  const isEssay = ['dbq', 'leq', 'essay', 'argument_essay'].includes(frqType ?? '')

  if (isEssay && essayText) {
    return `STUDENT ESSAY (this is a SINGLE essay — grade it against ALL rubric parts below. Each part's criteria should be evaluated independently against this same essay text):\n\n${essayText}`
  }

  // Multi-part FRQs: each part has its own response
  const lines = parts.map(p => {
    const raw = responses[p.letter] || essayText || ''
    const text = typeof raw === 'string' ? raw.trim() : ''
    return `(${p.letter}): ${text || '[NO RESPONSE]'}`
  })
  return `STUDENT RESPONSES (grade these — not the reference answers):\n${lines.join('\n')}`
}

function renderDocumentsBlock(documents: FRQDocument[]): string {
  const docs = documents.map(doc => {
    return `Document ${doc.doc_number}\nSource: ${doc.source}\nContent: ${doc.content}`
  }).join('\n\n')
  return `DOCUMENTS (the student wrote their response using these sources):\n\n${docs}`
}

// ─── Task Verb Definitions ───────────────────────────────────────────────────
// AP exams distinguish sharply between these verbs. Students commonly lose points
// by "describing" when asked to "explain."

const TASK_VERB_BLOCK = `TASK VERB DEFINITIONS (apply when evaluating whether a student's response meets a criterion):
- IDENTIFY: Indicate or provide information about a topic without elaboration. A name, term, or phrase is sufficient.
- DESCRIBE: Provide the relevant characteristics of a specified topic. More than just mentioning a term — must include detail or context.
- EXPLAIN: Provide information about HOW or WHY a relationship, process, pattern, position, situation, or outcome occurs. Must show causal or logical reasoning, not just state facts.
- COMPARE: Provide a description or explanation of similarities AND/OR differences.
- EVALUATE: Judge the merits/significance of something, usually with "to what extent" framing.

CRITICAL DISTINCTION: If a criterion says "Explain" and the student only "Describes" (states facts without showing how/why), award 0. If a criterion says "Describe" and the student only "Identifies" (mentions a term without characteristics), award 0.`

// ─── Per-FRQ-Type Calibration ────────────────────────────────────────────────
// Real examples drawn from College Board scoring guidelines to anchor the AI.

const FRQ_TYPE_CALIBRATION: Record<string, string> = {
  'dbq': `DBQ CALIBRATION:
THESIS (1pt) — The bar for thesis is LOW. It must: (1) take a defensible position, AND (2) establish a line of reasoning (give at least one reason). Sophistication is NOT required.
THESIS (1pt) — EARNS (sophisticated): "Communist rule fundamentally transformed Soviet and Chinese societies by restructuring class hierarchies, but the extent of transformation varied as traditional gender roles and rural-urban divides persisted." — Defensible claim with analytic categories.
THESIS (1pt) — EARNS (simple but valid): "Communist rule transformed Soviet and Chinese societies because it changed the economy and the role of women in society." — Takes a position ("transformed") AND gives reasons ("economy" + "role of women"). This earns the point even though it's simple.
THESIS (1pt) — DOES NOT EARN: "Communist rule transformed Soviet and Chinese societies between 1930 and 1990." — Restates the prompt without any reasoning about HOW or WHY.
THESIS (1pt) — DOES NOT EARN: "There were many changes under communist rule." — Too vague, no specific claim.
CRITICAL: A "because" clause with at least one reason = line of reasoning = thesis point earned. Do NOT reject theses for being simple, conversational, or lacking sophistication. AP readers award the thesis point generously.
SOURCING (1pt) — EARNS: "Document 3 was written by a Soviet official in 1946, so its positive portrayal of women's liberation likely served propaganda purposes to legitimize the regime abroad." — Explains HOW the purpose/audience affects the document's meaning.
SOURCING (1pt) — DOES NOT EARN: "Document 3 was written by Alexandra Kollontai, a Russian politician." — Only identifies the source without explaining relevance to the argument.`,

  'leq': `LEQ CALIBRATION:
CONTEXTUALIZATION (1pt) — EARNS: "Following the devastation of World War I and the collapse of European empires, nationalist movements gained momentum across Asia and Africa, as colonized peoples drew on Wilsonian ideals of self-determination." — Describes broader context with specific detail.
CONTEXTUALIZATION (1pt) — DOES NOT EARN: "There were many changes in the world during this time period." — Overgeneralized, no specific historical content.
COMPLEXITY (1pt) — EARNS: Addresses both similarities AND differences, OR analyzes multiple perspectives, OR connects across time periods with nuance.
COMPLEXITY (1pt) — DOES NOT EARN: A single-track argument that only addresses one side.`,

  'saq': `SAQ CALIBRATION:
1-POINT PART — EARNS: "Europeans used gunpowder weapons to conquer new territories, which gave them a significant military advantage over Indigenous peoples who lacked comparable technology." — Names a specific method AND provides relevant detail.
1-POINT PART — DOES NOT EARN: "Europeans went to the Americas." — Too vague, does not name a specific method or provide relevant characteristics.`,

  'concept_application': `GOV CONCEPT APPLICATION CALIBRATION:
DESCRIBE (1pt) — EARNS: "The EPA used its rule-making authority to interpret and implement environmental laws differently under different administrations." — Names a specific bureaucratic power connected to the scenario.
DESCRIBE (1pt) — DOES NOT EARN: "The EPA enforced the law." — Too vague, does not name the specific power.
EXPLAIN (1pt) — EARNS: "The president could limit the EPA's power by issuing an executive order that gives the agency specific guidance on how to interpret the new law." — Shows HOW the president affects the power.
EXPLAIN (1pt) — DOES NOT EARN: "The president can affect the EPA." — States that an effect exists without explaining the mechanism.`,

  'quantitative_analysis': `GOV QUANTITATIVE ANALYSIS CALIBRATION:
IDENTIFY (1pt) — EARNS: "Mandatory spending." — Correctly reads the data.
DESCRIBE (1pt) — EARNS: "As a percentage of total federal spending, mandatory spending increased while discretionary spending decreased." — Describes BOTH trends shown in the data.
DESCRIBE (1pt) — DOES NOT EARN: "Spending changed over time." — Does not specify which type or direction.
CONCLUDE (1pt) — EARNS: "Congress has decreased discretionary spending as mandatory spending has grown, suggesting that entitlement programs are crowding out other budget priorities." — Goes BEYOND restating the data to draw an inference.
CONCLUDE (1pt) — DOES NOT EARN: "Mandatory spending went up and discretionary went down." — Restates the data without drawing a conclusion.`,

  'scotus_comparison': `GOV SCOTUS COMPARISON CALIBRATION (3 lettered parts A/B/C — Part B is tiered 1-or-2 pts):

PART A — Identify constitutional clause/provision/amendment (1pt):
EARNS: "Both cases deal with the Commerce Clause in Article I, Section 8 of the Constitution." — Names a specific clause/provision/amendment common to BOTH cases.
DOES NOT EARN: "Both cases are about the Constitution." — Too vague; doesn't identify the specific clause.

PART B — TIERED (1 pt OR 2 pts):
TIER 1 (1 pt) EARNS: "In Citizens United v. FEC, the Court ruled that corporate political spending is a form of protected free speech under the First Amendment." — Describes facts or holding of the REQUIRED case.
TIER 1 (1 pt) DOES NOT EARN: "The Court made a decision about campaign finance." — Too vague; doesn't describe facts or holding.

TIER 2 (2 pts) EARNS: "In Lopez, the Court found that possessing a firearm in a school zone was not economic activity connected to interstate commerce, while in Katzenbach, the restaurant's refusal to serve Black customers directly affected interstate commerce through food supply chains — so the Court ruled the federal government had commerce power in Katzenbach but not Lopez." — EXPLAINS HOW the facts of BOTH cases led to similar or different holdings.
TIER 2 (2 pts) DOES NOT EARN: "Lopez was about guns and Katzenbach was about restaurants. The Court ruled differently in each case." — Describes each case separately but does NOT explain the connection between facts and holdings.

IMPORTANT: Award Tier 1 (1pt) OR Tier 2 (2pts) — NOT both. Model these as two scoring_points b1 (1pt describe) and b2 (1pt, the +1 for explaining both cases). Award b2 only if the response explains how BOTH cases' facts led to their holdings (comparative reasoning).

PART C — Explain relation to political institution/process/behavior/principle (1pt):
EARNS: "The Lopez decision illustrates judicial review by showing how the Supreme Court limits congressional power when Congress exceeds its enumerated authority under the Commerce Clause." — Connects the decision to a specific institution/principle.
DOES NOT EARN: "The case is important for the government." — No specific connection to an institution, process, or principle.`,

  'argument_essay': `GOV ARGUMENT ESSAY CALIBRATION:
THESIS (1pt) — The bar for thesis is LOW. A thesis earns the point when it: (1) takes a clear position on the prompt, AND (2) provides at least one reason ("because..."). Complexity, sophistication, or document references are NOT required for the thesis point.
THESIS (1pt) — EARNS: "The expanded powers of the national government benefit policy making because it allows for more consistency across states and makes it easier to respond to large scale problems." — Takes a position ("benefit") AND establishes reasoning ("consistency" + "large scale problems"). This IS a line of reasoning even though the language is simple.
THESIS (1pt) — EARNS: "Expanded national power hinders policy making because it reduces state autonomy and creates one-size-fits-all policies that ignore local needs." — Position + two reasons = line of reasoning.
THESIS (1pt) — DOES NOT EARN: "The national government has expanded its powers over time." — This is a factual statement, not a claim about whether it benefits or hinders policy making. No position taken.
THESIS (1pt) — DOES NOT EARN: "Federalism is important in the United States." — Generic statement with no position on the specific prompt and no reasoning.
THESIS (1pt) — DOES NOT EARN: "There are pros and cons to expanded national power." — Acknowledges both sides without taking a position.
CRITICAL: Do NOT deny the thesis point because the language is "too simple" or "not sophisticated enough." If the student takes a position and gives a reason, the thesis point is earned. AP scoring explicitly states the thesis is about clarity and defensibility, not complexity.
EVIDENCE (3pts tiered):
  1pt: Names one relevant piece of evidence (e.g., "The First Amendment")
  2pts: Uses one specific piece of evidence to SUPPORT the thesis (e.g., "The First Amendment protects free speech, which allows citizens to criticize the government — a check on tyranny")
  3pts: Uses TWO specific pieces of evidence supporting the thesis, at least one from the listed foundational documents
REBUTTAL (1pt) — EARNS: "Critics argue that judicial review gives unelected judges too much power, but the system of checks and balances ensures that constitutional amendments can override court decisions." — Acknowledges opposing view AND refutes it.
REBUTTAL (1pt) — DOES NOT EARN: "Some people disagree with this." — Acknowledges opposition without refuting.`,

  'multi_part_math': `MATH FRQ CALIBRATION:
SETUP POINT (1pt) — EARNS: Shows the correct formula/integral/equation with appropriate notation. The setup alone earns the point even if the final computation has errors.
SETUP POINT (1pt) — DOES NOT EARN: Jumps straight to an answer without showing the mathematical setup.
ANSWER POINT (1pt) — EARNS: Correct numerical/symbolic answer. Accept equivalent forms. Calculator questions: 3+ decimal places. No-calculator: exact values required.
ANSWER POINT (1pt) — DOES NOT EARN: Correct setup but arithmetic/algebra error in the final answer (earns setup point, not answer point).
JUSTIFICATION POINT (1pt) — EARNS: For optimization/existence, must test ALL critical points and endpoints (Candidates Test) OR show sign change analysis on the correct interval.
JUSTIFICATION POINT (1pt) — DOES NOT EARN: Uses only a local test (First/Second Derivative Test at one point) when a global argument is required.`,

  'essay': `PSYCHOLOGY ESSAY FRQ CALIBRATION:
Same scoring standards as multi_part_text — each criterion is independently evaluated.
For Argumentation points (2pt tier): 1pt for citing results, 2pts for explaining HOW results support/refute the hypothesis with explicit reasoning.`,

  'multi_part_text': `PSYCHOLOGY FRQ CALIBRATION:
CONCEPT APPLICATION (1pt) — EARNS: "The dependent variable, reaction time, was operationally defined as the number of milliseconds between the stimulus appearing and the participant pressing the button." — Identifies the variable AND provides a measurable/quantifiable definition.
CONCEPT APPLICATION (1pt) — DOES NOT EARN: "The dependent variable was how fast they reacted." — Names the variable but the definition is not measurable/quantifiable.
ARGUMENTATION (2pt tier):
  1pt: Uses results from the study but does not explain how they support/refute the hypothesis.
  2pts: Uses specific results AND explains HOW they support or refute the hypothesis with reasoning.`,
}

// ─── Strict Mode Blocks ───────────────────────────────────────────────────────

const STRICT_MODE_BLOCK = `STRICT MODE: You are grading as a rigorous AP reader preparing a student for the real exam. Do not award sympathy points. Do not credit vague or hand-wavy answers. Do not accept "the student probably meant X" — grade what they literally wrote. If the student's words match the required elements but are in the wrong context (e.g., they defined a term without applying it to the scenario), award 0.
SUGGESTION TONE (strict): Be clinical and precise. Do not sugarcoat. State exactly why the point was not earned and what the rubric required. Use language like "This does not earn the point because..." or "The rubric requires X — the response provided Y, which is insufficient because..." Show the correct approach without hedging.`

const STRICT_CALIBRATION = `CALIBRATION EXAMPLES (strict mode):

Example of CORRECT 0-point grading:
  Criterion: "Identify the research method"
  Required elements: ["names 'survey' or equivalent", "connects to the study"]
  Student response: "They did a study on kids."
  Scoring: 0/1 — student did not name a specific method; "a study" is too vague.
  student_evidence_quote: ""

Example of CORRECT 1-point grading:
  Criterion: "Identify the research method"
  Required elements: ["names 'survey' or equivalent", "connects to the study"]
  Student response: "The researchers used a survey to ask participants about their attachment styles."
  Scoring: 1/1 — names 'survey' AND connects to the study.
  student_evidence_quote: "The researchers used a survey to ask participants about their attachment styles"

Example of CORRECT 0-point grading (keyword present, wrong context):
  Criterion: "Explain how scarcity affects consumer behavior"
  Required elements: ["references scarcity", "explains effect on behavior"]
  Student response: "Scarcity is when there is not enough of something."
  Scoring: 0/1 — student defined the term but did not apply it to consumer behavior.
  student_evidence_quote: ""`

// ─── Prompt Builders ──────────────────────────────────────────────────────────

export function buildFRQGradingPrompt(
  question: FRQ,
  responses: Record<string, string>,
  strictness: GradingStrictness = 'moderate'
): string {
  const gradableParts = question.parts.filter(p => !p.requires_drawing)
  const gradablePoints = gradableParts.reduce((sum, p) => sum + p.point_value, 0)
  const subjectRubric = RUBRICS[question.subject] ?? ''

  const role = `You are Adi, an AP exam grader. You grade free response questions strictly according to the scoring criteria below. You are fair but rigorous — you grade like an experienced AP reader.`

  const answerKeyFirewall = `ANSWER-KEY FIREWALL: The REFERENCE answers below are your answer key — they show what a correct student response looks like. You may NOT credit the student for anything that appears only in the reference. Your job is to check whether the STUDENT'S OWN WORDS demonstrate the required elements.`

  const pessimisticPrior = `PESSIMISTIC PRIOR: Every scoring point starts at 0. You may only raise a point to its full value if the student's response satisfies the required elements of at least one alternative. Quote the relevant student text as evidence. If no supporting text exists, the point MUST remain at 0. There is no partial credit — AP points are binary.
IMPORTANT BALANCE: While you start at 0, you must also be FAIR. Real AP readers err on the side of awarding points when the response is defensible. Do NOT set an artificially high bar. If the student's response reasonably meets the criteria — even with simple or informal language — award the point. The goal is accuracy, not harshness.`

  const strictnessBlock = strictness === 'strict'
    ? `${STRICT_MODE_BLOCK}\n\n${STRICT_CALIBRATION}`
    : strictness === 'light'
    ? `LIGHT MODE: Give benefit of the doubt on partially correct reasoning. Award points if the student demonstrates understanding even with imprecise language. Focus feedback on what was done right.
SUGGESTION TONE (light): Be encouraging and constructive. Lead with what the student did well. Frame improvements as "next time, try adding..." or "you're close — to strengthen this, consider..." Never say "you failed to" or "this does not earn the point."`
    : `MODERATE MODE: Follow the rubric criteria as written — no extra generosity, no extra harshness. Award points only when criteria are clearly met.
SUGGESTION TONE (moderate): Be balanced and direct. Acknowledge what was done correctly, then clearly state what was missing. Use neutral language like "to earn this point, the response needed..." or "the rubric requires X, but the response only provided Y."`

  const generalRules = `GENERAL RULES:
- COMPLETENESS IS MANDATORY. Your output MUST contain one entry in "parts" for EVERY rubric part listed below, and within each part, one entry in "point_results" for EVERY point_id in that part's rubric. Skipping a part or a point_id is not acceptable — if the student's response does not address a criterion, set earned=0 and provide feedback explaining what was missing. This applies especially to essay-type FRQs (DBQ, LEQ, argument_essay, essay, ebq) where the single essay must be evaluated against every rubric row.
- BLANK OR MISSING RESPONSES EARN ZERO POINTS. If a part's response is "[NO RESPONSE]", empty, or clearly non-substantive (e.g., "idk", "?"), award 0 for every point of that part — but you must STILL return a point_result for each point_id with earned=0 and feedback.
- Grade ONLY what the student actually wrote. Never credit the student for content that appears only in the rubric.
- Equivalent mathematical expressions earn full credit (e.g., 1-cos(9) = -cos(9)+1).
- Alternative valid solution methods earn full credit if they reach the correct answer.
- For essays: grammar/spelling are not graded — focus on content and reasoning.
- For legacy parts without scoring_points, synthesize one point_result per rubric_criterion with inferred sub_results.
- earned in each part MUST equal the sum of its point_results[].earned.
- total_score MUST equal the sum of parts[].earned.

CROSS-POINT DEPENDENCY RULES (enforce these strictly):
- AP Gov Argument Essay: Row D (Rebuttal) can only be earned if Row A (Thesis) is earned. If Thesis=0, set Rebuttal=0 regardless of response quality.
- AP Gov Argument Essay: Row B Evidence tier 3 (foundational documents) requires Row A (Thesis). If Thesis=0, Evidence caps at tier 2.
- DBQ: Evidence from Docs+ (4-doc argument) can only be earned if Evidence from Docs (3-doc descriptive) is also earned. The tiers are progressive.
- LEQ: Evidence+ (evidence supporting argument) can only be earned if basic Evidence (two specific examples) is earned.
- These dependencies reflect real AP scoring — readers enforce them. Do NOT award a dependent point if its prerequisite is not met.`

  const questionBlock = `QUESTION: ${question.title}
Total Gradable Points: ${gradablePoints}${question.stimulus ? `\n\nSTIMULUS:\n${question.stimulus}` : ''}${question.documents?.length ? `\n\n${renderDocumentsBlock(question.documents)}` : ''}

SCORING RUBRIC (per part):
${gradableParts.map(renderPartBlock).join('\n\n')}`

  const studentBlock = renderStudentBlock(gradableParts, responses, question.frq_type)

  // FRQ-type-specific calibration examples (anchors grading to College Board standard)
  const typeCalibration = FRQ_TYPE_CALIBRATION[question.frq_type] ?? ''

  const sections = [
    role,
    answerKeyFirewall,
    pessimisticPrior,
    subjectRubric,
    TASK_VERB_BLOCK,
    typeCalibration,
    strictnessBlock,
    generalRules,
    OUTPUT_SCHEMA,
    questionBlock,
    studentBlock,
  ]

  return sections.filter(Boolean).join('\n\n')
}

export function buildFRQAuditorPrompt(
  question: FRQ,
  responses: Record<string, string>,
  firstPassResult: unknown,
  strictness: GradingStrictness = 'strict'
): string {
  const gradableParts = question.parts.filter(p => !p.requires_drawing)

  const role = `You are an auditor reviewing another AP grader's work. Your job is to catch false positives — points the first grader awarded that the student did not actually earn. You only LOWER scores, never raise them. If in doubt, downgrade. False positives are worse than false negatives in strict mode.`

  const auditInstructions = `AUDIT INSTRUCTIONS:
For each awarded point (earned > 0) in the first-pass result, verify:
  1. Is student_evidence_quote actually a verbatim substring of the student's response for that part?
  2. Does the quote satisfy EVERY required element in the chosen alternative?
  3. Is the student's usage contextually correct, or just keyword-matching?

If any check fails: set earned to 0, set all sub_results met to false, clear the quote to "", update reasoning to explain the downgrade.
Do NOT raise any earned value that was 0 in the first pass.
Do NOT change scores that are already 0.`

  const studentBlock = renderStudentBlock(gradableParts, responses, question.frq_type)

  const firstPassBlock = `FIRST-PASS GRADING RESULT (review this):
${JSON.stringify(firstPassResult, null, 2)}`

  // Reuse the scoring rubric so the auditor can check elements against the source
  const rubricBlock = `SCORING RUBRIC FOR REFERENCE:
${gradableParts.map(renderPartBlock).join('\n\n')}`

  const outputInstruction = `OUTPUT the corrected grading using the SAME JSON schema as the first pass. Raw JSON only, no markdown fences. Recalculate earned, total_score, and update feedback/missed/takeaway only if a downgrade changes them.`

  const documentsBlock = question.documents?.length
    ? renderDocumentsBlock(question.documents)
    : ''

  return [
    role,
    auditInstructions,
    studentBlock,
    documentsBlock,
    rubricBlock,
    firstPassBlock,
    OUTPUT_SCHEMA,
    outputInstruction,
  ].filter(Boolean).join('\n\n')
}
