// utils/frqGradingPrompt.ts
// Builds system prompts for FRQ grading and auditing.
// Two passes in strict mode: grader → auditor (downgrades weak credits only).

import type { FRQ, FRQDocument, FRQPart, FRQScoringPoint, GradingStrictness } from '@/utils/frqSession'

// ─── Per-Subject General Rubric Blocks ────────────────────────────────────────
// Math subjects have no general rubric — scoring is entirely question-specific.

const RUBRICS: Record<string, string> = {
  'ap-psychology': `## AP Psychology FRQ General Rubric (from CED 2024)
TWO FRQ TYPES, each worth 7 points:

FRQ 1: ARTICLE ANALYSIS QUESTION (AAQ) — 7 points
- Part A: Research Method (1 pt) — Accurately identify the research method used
- Part B: Research Variable (1 pt) — State a measurable/quantifiable operational definition of the identified variable
- Part C: Statistic Interpretation (1 pt) — Accurately describe what the statistic indicates in relation to the study
- Part D: Ethical Guidelines (1 pt) — Identify AND describe one ethical guideline applied by researchers (must do both)
- Part E: Generalizability (1 pt) — Explain extent of generalizability using specific participant variables from the study
- Part F: Argumentation (2 pts) — 1 pt for using results but not explaining; 2 pts for using specific results to explain how they support/refute the hypothesis

FRQ 2: EVIDENCE-BASED QUESTION (EBQ) — 7 points
- Part A: Claim (1 pt) — Propose a specific claim relevant to the question
- Part B(i): Evidence (1 pt) — Correctly cite specific, accurate evidence from one source
- Part B(ii): Explanation + Application (2 pts) — 1 pt for explaining evidence-claim relationship; 2 pts for also applying a psychological concept/theory
- Part C(i): Evidence (1 pt) — Correctly cite different evidence from a different source
- Part C(ii): Explanation + Application (2 pts) — Same as B(ii) but must use a DIFFERENT psychological concept

GENERAL SCORING NOTES:
- Each point earned independently
- Definitions alone are NOT sufficient — must connect to the specific scenario/study
- Accept reasonable synonyms for AP terms
- No penalty for extra incorrect info unless it contradicts the correct answer`,

  'ap-world-history': `## AP World History: Modern FRQ General Rubric (from CED 2020)
TYPES: SAQ (Short Answer), LEQ (Long Essay), DBQ (Document-Based)

GENERAL NOTES (all types):
- Each point earned independently
- Historically defensible content required; minor errors acceptable if they don't detract from overall quality
- Essays are first drafts — grammar errors don't count against unless they obscure content
- "Describe" = provide relevant characteristics (more than just mentioning a term)
- "Explain" = provide info about how/why a relationship, process, or outcome occurs

SAQ SCORING (3 points): 1 pt per part. Must be specific: name events, people, dates, processes.
LEQ SCORING (6 points): Thesis (1), Contextualization (1), Evidence (0-2), Analysis & Reasoning (0-2).
DBQ SCORING (7 points): Thesis (1), Contextualization (1), Evidence (0-3), Analysis & Reasoning (0-2).`,

  'ap-government': `## AP U.S. Government and Politics FRQ General Rubric (from CED 2023)
4 QUESTION TYPES:

QUESTION 1: CONCEPT APPLICATION (3 pts) — Describe (1), Explain effect (1), Explain alternate (1)
QUESTION 2: QUANTITATIVE ANALYSIS (4 pts) — Identify (1), Describe (1), Conclude (1), Explain (1)
QUESTION 3: SCOTUS COMPARISON (4 pts) — Identify clause (1), Explain required case (1), Explain non-required case (1), Describe action (1)
QUESTION 4: ARGUMENT ESSAY (6 pts) — Thesis (1), Evidence (0-3), Reasoning (1), Rebuttal (1)

GENERAL NOTES:
- "Describe" = provide relevant characteristics (more than mentioning a term)
- "Explain" = provide info about how or why a relationship exists
- "Identify" = indicate or provide info without elaboration`,

  'ap-calculus-ab': `## AP Calculus AB FRQ General Scoring Notes (from CED)
6 FRQs: 2 calculator-active, 4 no-calculator. Each 9 points across 2–4 parts.

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

  'ap-calculus-bc': `## AP Calculus BC FRQ General Scoring Notes (from CED)
6 FRQs: 2 calculator-active, 4 no-calculator. Each 9 points across 2–4 parts.
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

  'ap-precalculus': `## AP Precalculus FRQ General Scoring Notes (from CED)
4 FRQs across 2 sections. Questions 1-2 require graphing calculator; Questions 3-4 do not.

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

  'ap-chemistry': `## AP Chemistry FRQ General Scoring Notes (from CED)
7 FRQs. Questions 1-3 are long (multi-part), Questions 4-7 are short. No calculator restrictions.

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
1. Reference what the student actually wrote (quote their words)
2. Explain specifically what was missing or incorrect
3. Show how their response could be revised to earn the point — build on their attempt, don't replace it
4. If the student was completely off-topic, explain what the rubric required and give a model response
Set suggestion to null for earned points.

EVIDENCE RULE: student_evidence_quote MUST be a verbatim substring of the student's response for that part. If you cannot find supporting text, use empty string "" and mark met: false. Do NOT paraphrase or invent quotes.`

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

function renderStudentBlock(parts: FRQPart[], responses: Record<string, string>): string {
  const lines = parts.map(p => {
    const raw = responses[p.letter] ?? ''
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
THESIS (1pt) — EARNS: "Communist rule fundamentally transformed Soviet and Chinese societies by restructuring class hierarchies, but the extent of transformation varied as traditional gender roles and rural-urban divides persisted." — HAS a defensible claim WITH a line of reasoning (categories of argument).
THESIS (1pt) — DOES NOT EARN: "Communist rule transformed Soviet and Chinese societies between 1930 and 1990." — Restates the prompt without establishing HOW or WHY.
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

  'scotus_comparison': `GOV SCOTUS COMPARISON CALIBRATION:
EXPLAIN comparison (1pt) — EARNS: "In Lopez, the Court found that possessing a firearm in a school zone was not economic activity connected to interstate commerce, while in Katzenbach, the restaurant's refusal to serve Black customers directly affected interstate commerce through food supply chains." — Explains WHY the facts led to different holdings.
EXPLAIN comparison (1pt) — DOES NOT EARN: "Lopez was about guns and Katzenbach was about restaurants. The Court ruled differently in each case." — Describes each case but does not explain the CONNECTION between facts and holdings.`,

  'argument_essay': `GOV ARGUMENT ESSAY CALIBRATION:
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

const STRICT_MODE_BLOCK = `STRICT MODE: You are grading as a rigorous AP reader preparing a student for the real exam. Do not award sympathy points. Do not credit vague or hand-wavy answers. Do not accept "the student probably meant X" — grade what they literally wrote. If the student's words match the required elements but are in the wrong context (e.g., they defined a term without applying it to the scenario), award 0.`

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

  const pessimisticPrior = `PESSIMISTIC PRIOR: Every scoring point starts at 0. You may only raise a point to its full value if you can quote the exact student text that satisfies every required element of at least one alternative. If you cannot find such a quote, the point MUST remain at 0. There is no partial credit — AP points are binary.`

  const strictnessBlock = strictness === 'strict'
    ? `${STRICT_MODE_BLOCK}\n\n${STRICT_CALIBRATION}`
    : strictness === 'light'
    ? `LIGHT MODE: Give benefit of the doubt on partially correct reasoning. Award points if the student demonstrates understanding even with imprecise language. Focus feedback on what was done right.`
    : `MODERATE MODE: Follow the rubric criteria as written — no extra generosity, no extra harshness. Award points only when criteria are clearly met.`

  const generalRules = `GENERAL RULES:
- BLANK OR MISSING RESPONSES EARN ZERO POINTS. If a part's response is "[NO RESPONSE]", empty, or clearly non-substantive (e.g., "idk", "?"), award 0 for every point of that part.
- Grade ONLY what the student actually wrote. Never credit the student for content that appears only in the rubric.
- Equivalent mathematical expressions earn full credit (e.g., 1-cos(9) = -cos(9)+1).
- Alternative valid solution methods earn full credit if they reach the correct answer.
- For essays: grammar/spelling are not graded — focus on content and reasoning.
- For legacy parts without scoring_points, synthesize one point_result per rubric_criterion with inferred sub_results.
- earned in each part MUST equal the sum of its point_results[].earned.
- total_score MUST equal the sum of parts[].earned.`

  const questionBlock = `QUESTION: ${question.title}
Total Gradable Points: ${gradablePoints}${question.stimulus ? `\n\nSTIMULUS:\n${question.stimulus}` : ''}${question.documents?.length ? `\n\n${renderDocumentsBlock(question.documents)}` : ''}

SCORING RUBRIC (per part):
${gradableParts.map(renderPartBlock).join('\n\n')}`

  const studentBlock = renderStudentBlock(gradableParts, responses)

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

  const studentBlock = renderStudentBlock(gradableParts, responses)

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
