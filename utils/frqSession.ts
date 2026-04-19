// utils/frqSession.ts
// FRQ session types, draft persistence, and helpers

import { lsGet, lsSet, lsClear, LS_KEYS } from '@/utils/localStorage'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FRQType =
  | 'multi_part_math'        // Calc AB, Precalc, Chem — math input + KaTeX preview per part
  | 'multi_part_text'        // Generic multi-part text input
  | 'dbq'                    // World History — split-screen docs + single essay
  | 'saq'                    // World History — short answer, 3 parts (a,b,c)
  | 'leq'                    // World History — single long essay
  | 'essay'                  // Psych — scenario + single essay response (legacy pre-2025 format)
  | 'aaq'                    // Psych — Article Analysis Question (6 parts A-F, Part F tiered 2pts)
  | 'ebq'                    // Psych — Evidence-Based Question: 3 sources + multi-part responses
  | 'argument_essay'         // Gov — prompt + single argumentative essay
  | 'concept_application'    // Gov — scenario + multi-part text
  | 'scotus_comparison'      // Gov — two cases + multi-part comparison
  | 'quantitative_analysis'  // Gov — data stimulus + multi-part analysis

export type GradingStrictness = 'light' | 'moderate' | 'strict'

export interface FRQDocument {
  doc_number: number
  source: string
  content: string
  image: string | null
}

/** One way a student can earn a scoring point — ALL required_elements must be present. */
export interface FRQScoringAlternative {
  required_elements: string[]  // ALL must be present to earn via this alternative
  correct_example: string      // plain example response demonstrating this alternative
}

/** Annotated student response sample for grader calibration.
 * source='cb_guideline' = extracted verbatim or near-verbatim from the College
 * Board scoring guideline PDF. source='synthesized' = constructed from the
 * rubric when no CB sample existed (older exams or generated FRQs). */
export interface FRQSampleResponse {
  response: string              // the sample student response text
  earned: boolean               // did this sample earn the point?
  commentary: string            // 1-2 sentence scorer commentary explaining the verdict
  source: 'cb_guideline' | 'synthesized'
}

/** One earnable AP point with alternatives, wrong examples, and optional traps. */
export interface FRQScoringPoint {
  point_id: string              // e.g., "a1", "b2" — unique within the FRQ
  point_value: number           // almost always 1 (AP points are binary)
  description: string           // plain-English what this point tests
  alternatives: FRQScoringAlternative[]  // any ONE earns the point
  wrong_examples: string[]      // responses that would NOT earn the point
  common_traps?: string[]       // optional pitfalls/misconceptions
  official_rubric?: string      // verbatim or paraphrased CB rubric language for this point
  sample_responses?: FRQSampleResponse[]  // 2-3 annotated samples anchoring earn/no-earn
}

export interface FRQPart {
  letter: string
  prompt: string
  point_value: number
  rubric_criteria: string[]
  scoring_points?: FRQScoringPoint[]
  scoring_notes: string | null
  requires_drawing?: boolean
  reference_image?: string | null
}

export interface FRQ {
  id: string
  subject: string
  year: number | null
  source: 'released' | 'generated'
  title: string
  frq_type: FRQType
  related_units: number[]
  calculator_allowed: boolean
  total_points: number
  stimulus: string | null
  stimulus_image: string | null
  documents: FRQDocument[] | null
  parts: FRQPart[]
}

/** Per-element check result within one scoring alternative. */
export interface FRQGradingSubResult {
  element: string                // copied from required_elements
  student_evidence_quote: string // EXACT substring of the student's response, or "" if not found
  met: boolean
}

/** Grading outcome for one FRQScoringPoint — earned 0 or point_value. */
export interface FRQGradingPointResult {
  point_id: string
  description: string
  earned: number                 // 0 or point_value
  max: number
  confidence: number             // 0-1: how certain the grader is about this score
  sub_results: FRQGradingSubResult[]
  reasoning: string              // 1-sentence grader justification
  suggestion: string | null      // improvement hint for missed points, null if earned
}

export interface FRQGradingPart {
  letter: string
  earned: number
  max: number
  feedback: string
  missed: string | null
  point_results?: FRQGradingPointResult[]
}

export interface FRQGradingResult {
  total_score: number
  max_score: number
  parts: FRQGradingPart[]
  takeaway: string
}

export interface FRQSubmission {
  questionId: string
  subject: string
  responses: Record<string, string>
  strictness: GradingStrictness
}

export interface FRQDraft {
  questionId: string
  subject: string
  responses: Record<string, string>
  currentPart: string
  savedAt: number
  timedMode?: boolean
  timerStartedAt?: number | null
}

// ─── Timer ────────────────────────────────────────────────────────────────────

/** Seconds per FRQ type (per-question average from official CB timing) */
export const FRQ_TYPE_SECONDS: Record<FRQType, number> = {
  // AP Psychology (2024-2025 new format: 70 min Section II split AAQ 25 + EBQ 45)
  aaq:                  25 * 60, // AP Psych: Article Analysis Question — 25 min (10 reading + 15 writing)
  ebq:                  45 * 60, // AP Psych: Evidence-Based Question — 45 min (15 reading + 30 writing)
  essay:                25 * 60, // AP Psych legacy pre-2025 essay (closest analog to AAQ timing)
  multi_part_text:      25 * 60, // AP Psych legacy AAQ stored as multi_part_text — use AAQ timing

  // AP World History: Modern
  saq:                  13 * 60, // 40 min ÷ 3 SAQs ≈ 13 min each
  leq:                  40 * 60, // 40 min recommended
  dbq:                  60 * 60, // 60 min recommended (incl. 15 min reading)

  // AP U.S. Government and Politics (100 min for 4 FRQs, CB suggestion: 20+20+20+40)
  concept_application:  20 * 60,
  scotus_comparison:    20 * 60,
  quantitative_analysis:20 * 60,
  argument_essay:       40 * 60,

  // AP Calculus AB / BC (Part A 30 min / 2 = 15 min; Part B 60 min / 4 = 15 min)
  // AP Precalculus (60 min / 4 = 15 min per FRQ)
  multi_part_math:      15 * 60,
}

/**
 * Returns the number of seconds for this question.
 * AP Chemistry: Q1-Q3 long FRQs (10 pts) → 23 min. Q4-Q7 short FRQs (4 pts) → 9 min.
 * (Threshold ≥10 pts catches the 10-pt long Qs; anything less is a short Q.)
 */
export function getQuestionSeconds(frq: Pick<FRQ, 'frq_type' | 'subject' | 'total_points'>): number {
  if (frq.subject === 'ap-chemistry' && frq.frq_type === 'multi_part_math') {
    return frq.total_points >= 10 ? 23 * 60 : 9 * 60
  }
  return FRQ_TYPE_SECONDS[frq.frq_type] ?? 15 * 60
}

export function getTimedModePreference(): boolean {
  return lsGet<boolean>(LS_KEYS.frqTimedMode, true)
}

export function setTimedModePreference(timed: boolean): void {
  lsSet(LS_KEYS.frqTimedMode, timed)
}

// ─── Draft Persistence ────────────────────────────────────────────────────────

export function saveFRQDraft(draft: FRQDraft): void {
  lsSet(LS_KEYS.frqDraft(draft.subject), draft)
}

export function loadFRQDraft(subject: string): FRQDraft | null {
  return lsGet<FRQDraft | null>(LS_KEYS.frqDraft(subject), null)
}

export function clearFRQDraft(subject: string): void {
  lsClear(LS_KEYS.frqDraft(subject))
}

// ─── Math Tutorial ────────────────────────────────────────────────────────────

export function hasMathTutorialSeen(): boolean {
  return lsGet<boolean>('ascendly_frq_math_tutorial_seen', false)
}

export function setMathTutorialSeen(): void {
  lsSet('ascendly_frq_math_tutorial_seen', true)
}

// ─── Strictness Persistence ──────────────────────────────────────────────────

export function getLastStrictness(): GradingStrictness {
  return lsGet<GradingStrictness>('ascendly_frq_strictness', 'moderate')
}

export function setLastStrictness(s: GradingStrictness): void {
  lsSet('ascendly_frq_strictness', s)
}

// ─── Completion Tracking ─────────────────────────────────────────────────────

export interface FRQCompletion {
  best_score: number
  max_score: number
}

export function loadFRQCompletions(subject: string): Record<string, FRQCompletion> {
  return lsGet<Record<string, FRQCompletion>>(LS_KEYS.frqCompletions(subject), {})
}

export function saveFRQCompletion(
  subject: string,
  questionId: string,
  score: number,
  maxScore: number,
  responses: Record<string, string>,
): void {
  const hasContent = Object.values(responses).some(r => r.trim().length > 0)
  if (!hasContent) return

  const existing = loadFRQCompletions(subject)
  const prev = existing[questionId]
  if (!prev || score > prev.best_score) {
    lsSet(LS_KEYS.frqCompletions(subject), {
      ...existing,
      [questionId]: { best_score: score, max_score: maxScore },
    })
  }
}

// ─── Layout Helpers ──────────────────────────────────────────────────────────

/** Check if a subject uses math input (shortcuts + KaTeX preview) */
export function isMathSubject(subject: string): boolean {
  return ['ap-calculus-ab', 'ap-calculus-bc', 'ap-precalculus', 'ap-chemistry'].includes(subject)
}

/** Check if a subject has FRQs */
export function hasFRQs(subject: string): boolean {
  return subject !== 'ap-csp'
}

/** Calculate total points from parts */
export function totalPoints(parts: FRQPart[]): number {
  return parts.reduce((sum, p) => sum + p.point_value, 0)
}

/** Determine if the FRQ type uses a single essay input (no per-part boxes) */
export function isEssayType(type: FRQType): boolean {
  return ['dbq', 'leq', 'essay', 'argument_essay'].includes(type)
}

/** Determine if the FRQ type uses the DBQ split-screen layout */
export function isDBQType(type: FRQType): boolean {
  return type === 'dbq'
}

/** Determine if the FRQ type uses the EBQ split-screen layout (3 sources + multi-part) */
export function isEBQType(type: FRQType): boolean {
  return type === 'ebq'
}

/** Determine if the FRQ type uses math input */
export function isMathType(type: FRQType): boolean {
  return type === 'multi_part_math'
}

/** Determine if the FRQ type is short-answer style */
export function isSAQType(type: FRQType): boolean {
  return type === 'saq'
}
