// components/frq/frqContentParser.ts
// Shared parsing utilities for FRQ document content.
// Used by FRQStimulusBlock, FRQEBQLayout, and FRQDBQLayout.

export const SECTION_NAMES = [
  'Introduction',
  'Participants',
  'Method',
  'Results and Discussion',
  'Results',
  'Discussion',
]

const SECTION_HEADER_RE = new RegExp(
  `^(${SECTION_NAMES.join('|')})$`,
  'gm'
)

export interface ParsedSection {
  name: string
  body: string
}

export function parseMultiSection(text: string): ParsedSection[] | null {
  const matches = Array.from(text.matchAll(SECTION_HEADER_RE))
  if (matches.length < 2) return null

  return matches.map((m, i) => {
    const bodyStart = (m.index ?? 0) + m[0].length
    const bodyEnd =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? text.length)
        : text.length
    return {
      name: m[1],
      body: text.slice(bodyStart, bodyEnd).trim(),
    }
  })
}

// ─── Table parsing ────────────────────────────────────────────────────────────

function isTableRow(line: string): boolean {
  const t = line.trim()
  return t.startsWith('|') && t.endsWith('|')
}

function isSeparatorRow(line: string): boolean {
  return /^\|[\s|:-]+\|$/.test(line.trim())
}

export interface TextBlock {
  type: 'text' | 'table'
  content: string
  rows?: string[][]
}

export function parseBodyBlocks(body: string): TextBlock[] {
  const lines = body.split('\n')
  const blocks: TextBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (isTableRow(line)) {
      const tableLines: string[] = []
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines
        .filter(l => !isSeparatorRow(l))
        .map(l =>
          l
            .trim()
            .slice(1, -1)
            .split('|')
            .map(c => c.trim())
        )
      blocks.push({ type: 'table', content: '', rows })
    } else {
      const textLines: string[] = []
      while (i < lines.length && !isTableRow(lines[i])) {
        textLines.push(lines[i])
        i++
      }
      const text = textLines.join('\n').trim()
      if (text) blocks.push({ type: 'text', content: text })
    }
  }

  return blocks
}

// ─── Citation / footnote split ────────────────────────────────────────────────
// APA citations start with "Lastname, F." — capital letter, lowercase word, comma, space, capital+period
// Footnotes start with a digit and colon: "1: Language referencing..."

const CITATION_LINE_RE = /^[A-Z][a-z][a-zA-ZÀ-ÿ\-]*,\s+[A-Z]\./
const FOOTNOTE_LINE_RE = /^\d+:\s/

export interface SplitContent {
  body: string
  citations: string[]
  footnotes: string[]
}

export function splitCitationBlock(text: string): SplitContent {
  const lines = text.split('\n')
  // Walk backward from the end to find where trailing citations/footnotes begin
  let splitIdx = lines.length
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim()
    if (!trimmed) continue
    if (CITATION_LINE_RE.test(trimmed) || FOOTNOTE_LINE_RE.test(trimmed)) {
      splitIdx = i
    } else {
      break
    }
  }

  const bodyLines = lines.slice(0, splitIdx)
  const trailingLines = lines.slice(splitIdx).filter(l => l.trim())

  const citations: string[] = []
  const footnotes: string[] = []
  for (const line of trailingLines) {
    const trimmed = line.trim()
    if (FOOTNOTE_LINE_RE.test(trimmed)) {
      footnotes.push(trimmed)
    } else {
      citations.push(trimmed)
    }
  }

  return {
    body: bodyLines.join('\n').trimEnd(),
    citations,
    footnotes,
  }
}
