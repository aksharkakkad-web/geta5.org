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

export interface FRQPart {
  letter: string
  prompt: string
  point_value: number
  rubric_criteria: string[]
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

export interface FRQGradingPart {
  letter: string
  earned: number
  max: number
  feedback: string
  missed: string | null
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
  return ['ap-calculus-ab', 'ap-precalculus', 'ap-chemistry'].includes(subject)
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
