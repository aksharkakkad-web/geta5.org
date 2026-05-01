import { readFile } from 'fs/promises'
import path from 'path'

export interface AdiContext {
  subject: string
  unit: string
  page: 'drill' | 'mcq' | 'practice-test' | 'study-guide' | 'home' | 'frq'
  questionId?: string
  userAnswer?: string
  isCorrect?: boolean
  // FRQ-specific — populated when page === 'frq'
  frqResponses?: Record<string, string>
  frqResult?: {
    total_score: number
    max_score: number
    takeaway?: string
    parts?: Array<{
      letter: string
      earned: number
      max: number
      feedback: string
      missed: string | null
    }>
  }
}

const ROLE = `You are Adi, a friendly AP exam tutor built into Ascendly. You help students understand AP course material. You speak clearly, use formatting (headers, bullets, tip callouts), and always tie explanations back to what's tested on the AP exam.`

const GROUNDING = `RULES:
- Only answer based on the provided course content below.
- If the student asks about something outside the AP curriculum, tell them.
- Never make up facts, statistics, or exam details.
- If unsure, say "I'm not sure about that — check your study guide for this unit."
- Keep responses concise (2-4 short paragraphs max unless the student asks you to elaborate).
- Be encouraging but honest — if they got something wrong, explain why clearly.`

const FORMATTING = `FORMATTING:
- Use ## for section headers when organizing a multi-part explanation.
- Use **bold** for key AP terms.
- Use bullet lists for comparisons or listing related concepts.
- For AP Exam Tips, write: **AP Exam Tip:** followed by the tip text.
- For math expressions, use $...$ (KaTeX).
- Keep formatting purposeful — don't over-format short answers.`

async function loadJson(filePath: string): Promise<unknown | null> {
  try {
    const abs = path.join(process.cwd(), 'public', filePath)
    const raw = await readFile(abs, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function truncate(text: string, max: number): string {
  if (typeof text !== 'string') return ''
  const s = text.trim()
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + '…'
}

async function loadFRQContext(ctx: AdiContext): Promise<string> {
  if (ctx.page !== 'frq' || !ctx.questionId) return ''

  const frqFile = `data/${ctx.subject}/frq/${ctx.questionId}.json`
  const question = await loadJson(frqFile) as Record<string, unknown> | null
  if (!question) return ''

  const lines: string[] = []

  // Header
  const title = (question.title as string) || ctx.questionId
  const frqType = (question.frq_type as string) || 'unknown'
  const totalPoints = question.total_points
  const calcAllowed = question.calculator_allowed === true ? 'allowed' : 'not allowed'

  lines.push('## FRQ QUESTION')
  lines.push(`**Title:** ${title}`)
  lines.push(`**Type:** ${frqType} | **Total points:** ${totalPoints ?? '?'} | **Calculator:** ${calcAllowed}`)

  // Stimulus (truncate to 600 chars)
  const stimulus = question.stimulus
  if (typeof stimulus === 'string' && stimulus.trim().length > 0) {
    lines.push('')
    lines.push('### Stimulus')
    lines.push(truncate(stimulus, 600))
  }

  // Documents (DBQ only)
  const documents = question.documents
  if (Array.isArray(documents) && documents.length > 0) {
    lines.push('')
    lines.push('### Documents')
    for (const doc of documents as Array<Record<string, unknown>>) {
      const num = doc.doc_number ?? '?'
      const source = (doc.source as string) || 'Unknown source'
      const content = (doc.content as string) || ''
      lines.push(`**Document ${num}** — *${source}*: ${truncate(content, 200)}`)
    }
  }

  // Parts
  const parts = question.parts
  if (Array.isArray(parts) && parts.length > 0) {
    lines.push('')
    lines.push('### Parts')
    for (const part of parts as Array<Record<string, unknown>>) {
      if (part.requires_drawing === true) continue
      const letter = (part.letter as string) || '?'
      const pv = part.point_value ?? '?'
      const prompt = (part.prompt as string) || ''
      lines.push(`**(${letter})** [${pv} pt]: ${prompt}`)
    }
  }

  // Student responses
  if (ctx.frqResponses && Object.keys(ctx.frqResponses).length > 0) {
    lines.push('')
    lines.push("## STUDENT'S RESPONSES")
    const keys = Object.keys(ctx.frqResponses)
    const isEssayOnly = keys.length === 1 && keys[0] === 'essay'
    if (isEssayOnly) {
      lines.push(`**Essay:**`)
      lines.push(ctx.frqResponses.essay || '')
    } else {
      for (const key of keys) {
        const resp = ctx.frqResponses[key] || ''
        lines.push(`**(${key}):** ${resp}`)
      }
    }
  }

  // Grading result
  if (ctx.frqResult) {
    lines.push('')
    lines.push('## GRADING RESULT')
    lines.push(`**Score:** ${ctx.frqResult.total_score}/${ctx.frqResult.max_score}`)
    if (ctx.frqResult.takeaway) {
      lines.push(`**Adi's takeaway:** ${ctx.frqResult.takeaway}`)
    }
    if (Array.isArray(ctx.frqResult.parts) && ctx.frqResult.parts.length > 0) {
      lines.push('')
      for (const part of ctx.frqResult.parts) {
        lines.push(`**(${part.letter}) — ${part.earned}/${part.max}**`)
        lines.push(`- Feedback: ${part.feedback}`)
        if (part.missed) {
          lines.push(`- Missed: ${part.missed}`)
        }
        lines.push('')
      }
    }
  }

  return '\n' + lines.join('\n').trimEnd()
}

interface DrillCard {
  id?: string
  mode?: string
  prompt?: string
  answer?: string
  group?: string
  difficulty?: string
  is_key_term?: boolean
  katex_required?: boolean
  format_hint?: string
  accepted_answers?: string[]
  choices?: Array<{ text?: string; is_correct?: boolean; explanation?: string }>
}

interface MCQChoice {
  id?: string
  text?: string
  is_correct?: boolean
  explanation?: string
}

interface MCQStimulus {
  type?: string
  content?: unknown
}

interface MCQQuestion {
  id?: string
  question?: string
  difficulty?: string
  stimulus?: MCQStimulus
  choices?: MCQChoice[]
}

function renderDrillCard(card: DrillCard, userAnswer?: string, isCorrect?: boolean): string {
  const lines: string[] = []
  lines.push('## CURRENT DRILL CARD')
  if (card.prompt) lines.push(`**Prompt:** ${card.prompt}`)
  if (card.answer) lines.push(`**Answer:** ${card.answer}`)
  if (card.mode) lines.push(`**Mode:** ${card.mode}`)
  if (card.group) lines.push(`**Group:** ${card.group}`)
  if (card.difficulty) lines.push(`**Difficulty:** ${card.difficulty}`)
  if (Array.isArray(card.accepted_answers) && card.accepted_answers.length > 0) {
    lines.push(`**Accepted answers:** ${card.accepted_answers.join(', ')}`)
  }

  // concept_mc cards have choices
  if (Array.isArray(card.choices) && card.choices.length > 0) {
    lines.push('')
    lines.push('**Choices:**')
    card.choices.forEach((c, idx) => {
      const label = String.fromCharCode(65 + idx) // A, B, C, ...
      const marker = c.is_correct ? ' ← correct' : ''
      lines.push(`- ${label}) ${c.text ?? ''}${marker}`)
    })
    const haveExplanations = card.choices.some((c) => c.explanation)
    if (haveExplanations) {
      lines.push('')
      lines.push('**Per-choice explanations:**')
      card.choices.forEach((c, idx) => {
        const label = String.fromCharCode(65 + idx)
        if (c.explanation) lines.push(`- ${label}) ${c.explanation}`)
      })
    }
  }

  if (userAnswer !== undefined) {
    lines.push('')
    lines.push(`**Student's answer:** "${userAnswer}" (${isCorrect ? 'CORRECT' : 'INCORRECT'})`)
  }

  return lines.join('\n')
}

function renderMCQ(question: MCQQuestion, userAnswer?: string, isCorrect?: boolean): string {
  const lines: string[] = []
  lines.push('## CURRENT MCQ')
  if (question.question) lines.push(`**Question:** ${question.question}`)
  if (question.difficulty) lines.push(`**Difficulty:** ${question.difficulty}`)

  // Stimulus rendering — type-aware, truncated
  const stim = question.stimulus
  if (stim && stim.type && stim.type !== 'none') {
    lines.push('')
    if (stim.type === 'text' && typeof stim.content === 'string') {
      lines.push(`**Stimulus:** ${truncate(stim.content, 400)}`)
    } else if (stim.type === 'code' && typeof stim.content === 'string') {
      lines.push(`**Stimulus (code):**`)
      lines.push('```')
      lines.push(truncate(stim.content, 400))
      lines.push('```')
    } else if (stim.type === 'table') {
      lines.push(`**Stimulus:** [table — see UI]`)
    } else if (stim.type === 'chart') {
      lines.push(`**Stimulus:** [chart — see UI]`)
    } else {
      lines.push(`**Stimulus:** [${stim.type}]`)
    }
  }

  if (Array.isArray(question.choices) && question.choices.length > 0) {
    lines.push('')
    lines.push('**Choices:**')
    question.choices.forEach((c, idx) => {
      const label = c.id ?? String.fromCharCode(65 + idx)
      const marker = c.is_correct ? ' ← correct' : ''
      lines.push(`- ${label}) ${c.text ?? ''}${marker}`)
    })

    const haveExplanations = question.choices.some((c) => c.explanation)
    if (haveExplanations) {
      lines.push('')
      lines.push('**Per-choice explanations:**')
      question.choices.forEach((c, idx) => {
        const label = c.id ?? String.fromCharCode(65 + idx)
        if (c.explanation) lines.push(`- ${label}) ${c.explanation}`)
      })
    }
  }

  if (userAnswer !== undefined) {
    lines.push('')
    lines.push(`**Student's answer:** "${userAnswer}" (${isCorrect ? 'CORRECT' : 'INCORRECT'})`)
  }

  return lines.join('\n')
}

async function loadQuestionContext(ctx: AdiContext): Promise<string> {
  if (!ctx.questionId || ctx.page === 'home' || ctx.page === 'frq') return ''

  const folder = ctx.page === 'drill' ? 'drills' : 'mcq'
  const unitFile = `data/${ctx.subject}/${folder}/${ctx.unit}.json`
  const data = await loadJson(unitFile) as Record<string, unknown> | null
  if (!data) return ''

  const items = (data.cards || data.questions) as Array<Record<string, unknown>>
  if (!Array.isArray(items)) return ''

  const question = items.find((q) => q.id === ctx.questionId)
  if (!question) return ''

  const block = ctx.page === 'drill'
    ? renderDrillCard(question as DrillCard, ctx.userAnswer, ctx.isCorrect)
    : renderMCQ(question as MCQQuestion, ctx.userAnswer, ctx.isCorrect)

  return '\n' + block
}

async function loadStudyGuideContext(ctx: AdiContext): Promise<string> {
  const sgFile = `data/${ctx.subject}/study-guide/${ctx.unit}.json`
  const data = await loadJson(sgFile) as Record<string, unknown> | null
  if (!data) return ''

  const slim = {
    theme: data.theme,
    core_concepts: data.core_concepts,
    exam_tip: data.exam_tip,
  }
  return `\nSTUDY GUIDE FOR THIS UNIT:\n${JSON.stringify(slim, null, 2)}`
}

async function loadMeta(ctx: AdiContext): Promise<string> {
  const metaFile = `data/${ctx.subject}/meta.json`
  const meta = await loadJson(metaFile) as Record<string, unknown> | null
  if (!meta) return ''

  return `\nSUBJECT: ${meta.display_name || ctx.subject}\nUNIT: ${ctx.unit}`
}

async function loadAdiContext(ctx: AdiContext): Promise<string> {
  const file = `data/${ctx.subject}/adi-context.json`
  const data = await loadJson(file) as Record<string, unknown> | null
  if (!data) return ''

  // Always include exam overview
  const parts: string[] = []
  if (data.exam_overview) {
    parts.push(`EXAM OVERVIEW:\n${JSON.stringify(data.exam_overview, null, 2)}`)
  }

  // Include only the current unit's context to save tokens
  const units = data.units as Array<Record<string, unknown>> | undefined
  if (Array.isArray(units) && ctx.unit) {
    const unit = units.find((u) => u.unit === ctx.unit)
    if (unit) {
      parts.push(`CURRENT UNIT DETAIL:\n${JSON.stringify(unit, null, 2)}`)
    }
  }

  return parts.length ? '\n' + parts.join('\n\n') : ''
}

export async function buildSystemPrompt(ctx: AdiContext): Promise<string> {
  const [questionCtx, guideCtx, metaCtx, adiCtx, frqCtx] = await Promise.all([
    loadQuestionContext(ctx),
    loadStudyGuideContext(ctx),
    loadMeta(ctx),
    loadAdiContext(ctx),
    loadFRQContext(ctx),
  ])

  return [ROLE, GROUNDING, FORMATTING, metaCtx, adiCtx, guideCtx, questionCtx, frqCtx]
    .filter(Boolean)
    .join('\n\n')
}
