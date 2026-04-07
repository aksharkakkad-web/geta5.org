// utils/frqGradingPrompt.ts
// Builds system prompt for Adi FRQ grading — rubrics hardcoded per subject

import type { FRQ, GradingStrictness } from '@/utils/frqSession'

// ─── Per-Subject General Rubric Blocks ────────────────────────────────────────
// Humanities only — these subjects have structured, consistent rubric patterns.
// Math subjects (Calc, Precalc, Chem) have NO general rubric — scoring is
// entirely question-specific via rubric_criteria + scoring_notes in the JSON.
//
// For humanities, this general rubric is combined with per-question scoring
// guidelines to give Adi both the structural framework AND the specific answers.
// TODO: Refine from actual general-rubric PDFs once user uploads them.

const RUBRICS: Record<string, string> = {
  'ap-psychology': `## AP Psychology FRQ General Rubric (from CED 2024)
TWO FRQ TYPES, each worth 7 points:

FRQ 1: ARTICLE ANALYSIS QUESTION (AAQ) — 7 points
Students are given a summarized peer-reviewed source and must:
- Part A: Research Method (1 pt) — Accurately identify the research method used
- Part B: Research Variable (1 pt) — State a measurable/quantifiable operational definition of the identified variable
- Part C: Statistic Interpretation (1 pt) — Accurately describe what the statistic indicates in relation to the study
- Part D: Ethical Guidelines (1 pt) — Identify AND describe one ethical guideline applied by researchers (must do both)
- Part E: Generalizability (1 pt) — Explain extent of generalizability using specific participant variables from the study
- Part F: Argumentation (2 pts) — 1 pt for using results but not explaining; 2 pts for using specific results to explain how they support/refute the hypothesis

FRQ 2: EVIDENCE-BASED QUESTION (EBQ) — 7 points
Students are given 2-3 sources and must:
- Part A: Claim (1 pt) — Propose a specific claim relevant to the question
- Part B(i): Evidence (1 pt) — Correctly cite specific, accurate evidence from one source
- Part B(ii): Explanation + Application (2 pts) — 1 pt for explaining evidence-claim relationship; 2 pts for also applying a psychological concept/theory
- Part C(i): Evidence (1 pt) — Correctly cite different evidence from a different source
- Part C(ii): Explanation + Application (2 pts) — Same as B(ii) but must use a DIFFERENT psychological concept

GENERAL SCORING NOTES:
- Each point earned independently
- Definitions alone are NOT sufficient — must connect to the specific scenario/study
- Accept reasonable synonyms for AP terms
- No penalty for extra incorrect info unless it contradicts the correct answer
- Accuracy of general pattern matters more than exact numbers when citing data`,

  'ap-world-history': `## AP World History: Modern FRQ General Rubric (from CED 2020)
TYPES: SAQ (Short Answer), LEQ (Long Essay), DBQ (Document-Based)

GENERAL NOTES (all types):
- Each point earned independently
- Historically defensible content required; minor errors acceptable if they don't detract from overall quality
- Essays are first drafts — grammar errors don't count against unless they obscure content
- "Describe" = provide relevant characteristics (more than just mentioning a term)
- "Explain" = provide info about how/why a relationship, process, or outcome occurs

SAQ SCORING (3 points):
- 1 pt per part (a, b, c). Must answer what is specifically asked.
- Must be specific: name events, people, dates, processes — vague generalities earn 0
- One-sentence answers can earn full credit if specific and accurate enough

LEQ SCORING (6 points):
- A. Thesis/Claim (1 pt): Historically defensible thesis that establishes a line of reasoning, not just restate prompt. Must be in one place (intro or conclusion).
- B. Contextualization (1 pt): Describe broader historical events/developments before, during, or after the time frame. More than a phrase or reference.
- C. Evidence (0-2 pts): 1 pt for identifying specific historical examples relevant to prompt. 2 pts for using specific evidence to SUPPORT an argument.
- D. Analysis & Reasoning (0-2 pts): 1 pt for using historical reasoning (comparison, causation, CCOT) to frame argument (may be uneven). 2 pts for demonstrating complex understanding through sophisticated argumentation (multiple themes/perspectives, causes/effects, or insightful connections across periods).

DBQ SCORING (7 points):
- A. Thesis/Claim (1 pt): Same as LEQ
- B. Contextualization (1 pt): Same as LEQ
- C. Evidence (0-3 pts):
  - 1 pt: Accurately describe (not just quote) content from at least 3 documents
  - 2 pts: Use content of at least 4 documents to SUPPORT an argument
  - 1 pt: Use at least one additional piece of specific historical evidence BEYOND the documents
- D. Analysis & Reasoning (0-2 pts):
  - 1 pt: For at least 2 documents, explain how/why the document's point of view, purpose, historical situation, or audience is relevant to the argument (HAPP sourcing)
  - 1 pt: Demonstrate complex understanding through sophisticated argumentation or effective use of evidence (e.g., using 7 docs effectively, sourcing 4+ docs, or connecting documents to evidence beyond docs)`,

  'ap-government': `## AP U.S. Government and Politics FRQ General Rubric (from CED 2023)
4 QUESTION TYPES on the exam:

QUESTION 1: CONCEPT APPLICATION (3 pts)
- Part A (1 pt): Describe — provide relevant characteristics of the political concept in the scenario (Skill 1.D)
- Part B (1 pt): Explain — how/why the action affects policymaking, institutions, or political behavior (Skill 1.E)
- Part C (1 pt): Explain — how a different scenario/factor would affect strategy or outcome (Skill 1.E)

QUESTION 2: QUANTITATIVE ANALYSIS (4 pts)
- Part A (1 pt): Identify — a specific data point, trend, or pattern from the graphic (Skill 3.A)
- Part B (1 pt): Describe — a similarity or difference in the data (Skill 3.B)
- Part C (1 pt): Draw a conclusion — about the similarity/difference described (Skill 3.C)
- Part D (1 pt): Explain — how the data demonstrates a political principle (federalism, separation of powers, etc.) (Skill 3.D)

QUESTION 3: SCOTUS COMPARISON (4 pts)
- Part A (1 pt): Identify — the constitutional clause/principle common to both cases
- Part B (1 pt): Explain — how the facts of the required case led to its holding
- Part C (1 pt): Explain — how the non-required case's facts led to a different holding
- Part D (1 pt): Describe — an action that could be taken consistent with one ruling

QUESTION 4: ARGUMENT ESSAY (6 pts)
- Row A: Claim/Thesis (1 pt): Defensible claim that establishes a line of reasoning. Must be in one place (intro or conclusion).
- Row B: Evidence (0-3 pts): 1 pt for one piece of specific evidence. 2 pts for two pieces that support the argument. 3 pts for using evidence from one+ foundational document AND a relevant political institution/process/behavior.
- Row C: Reasoning (1 pt): Use reasoning (classification, process, comparison, causal) to explain WHY evidence supports the claim.
- Row D: Rebuttal (1 pt): Respond to an opposing or alternate perspective using refutation, concession, or rebuttal.

GENERAL SCORING NOTES:
- Each point earned independently
- "Describe" = provide relevant characteristics (more than mentioning a term)
- "Explain" = provide info about how or why a relationship exists
- "Identify" = indicate or provide info about a specified topic without elaboration`,

  // Math subjects have NO general rubric — grading relies entirely on
  // per-question scoring guidelines (rubric_criteria + scoring_notes in JSON).
  // These are generated at content-creation time for generated FRQs, or
  // extracted from College Board scoring guideline PDFs for released FRQs.
}

// ─── Grading Prompt Builder ──────────────────────────────────────────────────

const GRADING_ROLE = `You are Adi, an AP exam grader built into Ascendly. You grade free response questions strictly according to the scoring criteria provided for each part. The scoring criteria below include the CORRECT ANSWERS — use them as your answer key. Do not attempt to solve the problem yourself. Compare the student's work against the provided correct answer and scoring notes. You are fair but rigorous — you grade like an experienced AP reader.`

const GRADING_RULES = `GRADING RULES:
- Award points ONLY when the criterion is clearly met — do not give benefit of the doubt
- Partial credit: If a rubric criterion is partially met, award 0 for that point (AP exams are binary per point)
- Equivalent mathematical expressions earn full credit (e.g., 1-cos(9) = -cos(9)+1)
- Alternative valid solution methods earn full credit if they reach the correct answer
- Minor notation differences are acceptable (e.g., f'(x) vs dy/dx)
- For math: correct answer with no work shown still earns answer points but not setup/method points
- For essays: grammar/spelling are not graded — focus on content and reasoning
- Be encouraging in feedback but honest about what was missed`

const RESPONSE_FORMAT = `RESPOND IN THIS EXACT JSON FORMAT (no markdown fences, just raw JSON):
{
  "total_score": <number>,
  "max_score": <number>,
  "parts": [
    {
      "letter": "<a|b|c|...>",
      "earned": <number>,
      "max": <number>,
      "feedback": "<what earned points — 1-2 sentences>",
      "missed": "<what was missing — 1-2 sentences, or null if full marks>"
    }
  ],
  "takeaway": "<one key improvement tip for the student — 1-2 sentences>"
}`

const STRICTNESS_MODIFIERS: Record<GradingStrictness, string> = {
  light: `STRICTNESS: LIGHT
- Give benefit of the doubt on partially correct reasoning
- Award points if the student demonstrates understanding even with imprecise language
- Focus feedback on what was done RIGHT, with gentle suggestions for improvement
- If the student's approach is valid but unconventional, award full credit`,

  moderate: `STRICTNESS: MODERATE (Standard AP Grading)
- Follow the rubric criteria as written — no extra generosity, no extra harshness
- Award points only when criteria are clearly met
- Acknowledge good work but be direct about what was missed`,

  strict: `STRICTNESS: STRICT (Rigorous AP Reader)
- Require precise academic language and explicit justification
- Vague or hand-wavy reasoning does not earn points even if the intent seems correct
- "Because it increases" is not sufficient — must explain WHY with specific principles
- Missing units, improper notation, or skipped steps lose points where rubric allows
- This simulates the toughest AP readers — used for final exam prep`,
}

export function buildFRQGradingPrompt(
  question: FRQ,
  responses: Record<string, string>,
  strictness: GradingStrictness = 'moderate'
): string {
  const rubric = RUBRICS[question.subject] ?? ''
  const strictnessBlock = STRICTNESS_MODIFIERS[strictness]

  // Exclude drawing parts — they're self-assessed, not graded by Adi
  const gradableParts = question.parts.filter(p => !p.requires_drawing)
  const gradablePoints = gradableParts.reduce((sum, p) => sum + p.point_value, 0)

  const questionBlock = `QUESTION: ${question.title}
Total Points (gradable): ${gradablePoints}
${question.stimulus ? `\nSTIMULUS:\n${question.stimulus}\n` : ''}
PARTS (with correct answers from official scoring guidelines):
${gradableParts.map(p => `(${p.letter}) [${p.point_value} pt${p.point_value > 1 ? 's' : ''}] ${p.prompt}
  Scoring criteria:${p.rubric_criteria.map((c, i) => `\n    ${i + 1}. ${c}`).join('')}${p.scoring_notes ? `\n  Scoring notes: ${p.scoring_notes}` : ''}`).join('\n\n')}`

  const studentBlock = `STUDENT RESPONSES:
${Object.entries(responses).map(([letter, text]) =>
    `(${letter}): ${text.trim() || '[NO RESPONSE]'}`
  ).join('\n')}`

  return [GRADING_ROLE, rubric, strictnessBlock, GRADING_RULES, RESPONSE_FORMAT, questionBlock, studentBlock]
    .filter(Boolean)
    .join('\n\n')
}
