// utils/scramble.ts
// Fisher-Yates shuffle — no seed = true randomness on every render
// NEVER pre-scramble in JSON — call this at render time only
export function scramble<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
