// utils/scoring.ts
// Projected AP score 1-5 from cumulative accuracy data
// Stub — calibrated in Phase 13 with real unit weightings
export function projectScore(rawAccuracy: number): 1 | 2 | 3 | 4 | 5 {
  const accuracy = Math.max(0, Math.min(1, rawAccuracy)) // clamp to [0,1]
  if (accuracy >= 0.80) return 5
  if (accuracy >= 0.65) return 4
  if (accuracy >= 0.50) return 3
  if (accuracy >= 0.35) return 2
  return 1
}
