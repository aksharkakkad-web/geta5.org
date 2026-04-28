// utils/changelog.ts
export type ChangelogType = 'fix' | 'feature' | 'content' | 'improvement'

export interface ChangelogEntry {
  id: string
  date: string
  type: ChangelogType
  title: string
  body: string
}

/**
 * Returns the list of entries the user has not seen.
 *
 * - null  → first-visit signal: caller should silently set stored = entries[0].id
 *           and render nothing. Triggered when stored is empty/null.
 * - []    → nothing new to show.
 * - [...] → unseen entries, newest-first.
 *
 * If stored id is not found among entries (e.g. data was edited or rolled back),
 * we treat the user as fully unseen.
 */
export function findUnseen(
  entries: ChangelogEntry[],
  stored: string | null | undefined
): ChangelogEntry[] | null {
  if (!stored) return null
  if (entries.length === 0) return []
  const idx = entries.findIndex((e) => e.id === stored)
  if (idx === -1) return entries
  return entries.slice(0, idx)
}
