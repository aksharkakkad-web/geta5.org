# Adi Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI tutoring chatbot ("Adi") that helps students understand AP content, with a floating diamond mascot, contextual nudges, and streaming GPT-4o-mini responses.

**Architecture:** Floating bubble renders in root layout via AdiProvider context. Chat panel opens as a right sidebar with streaming responses from `/api/chat`. Context (current question, study guide, unit) is injected into the system prompt server-side. Nudges fire on wrong answers and idle study guide reading.

**Tech Stack:** Vercel AI SDK (`ai` + `@ai-sdk/openai`), `react-markdown` + `remark-math` + `rehype-katex` for formatted responses, React Context for state, existing Tailwind v4 + CSS custom properties.

**Design Spec:** `docs/superpowers/specs/2026-04-04-adi-chatbot-design.md`

---

## File Structure

```
NEW FILES:
  components/adi/AdiProvider.tsx      — React context: open/close, conversation, nudge dispatch
  components/adi/AdiMascot.tsx        — SVG diamond mascot (full + small icon variants)
  components/adi/AdiBubble.tsx        — fixed-position floating bubble + click handler
  components/adi/AdiChatPanel.tsx     — right sidebar: header, messages, input, chips
  components/adi/AdiChatMessage.tsx   — single message with markdown→HTML + KaTeX
  components/adi/AdiQuickChips.tsx    — contextual quick action chip row
  components/adi/AdiNudge.tsx         — soft speech bubble above Adi
  components/adi/AdiIdleNudge.tsx     — inline nudge bar for study guide
  hooks/useAdiContext.ts              — builds context object from current page/URL
  hooks/useAdiNudge.ts               — nudge trigger logic, frequency cap, dismiss tracking
  app/api/chat/route.ts              — streaming chat endpoint with context injection
  utils/adiPrompt.ts                 — system prompt builder + context loader

MODIFIED FILES:
  app/layout.tsx                     — wrap children with AdiProvider, render AdiBubble
  app/globals.css                    — add Adi-specific CSS animations + chat panel styles
  utils/localStorage.ts              — add adi keys to LS_KEYS
  package.json                       — add ai, @ai-sdk/openai, react-markdown, remark-math, rehype-katex
  components/mcq/MCQCard.tsx         — dispatch Adi nudge event on wrong answer
  components/drill/DrillCard.tsx     — dispatch Adi nudge event on wrong answer
  app/[subject]/study-guide/page.tsx — render AdiIdleNudge
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Vercel AI SDK + OpenAI provider**

```bash
npm install ai @ai-sdk/openai
```

- [ ] **Step 2: Install markdown rendering stack**

```bash
npm install react-markdown remark-math rehype-katex
```

- [ ] **Step 3: Verify install succeeded**

```bash
npm ls ai @ai-sdk/openai react-markdown remark-math rehype-katex
```

Expected: all 5 packages listed without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Vercel AI SDK + markdown rendering deps for Adi chatbot"
```

---

### Task 2: localStorage Keys + Usage Tracking

**Files:**
- Modify: `utils/localStorage.ts`

- [ ] **Step 1: Add Adi keys to LS_KEYS**

In `utils/localStorage.ts`, add to the `LS_KEYS` object:

```typescript
export const LS_KEYS = {
  // ... existing keys ...
  adiMessages: 'ascendly_adi_messages',
  adiDismissCount: 'ascendly_adi_dismiss_count',
} as const
```

- [ ] **Step 2: Commit**

```bash
git add utils/localStorage.ts
git commit -m "feat(adi): add localStorage keys for usage tracking and nudge dismiss count"
```

---

### Task 3: System Prompt Builder + Context Loader

**Files:**
- Create: `utils/adiPrompt.ts`

- [ ] **Step 1: Create the prompt builder**

Create `utils/adiPrompt.ts`:

```typescript
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

  // Truncate to keep token budget reasonable — send theme + core concepts + exam tip
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

export async function buildSystemPrompt(ctx: AdiContext): Promise<string> {
  const [questionCtx, guideCtx, metaCtx] = await Promise.all([
    loadQuestionContext(ctx),
    loadStudyGuideContext(ctx),
    loadMeta(ctx),
  ])

  return [ROLE, GROUNDING, FORMATTING, metaCtx, guideCtx, questionCtx]
    .filter(Boolean)
    .join('\n\n')
}
```

- [ ] **Step 2: Commit**

```bash
git add utils/adiPrompt.ts
git commit -m "feat(adi): add system prompt builder with context injection from static JSON"
```

---

### Task 4: Streaming Chat API Route

**Files:**
- Create: `app/api/chat/route.ts`

- [ ] **Step 1: Create the chat endpoint**

Create `app/api/chat/route.ts`:

```typescript
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { buildSystemPrompt, type AdiContext } from '@/utils/adiPrompt'

// Simple in-memory rate limit: IP → { count, resetAt }
const ipCounts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: Request) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, context } = (await req.json()) as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    context: AdiContext
  }

  // Only send last 10 messages to keep token budget predictable
  const recentMessages = messages.slice(-10)

  const systemPrompt = await buildSystemPrompt(context)

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: recentMessages,
  })

  return result.toDataStreamResponse()
}
```

- [ ] **Step 2: Verify the route compiles**

```bash
npx tsc --noEmit app/api/chat/route.ts 2>&1 || echo "Check for type errors"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat(adi): add streaming chat API route with context injection and rate limiting"
```

---

### Task 5: Adi SVG Mascot Component

**Files:**
- Create: `components/adi/AdiMascot.tsx`

- [ ] **Step 1: Create the mascot SVG component**

Create `components/adi/AdiMascot.tsx`:

```tsx
'use client'

interface AdiMascotProps {
  size?: number
  className?: string
}

export function AdiMascot({ size = 80, className = '' }: AdiMascotProps) {
  // Aspect ratio of the full mascot viewBox (160x180)
  const height = size * (180 / 160)

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Adi, your AP study buddy"
    >
      <defs>
        <linearGradient id="adiBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="35%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="adiFaceTL" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="adiFaceTR" x1="100%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="adiFaceBL" x1="0%" y1="50%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="adiFaceBR" x1="100%" y1="50%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="adiGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="adiShine" cx="38%" cy="30%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="170" rx="22" ry="4" fill="#a855f7" opacity="0.1" />
      {/* Glow aura */}
      <circle cx="80" cy="78" r="62" fill="url(#adiGlow)" />

      {/* Sparkle particles */}
      <circle cx="16" cy="44" r="2.5" fill="#67e8f9" opacity="0.65">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="144" cy="50" r="2" fill="#c084fc" opacity="0.55">
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="26" cy="116" r="1.8" fill="#818cf8" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.9s" repeatCount="indefinite" />
      </circle>
      <circle cx="134" cy="108" r="2.2" fill="#67e8f9" opacity="0.45">
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2.3s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="6" r="2" fill="#fde68a" opacity="0.55">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3.1s" repeatCount="indefinite" />
      </circle>
      <circle cx="44" cy="20" r="1.6" fill="#a78bfa" opacity="0.45">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="24" r="1.4" fill="#22d3ee" opacity="0.45">
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="1.7s" repeatCount="indefinite" />
      </circle>

      {/* Diamond body */}
      <polygon points="80,15 135,78 80,141 25,78" fill="url(#adiBody)" />
      {/* Faceted highlights */}
      <polygon points="80,15 135,78 80,78" fill="url(#adiFaceTR)" />
      <polygon points="80,15 25,78 80,78" fill="url(#adiFaceTL)" />
      <polygon points="25,78 80,141 80,78" fill="url(#adiFaceBL)" />
      <polygon points="135,78 80,141 80,78" fill="url(#adiFaceBR)" />
      {/* Inner shine */}
      <polygon points="80,15 135,78 80,141 25,78" fill="url(#adiShine)" />
      {/* Purple outline */}
      <polygon
        points="80,15 135,78 80,141 25,78"
        fill="none"
        stroke="#a855f7"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* Facet lines */}
      <line x1="80" y1="15" x2="80" y2="141" stroke="white" strokeWidth="0.4" opacity="0.1" />
      <line x1="25" y1="78" x2="135" y2="78" stroke="white" strokeWidth="0.4" opacity="0.08" />

      {/* Eyes */}
      <ellipse cx="62" cy="72" rx="9.5" ry="10.5" fill="#1a1a2e" />
      <ellipse cx="98" cy="72" rx="9.5" ry="10.5" fill="#1a1a2e" />
      {/* Eye sparkles */}
      <circle cx="58" cy="67" r="4" fill="white" opacity="0.92" />
      <circle cx="94" cy="67" r="4" fill="white" opacity="0.92" />
      <circle cx="66" cy="76" r="2" fill="white" opacity="0.4" />
      <circle cx="102" cy="76" r="2" fill="white" opacity="0.4" />
      {/* Smile */}
      <path d="M66 93 Q80 104 94 93" stroke="#1a1a2e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** Small icon variant for chat header + nudge bars */
export function AdiIcon({ size = 40, className = '' }: AdiMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Adi"
    >
      <defs>
        <linearGradient id="adiIconBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="35%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <radialGradient id="adiIconGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="adiIconShine" cx="38%" cy="30%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#adiIconGlow)" />
      <polygon points="22,4 40,22 22,40 4,22" fill="url(#adiIconBody)" />
      <polygon points="22,4 40,22 22,40 4,22" fill="url(#adiIconShine)" />
      <polygon points="22,4 40,22 22,40 4,22" fill="none" stroke="#a855f7" strokeWidth="1" strokeLinejoin="round" opacity="0.5" />
      <ellipse cx="16" cy="21" rx="2.8" ry="3" fill="#1a1a2e" />
      <ellipse cx="28" cy="21" rx="2.8" ry="3" fill="#1a1a2e" />
      <circle cx="14.5" cy="19.5" r="1.2" fill="white" opacity="0.9" />
      <circle cx="26.5" cy="19.5" r="1.2" fill="white" opacity="0.9" />
      <path d="M17 27 Q22 30.5 27 27" stroke="#1a1a2e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/adi/AdiMascot.tsx
git commit -m "feat(adi): add Floating Diamond SVG mascot with sparkle animations"
```

---

### Task 6: AdiProvider (React Context)

**Files:**
- Create: `components/adi/AdiProvider.tsx`
- Create: `hooks/useAdiContext.ts`

- [ ] **Step 1: Create the useAdiContext hook**

Create `hooks/useAdiContext.ts`:

```typescript
'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import type { AdiContext } from '@/utils/adiPrompt'

/**
 * Derives Adi's context from the current URL path.
 * Does NOT include questionId/userAnswer — those are set by page components via AdiProvider.
 */
export function useAdiContext(): AdiContext {
  const pathname = usePathname()

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    // Pattern: /[subject]/[mode] e.g. /ap-psychology/practice
    const subject = segments[0] ?? ''
    const mode = segments[1] ?? ''

    const pageMap: Record<string, AdiContext['page']> = {
      drills: 'drill',
      practice: 'mcq',
      'practice-test': 'practice-test',
      'study-guide': 'study-guide',
    }

    return {
      subject,
      unit: '', // set by page components via setAdiQuestion
      page: pageMap[mode] ?? 'home',
    }
  }, [pathname])
}
```

- [ ] **Step 2: Create the AdiProvider**

Create `components/adi/AdiProvider.tsx`:

```tsx
'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { useChat, type Message } from 'ai/react'
import { useAdiContext } from '@/hooks/useAdiContext'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import type { AdiContext } from '@/utils/adiPrompt'

interface QuestionInfo {
  questionId: string
  unit: string
  userAnswer?: string
  isCorrect?: boolean
}

interface AdiState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  // Chat
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e?: React.FormEvent) => void
  isLoading: boolean
  sendMessage: (text: string) => void
  // Context
  context: AdiContext
  setQuestion: (info: QuestionInfo | null) => void
  // Nudge
  nudgeText: string | null
  showNudge: (text: string) => void
  dismissNudge: () => void
  nudgeDismissCount: number
}

const AdiContext_ = createContext<AdiState | null>(null)

export function useAdi(): AdiState {
  const ctx = useContext(AdiContext_)
  if (!ctx) throw new Error('useAdi must be used within AdiProvider')
  return ctx
}

export function AdiProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [nudgeText, setNudgeText] = useState<string | null>(null)
  const [questionInfo, setQuestionInfo] = useState<QuestionInfo | null>(null)
  const nudgeDismissCountRef = useRef(lsGet(LS_KEYS.adiDismissCount, 0))

  const baseContext = useAdiContext()

  // Merge base context (from URL) with question-specific context (from page component)
  const context: AdiContext = {
    ...baseContext,
    ...(questionInfo && {
      unit: questionInfo.unit,
      questionId: questionInfo.questionId,
      userAnswer: questionInfo.userAnswer,
      isCorrect: questionInfo.isCorrect,
    }),
  }

  const { messages, input, handleInputChange, handleSubmit: chatSubmit, isLoading, append, setMessages } = useChat({
    api: '/api/chat',
    body: { context },
    onFinish: () => {
      // Increment usage counter
      const count = lsGet(LS_KEYS.adiMessages, 0)
      lsSet(LS_KEYS.adiMessages, count + 1)
    },
  })

  const open = useCallback(() => {
    setIsOpen(true)
    setNudgeText(null) // clear nudge when chat opens
  }, [])

  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setNudgeText(null)
      return !prev
    })
  }, [])

  const sendMessage = useCallback((text: string) => {
    append({ role: 'user', content: text })
  }, [append])

  const setQuestion = useCallback((info: QuestionInfo | null) => {
    setQuestionInfo(info)
    // Clear conversation when question context changes (per-session memory)
    setMessages([])
  }, [setMessages])

  const showNudge = useCallback((text: string) => {
    // Suppress if dismissed too many times this session
    if (nudgeDismissCountRef.current >= 3) return
    setNudgeText(text)
  }, [])

  const dismissNudge = useCallback(() => {
    setNudgeText(null)
    nudgeDismissCountRef.current++
    lsSet(LS_KEYS.adiDismissCount, nudgeDismissCountRef.current)
  }, [])

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault()
    chatSubmit(e)
  }, [chatSubmit])

  return (
    <AdiContext_.Provider
      value={{
        isOpen, open, close, toggle,
        messages, input, handleInputChange, handleSubmit, isLoading, sendMessage,
        context, setQuestion,
        nudgeText, showNudge, dismissNudge, nudgeDismissCount: nudgeDismissCountRef.current,
      }}
    >
      {children}
    </AdiContext_.Provider>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/adi/AdiProvider.tsx hooks/useAdiContext.ts
git commit -m "feat(adi): add AdiProvider context with chat, nudge, and context management"
```

---

### Task 7: Adi CSS Styles

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add Adi styles to globals.css**

Append to the bottom of `app/globals.css`:

```css
/* === Adi Chatbot === */

.adi-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 900;
  cursor: pointer;
  animation: adiBob 3.5s ease-in-out infinite;
  transition: transform 0.2s ease;
  filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.35)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
}
.adi-bubble:hover {
  transform: scale(1.08);
}
@keyframes adiBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* Soft nudge speech bubble */
.adi-nudge {
  position: fixed;
  bottom: 120px;
  right: 32px;
  max-width: 200px;
  z-index: 899;
  animation: nudgeFade 0.5s ease-out;
}
.adi-nudge-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  background: rgba(14, 14, 22, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 14px 14px 4px 14px;
  padding: 12px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}
.adi-nudge-text strong {
  color: #c4b5fd;
}
@keyframes nudgeFade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Chat panel */
.adi-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100dvh;
  background: var(--bg-secondary);
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: panelSlide 0.25s ease-out;
}
@keyframes panelSlide {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.adi-panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 14px;
}
.adi-panel-header h3 {
  font-size: 15px;
  font-weight: 600;
}
.adi-panel-status {
  font-size: 11px;
  color: var(--accent-success);
  display: flex;
  align-items: center;
  gap: 4px;
}
.adi-panel-status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-success);
}
.adi-panel-close {
  margin-left: auto;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  background: none;
  border: none;
  transition: color 0.15s;
}
.adi-panel-close:hover {
  color: var(--text-secondary);
}

/* Messages area */
.adi-messages {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.adi-ctx-pill {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  color: var(--accent);
  text-align: center;
}
.adi-msg {
  max-width: 92%;
  line-height: 1.6;
}
.adi-msg-user {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px 16px 4px 16px;
  padding: 12px 16px;
  font-size: 13.5px;
  align-self: flex-end;
  color: var(--text-primary);
}
.adi-msg-adi {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px 16px 16px 4px;
  padding: 16px 18px;
  font-size: 13.5px;
  align-self: flex-start;
}
/* Adi message rich formatting */
.adi-msg-adi h2 {
  font-size: 12.5px;
  font-weight: 600;
  color: #a5b4fc;
  margin: 12px 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.adi-msg-adi h2:first-child {
  margin-top: 2px;
}
.adi-msg-adi ul, .adi-msg-adi ol {
  margin: 4px 0 8px 18px;
  font-size: 13px;
}
.adi-msg-adi li {
  margin-bottom: 5px;
  color: var(--text-secondary);
}
.adi-msg-adi li strong {
  color: var(--text-primary);
}
.adi-msg-adi strong {
  color: var(--text-primary);
}
.adi-msg-adi em {
  color: #a5b4fc;
}
.adi-msg-adi blockquote {
  background: rgba(34, 197, 94, 0.06);
  border-left: 3px solid var(--accent-success);
  padding: 10px 14px;
  margin: 10px 0;
  border-radius: 0 10px 10px 0;
  font-size: 12.5px;
  color: var(--text-secondary);
}
.adi-msg-adi blockquote strong {
  color: var(--accent-success);
}
.adi-msg-adi p {
  margin: 6px 0;
}
.adi-msg-adi p:first-child {
  margin-top: 0;
}
.adi-msg-adi code {
  background: rgba(99, 102, 241, 0.1);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
  color: #a5b4fc;
}

/* Quick chips */
.adi-chips {
  padding: 2px 18px 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.adi-chip {
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 11.5px;
  color: var(--accent);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
  font-family: var(--font-outfit);
}
.adi-chip:hover {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
}

/* Chat input */
.adi-input-bar {
  padding: 14px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  gap: 10px;
  align-items: center;
}
.adi-input {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 11px 16px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-outfit);
  outline: none;
  transition: border-color 0.15s;
}
.adi-input:focus {
  border-color: rgba(99, 102, 241, 0.4);
}
.adi-input::placeholder {
  color: var(--text-muted);
}
.adi-send {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: opacity 0.15s;
}
.adi-send:hover {
  opacity: 0.9;
}

/* Study guide idle nudge bar */
.adi-idle-bar {
  background: rgba(14, 14, 22, 0.6);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
  animation: nudgeFade 0.5s ease-out;
}
.adi-idle-bar-text {
  font-size: 13.5px;
  color: var(--text-secondary);
  flex: 1;
  line-height: 1.5;
}
.adi-idle-bar-text strong {
  color: #c4b5fd;
}
.adi-idle-bar-x {
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  background: none;
  border: none;
  transition: color 0.15s;
}
.adi-idle-bar-x:hover {
  color: var(--text-secondary);
}

/* Backdrop overlay when panel is open */
.adi-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Mobile: full-screen panel */
@media (max-width: 768px) {
  .adi-panel {
    width: 100%;
  }
  .adi-bubble {
    bottom: 16px;
    right: 16px;
  }
  .adi-bubble svg {
    width: 56px;
  }
  .adi-nudge {
    bottom: 88px;
    right: 16px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat(adi): add CSS styles for chat panel, bubble, nudge, and messages"
```

---

### Task 8: AdiBubble + AdiNudge Components

**Files:**
- Create: `components/adi/AdiBubble.tsx`
- Create: `components/adi/AdiNudge.tsx`

- [ ] **Step 1: Create AdiBubble**

Create `components/adi/AdiBubble.tsx`:

```tsx
'use client'

import { useAdi } from './AdiProvider'
import { AdiMascot } from './AdiMascot'
import { AdiNudge } from './AdiNudge'

export function AdiBubble() {
  const { toggle, isOpen, nudgeText, dismissNudge } = useAdi()

  // Hide bubble when panel is open
  if (isOpen) return null

  return (
    <>
      {nudgeText && <AdiNudge text={nudgeText} onDismiss={dismissNudge} />}
      <div className="adi-bubble" onClick={toggle} role="button" tabIndex={0} aria-label="Open Adi chat">
        <AdiMascot size={72} />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Create AdiNudge**

Create `components/adi/AdiNudge.tsx`:

```tsx
'use client'

import { useEffect } from 'react'

interface AdiNudgeProps {
  text: string
  onDismiss: () => void
}

export function AdiNudge({ text, onDismiss }: AdiNudgeProps) {
  // Auto-fade after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="adi-nudge">
      <div className="adi-nudge-text">
        <strong>{text.split('—')[0]?.trim()}</strong>
        {text.includes('—') && ` — ${text.split('—').slice(1).join('—').trim()}`}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/adi/AdiBubble.tsx components/adi/AdiNudge.tsx
git commit -m "feat(adi): add floating bubble and soft nudge speech bubble"
```

---

### Task 9: AdiChatMessage + AdiQuickChips

**Files:**
- Create: `components/adi/AdiChatMessage.tsx`
- Create: `components/adi/AdiQuickChips.tsx`

- [ ] **Step 1: Create AdiChatMessage**

Create `components/adi/AdiChatMessage.tsx`:

```tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { Message } from 'ai'

interface AdiChatMessageProps {
  message: Message
}

export function AdiChatMessage({ message }: AdiChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="adi-msg adi-msg-user">
        {message.content}
      </div>
    )
  }

  return (
    <div className="adi-msg adi-msg-adi">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  )
}
```

- [ ] **Step 2: Create AdiQuickChips**

Create `components/adi/AdiQuickChips.tsx`:

```tsx
'use client'

import { useAdi } from './AdiProvider'

const CHIP_SETS: Record<string, string[]> = {
  mcq: ['🔄 Explain simpler', '📝 Similar question', '📚 Unit overview'],
  drill: ['🔄 Explain simpler', '📝 Give me a hint', '📚 Unit overview'],
  'study-guide': ['🧠 Quiz me on this', '📖 Explain this section', '💡 AP exam tips'],
  'practice-test': ['🔄 Explain simpler', '📝 Similar question', '📊 My weak areas'],
  home: ['💡 AP exam tips', '📚 Study recommendations'],
}

export function AdiQuickChips() {
  const { context, sendMessage, messages } = useAdi()

  // Only show chips when conversation is empty or after Adi's last message
  const lastMsg = messages[messages.length - 1]
  if (messages.length > 0 && lastMsg?.role === 'user') return null

  const chips = CHIP_SETS[context.page] ?? CHIP_SETS.home

  return (
    <div className="adi-chips">
      {chips.map((chip) => (
        <button key={chip} className="adi-chip" onClick={() => sendMessage(chip)}>
          {chip}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/adi/AdiChatMessage.tsx components/adi/AdiQuickChips.tsx
git commit -m "feat(adi): add chat message renderer with markdown/KaTeX and quick action chips"
```

---

### Task 10: AdiChatPanel

**Files:**
- Create: `components/adi/AdiChatPanel.tsx`

- [ ] **Step 1: Create AdiChatPanel**

Create `components/adi/AdiChatPanel.tsx`:

```tsx
'use client'

import { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useAdi } from './AdiProvider'
import { AdiIcon } from './AdiMascot'
import { AdiChatMessage } from './AdiChatMessage'
import { AdiQuickChips } from './AdiQuickChips'

export function AdiChatPanel() {
  const {
    isOpen, close,
    messages, input, handleInputChange, handleSubmit, isLoading,
    context,
  } = useAdi()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isOpen) return null

  // Build context pill text
  const ctxLabel = context.questionId
    ? `📍 Viewing ${context.questionId} · ${context.unit}`
    : context.unit
      ? `📍 ${context.subject} · ${context.unit}`
      : context.subject
        ? `📍 ${context.subject}`
        : null

  return (
    <>
      <div className="adi-backdrop" onClick={close} />
      <div className="adi-panel">
        {/* Header */}
        <div className="adi-panel-header">
          <AdiIcon size={40} />
          <div>
            <h3>Adi</h3>
            <span className="adi-panel-status">Online</span>
          </div>
          <button className="adi-panel-close" onClick={close} aria-label="Close Adi">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="adi-messages">
          {ctxLabel && <div className="adi-ctx-pill">{ctxLabel}</div>}

          {messages.length === 0 && (
            <div className="adi-msg adi-msg-adi">
              Hey! I&apos;m Adi, your AP study buddy. Ask me anything about the material you&apos;re studying — I can explain concepts, break down tricky questions, or give you exam tips.
            </div>
          )}

          {messages.map((msg) => (
            <AdiChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="adi-msg adi-msg-adi" style={{ opacity: 0.6 }}>
              <span style={{ display: 'inline-flex', gap: 4 }}>
                <span style={{ animation: 'adiBob 1s ease-in-out infinite' }}>·</span>
                <span style={{ animation: 'adiBob 1s ease-in-out 0.2s infinite' }}>·</span>
                <span style={{ animation: 'adiBob 1s ease-in-out 0.4s infinite' }}>·</span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips */}
        <AdiQuickChips />

        {/* Input */}
        <form className="adi-input-bar" onSubmit={handleSubmit}>
          <input
            className="adi-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Adi anything..."
            disabled={isLoading}
          />
          <button className="adi-send" type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/adi/AdiChatPanel.tsx
git commit -m "feat(adi): add chat panel with streaming messages, context pill, and input"
```

---

### Task 11: Root Layout Integration

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add AdiProvider and bubble to root layout**

In `app/layout.tsx`, add imports and wrap the content:

```tsx
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { PageTransition } from '@/components/ui/PageTransition'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdiProvider } from '@/components/adi/AdiProvider'
import { AdiBubble } from '@/components/adi/AdiBubble'
import { AdiChatPanel } from '@/components/adi/AdiChatPanel'
```

Update the return JSX — nest AdiProvider inside AuthProvider, add AdiBubble and AdiChatPanel after `</main>`:

```tsx
<AuthProvider>
  <AdiProvider>
    <Header />
    <main style={{ paddingTop: '56px' }}>
      <PageTransition>{children}</PageTransition>
    </main>
    <AdiBubble />
    <AdiChatPanel />
  </AdiProvider>
</AuthProvider>
```

- [ ] **Step 2: Verify the app compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no TypeScript errors related to Adi components.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(adi): integrate AdiProvider, bubble, and chat panel into root layout"
```

---

### Task 12: Nudge Integration — MCQ + Drill Wrong Answers

**Files:**
- Modify: `components/mcq/MCQCard.tsx`
- Modify: `components/drill/DrillCard.tsx`
- Create: `hooks/useAdiNudge.ts`

- [ ] **Step 1: Create useAdiNudge hook**

Create `hooks/useAdiNudge.ts`:

```typescript
'use client'

import { useCallback, useRef } from 'react'
import { useAdi } from '@/components/adi/AdiProvider'

/**
 * Hook for components to trigger Adi nudges.
 * Handles frequency capping — max 1 nudge per page, suppressed after 3 dismissals.
 */
const LONG_SESSION_INTERVAL = 10
const LONG_SESSION_NUDGES = [
  "I'm here if you need me — tap me!",
  'Want to review what we\'ve covered? — tap me!',
]

export function useAdiNudge() {
  const { showNudge, setQuestion, isOpen } = useAdi()
  const hasNudgedRef = useRef(false)
  const questionCountRef = useRef(0)

  const triggerWrongAnswer = useCallback((opts: {
    unit: string
    questionId: string
    userAnswer: string
    isCorrect: boolean
  }) => {
    // Update Adi's context with the current question
    setQuestion(opts)

    // Track question count for long-session nudge
    questionCountRef.current++

    // Wrong-answer nudge — only once per page visit
    if (!opts.isCorrect && !hasNudgedRef.current) {
      hasNudgedRef.current = true
      showNudge('I can explain this one — tap me!')
      return
    }

    // Long-session nudge — every N questions if Adi hasn't been opened
    if (
      questionCountRef.current % LONG_SESSION_INTERVAL === 0 &&
      !isOpen &&
      !hasNudgedRef.current
    ) {
      hasNudgedRef.current = true
      const idx = Math.floor(questionCountRef.current / LONG_SESSION_INTERVAL) % LONG_SESSION_NUDGES.length
      showNudge(LONG_SESSION_NUDGES[idx])
    }
  }, [showNudge, setQuestion, isOpen])

  return { triggerWrongAnswer }
}
```

- [ ] **Step 2: Add nudge trigger to MCQCard**

In `components/mcq/MCQCard.tsx`, add the hook import and call. Near the top of the component function, after existing hooks:

```tsx
import { useAdiNudge } from '@/hooks/useAdiNudge'
```

Inside the component, after existing state declarations:

```tsx
const { triggerWrongAnswer } = useAdiNudge()
```

In the `handleSubmit` function, after the `onAnswer` call and after sound plays, add:

```tsx
triggerWrongAnswer({
  unit: question.unit,
  questionId: question.id,
  userAnswer: selectedId,
  isCorrect: selected.is_correct,
})
```

- [ ] **Step 3: Add nudge trigger to DrillCard**

In `components/drill/DrillCard.tsx`, apply the same pattern to each sub-component that fires `onAnswer`. Add to the top:

```tsx
import { useAdiNudge } from '@/hooks/useAdiNudge'
```

In each sub-component (`ConceptMcCard`, `FormulaCard`, `DefaultCard`), after existing hooks:

```tsx
const { triggerWrongAnswer } = useAdiNudge()
```

After each `onAnswer(card.id, verdict, ...)` call where verdict could be 'wrong', add:

```tsx
triggerWrongAnswer({
  unit: card.unit,
  questionId: card.id,
  userAnswer: /* the user's input */,
  isCorrect: verdict === 'correct',
})
```

For ConceptMcCard: `userAnswer: choice.text`
For FormulaCard: `userAnswer: ''`
For DefaultCard: `userAnswer: inputValue.trim()`

- [ ] **Step 4: Commit**

```bash
git add hooks/useAdiNudge.ts components/mcq/MCQCard.tsx components/drill/DrillCard.tsx
git commit -m "feat(adi): add wrong-answer nudge triggers to MCQCard and DrillCard"
```

---

### Task 13: Study Guide Idle Nudge

**Files:**
- Create: `components/adi/AdiIdleNudge.tsx`
- Modify: `app/[subject]/study-guide/page.tsx`

- [ ] **Step 1: Create AdiIdleNudge**

Create `components/adi/AdiIdleNudge.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useAdi } from './AdiProvider'
import { AdiIcon } from './AdiMascot'

interface AdiIdleNudgeProps {
  /** Seconds before the nudge appears. Default 60. */
  delay?: number
}

export function AdiIdleNudge({ delay = 60 }: AdiIdleNudgeProps) {
  const { open, nudgeDismissCount } = useAdi()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if dismissed too many times
    if (nudgeDismissCount >= 3) return

    const timer = setTimeout(() => setVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay, nudgeDismissCount])

  if (!visible) return null

  return (
    <div className="adi-idle-bar">
      <div className="adi-idle-bar-icon" style={{ cursor: 'pointer' }} onClick={open}>
        <AdiIcon size={36} />
      </div>
      <div className="adi-idle-bar-text" style={{ cursor: 'pointer' }} onClick={open}>
        <strong>Need a hand?</strong> I can quiz you on this or explain anything here.
      </div>
      <button className="adi-idle-bar-x" onClick={() => setVisible(false)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Add AdiIdleNudge to study guide page**

In `app/[subject]/study-guide/page.tsx`, add import:

```tsx
import { AdiIdleNudge } from '@/components/adi/AdiIdleNudge'
```

In the JSX, render `<AdiIdleNudge />` after the `<StudyGuideReader>` component in the `reading` view:

```tsx
{view === 'reading' && guide && (
  <>
    <StudyGuideReader guide={guide} keyTerms={keyTerms} onBack={handleBack} />
    <AdiIdleNudge />
  </>
)}
```

- [ ] **Step 3: Commit**

```bash
git add components/adi/AdiIdleNudge.tsx app/[subject]/study-guide/page.tsx
git commit -m "feat(adi): add idle nudge bar to study guide after 60s of reading"
```

---

### Task 14: End-to-End Smoke Test

**Files:** none (manual testing)

- [ ] **Step 1: Set OPENAI_API_KEY locally**

Create or update `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
```

Ask the user for their API key at this point.

- [ ] **Step 2: Start dev server and test**

```bash
npm run dev
```

**Test checklist:**
1. Floating diamond visible in bottom-right on homepage
2. Navigate to any subject → drills → start a session
3. Answer a question wrong → soft nudge appears above Adi
4. Click Adi → chat panel opens with context pill
5. Type a message → streaming response appears with formatting
6. Click a quick chip → sends as message
7. Close panel → bubble returns
8. Navigate to study guide → wait 60s → idle nudge bar appears
9. Check `localStorage` for `ascendly_adi_messages` counter incrementing

- [ ] **Step 3: Commit any fixes from testing**

```bash
git add -A
git commit -m "fix(adi): address issues found during smoke testing"
```

---

## Dependency Graph

```
Task 1 (deps) → Task 2 (LS keys) → Task 3 (prompt) → Task 4 (API route)
                                                              ↓
Task 5 (mascot) → Task 6 (provider) → Task 7 (CSS) → Task 8 (bubble/nudge)
                                                              ↓
                                          Task 9 (message/chips) → Task 10 (panel)
                                                                          ↓
                                                                   Task 11 (layout integration)
                                                                          ↓
                                                   Task 12 (MCQ/drill nudges) + Task 13 (study guide nudge)
                                                                          ↓
                                                                   Task 14 (smoke test)
```

Tasks 1-5 can be done in any order. Tasks 6+ have sequential dependencies as shown.
