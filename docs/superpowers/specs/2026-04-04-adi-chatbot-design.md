# Adi Chatbot — Design Spec

**Date:** 2026-04-04
**Status:** Approved (design phase)

## Overview

Adi is an AI tutoring chatbot embedded in Ascendly. It helps students understand why answers are right or wrong, clarifies AP concepts, and provides exam-relevant context. Adi appears as a **Floating Diamond** mascot — a gem creature with a cyan→indigo→purple gradient, sparkle-eye face, and animated particle effects.

## Mascot — Floating Diamond

- **Shape:** Rotated diamond (square rotated 45°) with faceted highlights
- **Gradient:** `#67e8f9` → `#818cf8` → `#a78bfa` → `#c084fc` (cyan→indigo→violet→purple)
- **Outline:** Purple (`#a855f7`) stroke
- **Eyes:** Large dark ellipses with dual white sparkle highlights
- **Smile:** Simple curved path
- **Effects:** Floating bob animation (3.5s ease-in-out), ambient sparkle particles, purple glow aura, ground shadow
- **Note:** Diamond body fill needs to be more saturated/opaque in implementation — current SVG reads slightly transparent against the dark background. Finalize during UI build.

## UI States

### State 1 — Floating Bubble (Always Present)

- Fixed-position element, bottom-right corner of viewport
- Present on **every page** across the app
- ~80px tall SVG with the full Floating Diamond mascot
- Gentle bob animation, sparkle particles
- Click opens the chat panel (State 3)
- z-index above page content, below modals

### State 2 — Soft Nudge (Contextual Triggers)

A small speech bubble appears above Adi. No buttons — just text. Tapping Adi opens chat.

**Trigger conditions:**
- **Wrong answer (MCQ/drill):** Appears after the user selects a wrong answer and sees feedback. Text: *"I can explain this one — tap me!"*
- **Study guide idle (~60s):** Inline bar slides in below the study guide content (not a popup). Text: *"Need a hand? I can quiz you on this or explain anything here."*
- **Long session without Adi (every ~10 questions):** Brief nudge if Adi hasn't been opened. Text varies: *"I'm here if you need me"*, *"Want to review what we've covered?"*

**Nudge behavior:**
- Max 1 nudge per page visit (don't spam)
- Dismissible (× on idle bars, auto-fade on speech bubbles after 8s)
- Nudges suppressed if user has dismissed 3+ times in current session (respect the "no thanks")
- Speech bubble style: `border-radius: 14px 14px 4px 14px`, subtle purple border, dark glass background

### State 3 — Expanded Chat Panel

Right sidebar (400px wide) that opens when user clicks Adi or a nudge.

**Header:**
- Adi small icon (diamond in circle) + "Adi" label + green "Online" status
- Close button (×) returns to floating bubble

**Context pill:**
- Auto-detected from current page: `📍 Viewing Q3 · Unit 2: Research Methods`
- Updates when user navigates to a different question/card
- Shows subject + unit + question ID when on a drill/MCQ/test page
- Shows subject + unit + section name when on study guide

**Messages:**
- User messages: right-aligned, indigo-tinted background, rounded corners (bottom-right sharp)
- Adi messages: left-aligned, dark card background, rounded corners (bottom-left sharp)
- Adi responses are **rich formatted** via markdown→HTML rendering:
  - `## Headers` → styled section headers (uppercase, small, `#a5b4fc`)
  - `- Bullet lists` → styled `<ul>` with proper spacing
  - `**Bold**` → white text for emphasis
  - `*Italic*` → `#a5b4fc` for AP terms
  - Tip boxes: green left-border callout for AP Exam Tips
  - Wrong-answer boxes: red left-border callout for "why X is wrong"
  - KaTeX rendering for any `$...$` math expressions
- Streaming: responses appear word-by-word (Vercel AI SDK `useChat` hook)

**Quick action chips:**
- Row of tappable chips below the message list, above the input
- Context-dependent:
  - After wrong MCQ: "🔄 Explain simpler", "📝 Similar question", "📚 Unit overview"
  - On study guide: "🧠 Quiz me", "📖 Explain this section", "🔗 Related topics"
  - General: "💡 AP exam tips", "📊 My progress"
- Chips send their text as a user message when tapped

**Input:**
- Text input with placeholder "Ask Adi anything..."
- Send button (indigo gradient, arrow icon)
- Enter to send, Shift+Enter for newline

### State 4 — Mobile Behavior

- Chat panel becomes full-screen overlay (not sidebar)
- Floating bubble shrinks to 56px
- Nudge speech bubbles auto-dismiss after 5s (less screen real estate)

## Architecture

### API Route

```
POST /api/chat
```

**Request body:**
```ts
{
  messages: Message[]        // conversation history
  context: {
    subject: string          // "ap-psychology"
    unit: string             // "unit-2"
    page: "drill" | "mcq" | "practice-test" | "study-guide" | "home"
    questionId?: string      // current question/card ID
    userAnswer?: string      // what the user selected (if applicable)
    isCorrect?: boolean      // whether their answer was right
  }
}
```

**Response:** Streaming text via Vercel AI SDK `streamText()`.

### AI Model

- **Provider:** OpenAI via `@ai-sdk/openai`
- **Model:** `gpt-4o-mini`
- **Swap path:** Change one line in `/api/chat/route.ts` to switch providers (Vercel AI SDK abstraction)

### System Prompt Design (Anti-Hallucination)

The system prompt is assembled dynamically per request:

```
ROLE SECTION:
  You are Adi, a friendly AP exam tutor for Ascendly. You help students
  understand AP course material. You speak clearly, use formatting
  (headers, bullets, callout boxes), and always tie explanations back
  to what's tested on the AP exam.

GROUNDING RULES:
  - Only answer based on the provided course content below
  - If the student asks about something outside the AP curriculum, say so
  - Never make up facts, statistics, or exam details
  - If unsure, say "I'm not sure about that — check your study guide"
  - Keep responses concise (2-4 paragraphs max unless asked to elaborate)

FORMATTING RULES:
  - Use ## for section headers
  - Use **bold** for key terms
  - Use bullet lists for comparisons
  - Use > blockquotes for AP Exam Tips (prefix with "AP Exam Tip:")
  - Use $...$ for any math expressions (KaTeX)

COURSE CONTEXT:
  [Injected per-request — see Context Injection below]

QUESTION CONTEXT:
  [Injected per-request — the specific question/card being viewed]
```

### Context Injection

For each API call, the server loads and injects relevant content:

1. **Question data** — if the user is viewing a specific question, the full question JSON (prompt, choices, correct answer, explanations) is injected. This ensures Adi knows exactly what was asked and why each choice is right/wrong.

2. **Study guide excerpt** — the study guide JSON for the current unit is loaded and injected as reference material. This gives Adi the authoritative AP course content for the topic.

3. **Unit metadata** — unit name, subject, unit objectives from meta.json.

**Token budget:** System prompt + context should stay under ~3,000 tokens. Study guide content is truncated to the most relevant section if a unit's guide is large.

**Implementation:** The API route handler reads from `/public/data/[subject]/` at request time. These are static JSON files already on the server — no database query needed.

### Conversation Management

- **Per-session memory (State B):** Conversation persists in React state while the user stays on the same page. Navigating away clears the conversation.
- **Easy upgrade to persistent (State C):** When Supabase auth lands, add a `chat_messages` table and load/save conversation history per user. The `useChat` hook already manages messages as an array — just hydrate from DB on mount and save on each new message.
- **Context window management:** Only send the last 10 messages to the API (plus system prompt + context). Older messages are kept in the UI for scrollback but not sent to the model. This keeps costs predictable.

## Cost Controls & Paywall Readiness

### Usage Tracking (Ship from Day 1)

Every chat message increments a counter. This ships even before any paywall exists:

```ts
// localStorage key (pre-auth)
ascendly_adi_messages: number  // total messages sent to Adi

// Supabase table (post-auth)
adi_usage: { user_id, message_count, last_reset_at, period }
```

### Rate Limiting (Server-Side)

- **IP-based rate limit** (pre-auth): 60 messages/hour per IP via simple in-memory counter
- **User-based rate limit** (post-auth): configurable per plan tier
- **Model fallback:** If costs spike, swap to `gpt-4.1-nano` for non-paying users in one line

### Paywall Integration (Future — Not Built Now)

When paywall is added, the flow will be:
1. Check user's message count for current period
2. If under limit → proceed
3. If at limit → return `{ error: "limit_reached", limit: 50, period: "day" }` 
4. Frontend shows "You've used all your free Adi messages today. Upgrade for unlimited."

The counter infrastructure ships now so the paywall is just an `if` check later.

### FRQ Grading (Shared API Key)

FRQ grading will use the same OpenAI API key but a **separate route** (`/api/grade-frq`). This keeps:
- Separate rate limiting (FRQ grading is more expensive per call)
- Separate usage tracking
- Same cost dashboard visibility

## Dependencies

### New Packages
- `ai` — Vercel AI SDK core
- `@ai-sdk/openai` — OpenAI provider

### Environment Variables
- `OPENAI_API_KEY` — server-side only, in Vercel env vars

### No New Database Tables (Yet)
Everything runs on localStorage + static JSON files. When Supabase auth ships, add:
- `adi_usage` table (usage tracking)
- `chat_messages` table (conversation persistence — upgrade to State C)

## Component Breakdown

```
components/adi/
  AdiBubble.tsx        — floating diamond mascot + click handler
  AdiNudge.tsx         — speech bubble nudge (wrong answer, idle)
  AdiChatPanel.tsx     — right sidebar chat panel
  AdiChatMessage.tsx   — single message (user or Adi), handles markdown→HTML
  AdiQuickChips.tsx    — contextual quick action buttons
  AdiProvider.tsx      — React context: open/close state, conversation, nudge logic
  AdiIdleNudge.tsx     — study guide inline nudge bar

hooks/
  useAdiContext.ts     — builds context object from current page/question
  useAdiNudge.ts       — nudge trigger logic (wrong answer, idle timer, frequency cap)

app/api/
  chat/route.ts        — streaming chat endpoint
```

## Pages That Need Adi Integration

Adi's floating bubble renders in the root layout (always present). Contextual features activate on:

- `[subject]/drills/page.tsx` — wrong-answer nudges, drill card context
- `[subject]/practice/page.tsx` — wrong-answer nudges, MCQ context
- `[subject]/practice-test/page.tsx` — nudge during test review (not during timed test)
- `[subject]/study-guide/page.tsx` — idle nudge, study guide content context

## Out of Scope

- FRQ grading (separate feature, separate spec)
- Conversation persistence in database (ships with Supabase auth)
- Paywall enforcement (ships when pricing is decided)
- Voice input/output
- Image/diagram generation in responses
