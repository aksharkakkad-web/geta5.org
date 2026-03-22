// utils/fuzzyMatch.ts
// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Returns true if student answer matches correct answer or any alternate.
 *
 * Tolerance is relative to the CORRECT ANSWER length (not input length):
 *   <=5 chars  → 1 edit allowed
 *   <=10 chars → 2 edits allowed
 *   >10 chars  → 3 edits allowed
 *
 * Note: These thresholds are stubs — recalibrate in Phase 13 with real student data.
 * Blank student input ("") against blank correct answer ("") returns true — reject
 * empty submissions at the call site if needed.
 */
export function fuzzyMatch(studentAnswer: string, correctAnswer: string, alternates: string[] = []): boolean {
  const norm = normalize(studentAnswer)
  const allAnswers = [correctAnswer, ...alternates].map(normalize)

  for (const answer of allAnswers) {
    if (norm === answer) return true
    const maxDist = answer.length <= 5 ? 1 : answer.length <= 10 ? 2 : 3
    if (levenshtein(norm, answer) <= maxDist) return true
  }
  return false
}
