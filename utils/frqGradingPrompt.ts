// utils/frqGradingPrompt.ts
// Builds system prompts for FRQ grading and auditing.
// Two passes in strict mode: grader → auditor (downgrades weak credits only).

import type { FRQ, FRQPart, FRQScoringPoint, GradingStrictness } from '@/utils/frqSession'

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
          "sub_results": [
            { "element": "<required_element text>", "student_evidence_quote": "<EXACT verbatim substring of student response, or empty string if absent>", "met": false }
          ],
          "reasoning": "<1 sentence>"
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
Total Gradable Points: ${gradablePoints}${question.stimulus ? `\n\nSTIMULUS:\n${question.stimulus}` : ''}

SCORING RUBRIC (per part):
${gradableParts.map(renderPartBlock).join('\n\n')}`

  const studentBlock = renderStudentBlock(gradableParts, responses)

  const sections = [
    role,
    answerKeyFirewall,
    pessimisticPrior,
    subjectRubric,
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

  return [
    role,
    auditInstructions,
    studentBlock,
    rubricBlock,
    firstPassBlock,
    OUTPUT_SCHEMA,
    outputInstruction,
  ].filter(Boolean).join('\n\n')
}
