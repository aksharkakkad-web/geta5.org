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
  | 'essay'                  // Psych — scenario + single essay response
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

/** One earnable AP point with alternatives, wrong examples, and optional traps. */
export interface FRQScoringPoint {
  point_id: string              // e.g., "a1", "b2" — unique within the FRQ
  point_value: number           // almost always 1 (AP points are binary)
  description: string           // plain-English what this point tests
  alternatives: FRQScoringAlternative[]  // any ONE earns the point
  wrong_examples: string[]      // responses that would NOT earn the point
  common_traps?: string[]       // optional pitfalls/misconceptions
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
  essay:                35 * 60, // AP Psych: 70 min ÷ 2 questions
  multi_part_text:      20 * 60, // generic multi-part
  saq:                  13 * 60, // AP World: 40 min ÷ 3 questions
  leq:                  40 * 60, // AP World: 40 min
  dbq:                  60 * 60, // AP World: 60 min
  concept_application:  20 * 60, // AP Gov: ~20 min
  scotus_comparison:    20 * 60, // AP Gov: ~20 min
  quantitative_analysis:20 * 60, // AP Gov: ~20 min
  argument_essay:       40 * 60, // AP Gov: 40 min
  multi_part_math:      15 * 60, // Calc AB / Precalc: 30 min ÷ 2 (Part A or B)
}

/**
 * Returns the number of seconds for this question.
 * Chemistry differentiates long (≥8 pts → 23 min) vs short (<8 pts → 9 min).
 */
export function getQuestionSeconds(frq: Pick<FRQ, 'frq_type' | 'subject' | 'total_points'>): number {
  if (frq.subject === 'ap-chemistry' && frq.frq_type === 'multi_part_math') {
    return frq.total_points >= 8 ? 23 * 60 : 9 * 60
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

/** Determine if the FRQ type uses math input */
export function isMathType(type: FRQType): boolean {
  return type === 'multi_part_math'
}

/** Determine if the FRQ type is short-answer style */
export function isSAQType(type: FRQType): boolean {
  return type === 'saq'
}
