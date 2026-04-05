import { readFile } from 'fs/promises'
import path from 'path'

export interface AdiContext {
  subject: string
  unit: string
  page: 'drill' | 'mcq' | 'practice-test' | 'study-guide' | 'home'
  questionId?: string
  userAnswer?: string
  isCorrect?: boolean
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

async function loadQuestionContext(ctx: AdiContext): Promise<string> {
  if (!ctx.questionId || ctx.page === 'home') return ''

  const folder = ctx.page === 'drill' ? 'drills' : 'mcq'
  const unitFile = `data/${ctx.subject}/${folder}/${ctx.unit}.json`
  const data = await loadJson(unitFile) as Record<string, unknown> | null
  if (!data) return ''

  const items = (data.cards || data.questions) as Array<Record<string, unknown>>
  if (!Array.isArray(items)) return ''

  const question = items.find((q) => q.id === ctx.questionId)
  if (!question) return ''

  let block = `\nCURRENT QUESTION:\n${JSON.stringify(question, null, 2)}`

  if (ctx.userAnswer !== undefined) {
    block += `\n\nSTUDENT'S ANSWER: "${ctx.userAnswer}" (${ctx.isCorrect ? 'CORRECT' : 'INCORRECT'})`
  }

  return block
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
  const [questionCtx, guideCtx, metaCtx, adiCtx] = await Promise.all([
    loadQuestionContext(ctx),
    loadStudyGuideContext(ctx),
    loadMeta(ctx),
    loadAdiContext(ctx),
  ])

  return [ROLE, GROUNDING, FORMATTING, metaCtx, adiCtx, guideCtx, questionCtx]
    .filter(Boolean)
    .join('\n\n')
}
