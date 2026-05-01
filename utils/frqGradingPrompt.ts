// utils/frqGradingPrompt.ts
// Builds the system prompt for FRQ grading.
// One pass per grade: role + stance + mode + question rubric + student response.

import type { FRQ, FRQDocument, FRQPart, FRQScoringPoint, GradingStrictness } from '@/utils/frqSession'

// ─── Output Schema ────────────────────────────────────────────────────────────

const OUTPUT_SCHEMA = `OUTPUT FORMAT — respond with raw JSON only (no markdown fences). Schema:

{
  "parts": [
    {
      "letter": "a",
      "point_results": [
        {
          "point_id": "<COPY-EXACT-FROM-RUBRIC>",
          "description": "<copy of description>",
          "earned": 0,
          "max": 1,
          "confidence": 0.95,
          "sub_results": [
            { "element": "<required_element text>", "student_evidence_quote": "<verbatim substring of student response, or \\"\\" if absent>", "met": false }
          ],
          "reasoning": "<1 sentence; when earned=0, name the specific defect>",
          "suggestion": "<1-2 sentences if earned=0; null if earned=max>"
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

RULES:
- POINT_ID: copy each point_id EXACTLY as shown in the rubric (after the word "POINT") — never invent or modify. The <COPY-EXACT-FROM-RUBRIC> token is a placeholder.
- EVIDENCE: student_evidence_quote MUST be a verbatim character-for-character substring of the student's response — preserve original spelling, capitalization, punctuation, Unicode. Do NOT paraphrase, fix grammar, expand abbreviations, or stitch non-adjacent text. If no verbatim support, set quote to "" and met=false. Quote SHORT contiguous substrings (one sentence or key phrase max).
- ESSAY COMPLETENESS: for DBQ, LEQ, argument_essay, essay, and ebq the student writes ONE essay graded against MULTIPLE rubric parts — return a result for EVERY rubric part, grading each part's criteria independently against the full essay text.
- DIAGNOSIS: when earned=0, reasoning must name the specific defect (wrong fact, wrong attribution, missing reasoning, missing specificity, off-topic, computation error, etc.) and suggestion must show how the student's actual attempt could be revised to earn — not just restate the rubric.
- ZERO-CHECK: before assigning earned=0, verify the defect maps to a LITERAL rubric requirement in this prompt. If the defect is "needed deeper explanation" or "needed more specific example" but the rubric only asks to "describe" or "identify", award the point — you are inventing a stricter standard than the rubric requires. The most common false-zero is rejecting a valid response for failing a depth/specificity bar the rubric never set.
- CONFIDENCE: 0.9+ when criteria clearly match or clearly don't; 0.6–0.9 for borderline; below 0.6 only when genuinely undecidable.
- COMPLETENESS: "parts" must have one entry per rubric part (same letters). Each part's "point_results" must have one entry per point_id in that part's rubric — never skip; set earned=0 with reasoning instead. Each part's earned must equal sum of its point_results[].earned. total_score must equal sum of parts[].earned.`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderScoringPoints(points: FRQScoringPoint[]): string {
  return points.map(sp => {
    const alts = (sp.alternatives ?? []).map((alt, i) => {
      const elements = (alt.required_elements ?? []).map(e => `          - ${e}`).join('\n')
      return `        Alternative ${i + 1} — ALL of:\n${elements}\n        Reference example: ${alt.correct_example ?? ''}`
    }).join('\n')
    const wrongs = (sp.wrong_examples ?? []).map(w => `        - ${w}`).join('\n')
    const traps = sp.common_traps?.length
      ? `\n      COMMON TRAPS:\n${sp.common_traps.map(t => `        - ${t}`).join('\n')}`
      : ''
    const officialRubric = sp.official_rubric
      ? `\n      OFFICIAL CB RUBRIC: ${sp.official_rubric}`
      : ''
    const samples = sp.sample_responses?.length
      ? `\n      SAMPLE RESPONSES (calibration):\n${sp.sample_responses.map((s, i) => {
          const verdict = s.earned ? 'EARNED' : 'DID NOT EARN'
          return `        ${i + 1}. ${verdict} — "${s.response}"\n           ${s.commentary}`
        }).join('\n')}`
      : ''
    return `    POINT ${sp.point_id} [${sp.point_value} pt]: ${sp.description}
      EXAMPLES OF EARNING RESPONSES (illustrative, NOT exhaustive — any historically/scientifically/mathematically defensible response addressing the prompt earns this point, even if it doesn't match any listed example):
${alts}
      EXAMPLES OF NON-EARNING RESPONSES (illustrative — these patterns fail the prompt; not a complete list of disqualifying answers):
${wrongs}${traps}${officialRubric}${samples}`
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

// ─── Strictness Mode Stances ──────────────────────────────────────────────────
// One paragraph per mode. The per-point alternatives + sample_responses in the
// rubric data are what actually calibrate severity; the mode stance just sets
// the tone for borderline calls and suggestion phrasing.

const LIGHT_MODE = `LIGHT MODE: Grade as an encouraging teacher. Award credit when the student's response demonstrates understanding, even with imprecise language or partial connections. On multi-element rubric rows ("X AND Y"), award if most elements are present and intent is clear on the missing one. Give benefit of the doubt on rebuttal/refutation rows when the student engages an opposing view at all. Suggestion tone: warm, constructive, lead with what worked.`

const MODERATE_MODE = `MODERATE MODE: Grade as a calibrated AP reader following official scoring guidelines. The College Board's standard is that listed earning examples are ILLUSTRATIVE, not EXHAUSTIVE — any historically/scientifically/mathematically defensible response addressing the prompt earns the point, even if it doesn't match any enumerated example. For history/government FRQs, credit the causal mechanism the student demonstrates — a slightly out-of-period example is acceptable when the mechanism is correct. For chemistry/math, credit the underlying concept when the chemical or mathematical identity is clear despite minor transcription typos. Award thesis/claim rows generously (any defensible position with a reason earns). Apply rubric strictness on multi-element rows ("claim AND reasoning" needs both) and on rebuttal rows (acknowledging an opposing view without engaging it does not earn).

CRITICAL — DO NOT ADD REQUIREMENTS NOT IN THE RUBRIC. Match the rubric criterion EXACTLY as written. If the rubric says "describe X", do NOT require "and explain why X happened". If the rubric asks WHAT changed, do NOT require WHY it changed. If the rubric asks for a "specific example", a named person/policy/event with a one-clause connection to the prompt earns — do NOT require multi-sentence causal explanation. Before scoring 0, mentally re-read the rubric criterion in this prompt and confirm the student's response fails the LITERAL requirement, not a stricter version you imagined. The most common grading error is rejecting valid responses for missing depth or specificity that the rubric does not actually demand.

For SAQ-type prompts in particular (1-point identify/describe/explain rows): a named example that fits the category requested + a brief connection to the prompt's framing earns the point. "Gandhi led revolt against British rule" earns "non-Western nationalist leader" without a multi-sentence treatise on what nationalism means.

Suggestion tone: balanced and direct.`

const STRICT_MODE = `STRICT MODE: Grade with literal rubric application and zero tolerance for ambiguity. Multi-element rows require every element. Hedged or unclear positions on claim/thesis rows do not earn. Tiered evidence rows: award only the tier whose criteria are literally met. Demand specificity on evidence rows (named people/dates/policies, not vague references). Suggestion tone: clinical and precise.`

// ─── Prompt Builders ──────────────────────────────────────────────────────────

export function buildFRQGradingPrompt(
  question: FRQ,
  responses: Record<string, string>,
  strictness: GradingStrictness = 'moderate'
): string {
  const gradableParts = question.parts.filter(p => !p.requires_drawing)
  const gradablePoints = gradableParts.reduce((sum, p) => sum + p.point_value, 0)

  const role = `You are Adi, an experienced AP exam grader. You grade free-response questions strictly against the scoring criteria below — fair but rigorous, like a calibrated AP reader.`

  const gradingStance = `GRADING STANCE: A point is earned when the student's response satisfies the INTENT of any one alternative listed for that point — even via a valid path not literally enumerated. Quote the student's words as evidence for every awarded point. Deny only when no alternative's intent is satisfied. Credit only what the student's own words demonstrate — never credit content that appears only in the reference example.`

  const strictnessBlock =
    strictness === 'strict' ? STRICT_MODE
    : strictness === 'light' ? LIGHT_MODE
    : MODERATE_MODE

  const questionBlock = `QUESTION: ${question.title}
Total Gradable Points: ${gradablePoints}${question.stimulus ? `\n\nSTIMULUS:\n${question.stimulus}` : ''}${question.documents?.length ? `\n\n${renderDocumentsBlock(question.documents)}` : ''}

SCORING RUBRIC (per part):
${gradableParts.map(renderPartBlock).join('\n\n')}`

  const studentBlock = renderStudentBlock(gradableParts, responses, question.frq_type)

  const sections = [
    role,
    gradingStance,
    strictnessBlock,
    OUTPUT_SCHEMA,
    questionBlock,
    studentBlock,
  ]

  return sections.filter(Boolean).join('\n\n')
}

