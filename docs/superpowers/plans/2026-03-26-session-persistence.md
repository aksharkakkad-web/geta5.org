# Session Persistence — Resume Where You Left Off

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-save drill, MCQ, and practice test session progress to localStorage after every card advance so users can close the tab and resume exactly where they left off.

**Architecture:** Each session component auto-saves its state (questions/cards, answers, current position) to localStorage via a `useEffect` on `currentIndex`. On page load, the page component checks for a saved draft; if found, it shows a resume card (Continue / Start Fresh) instead of the normal start screen. Completing a session clears its draft. One draft per mode per subject — starting a new session overwrites the old draft.

**Tech Stack:** React `useState`/`useEffect`/`useRef`, TypeScript, localStorage via existing `lsGet`/`lsSet`/`lsClear` utils in `utils/localStorage.ts`.

---

### Task 1: Add draft keys to LS_KEYS

**Files:**
- Modify: `utils/localStorage.ts`

- [ ] **Step 1: Add 3 draft keys to the LS_KEYS const**

Open `utils/localStorage.ts`. Replace the entire `LS_KEYS` export with:

```typescript
export const LS_KEYS = {
  streak: 'ascendly_streak',
  mastery: (subject: string, unit: string) => `ascendly_mastery_${subject}_${unit}`,
  score: (subject: string) => `ascendly_score_${subject}`,
  totalQuestions: 'ascendly_total_questions',
  activeSubject: 'ascendly_active_subject',
  drillDraft: (subject: string) => `ascendly_draft_drill_${subject}`,
  mcqDraft: (subject: string) => `ascendly_draft_mcq_${subject}`,
  testDraft: (subject: string) => `ascendly_draft_test_${subject}`,
} as const
```

- [x] **Step 2: Commit** — `9995db0`

```bash
git add utils/localStorage.ts
git commit -m "feat(persistence): add draft localStorage keys"
```

---

### Task 2: Add DrillDraft type and helpers to drillSession.ts

**Files:**
- Modify: `utils/drillSession.ts`

- [ ] **Step 1: Update the import at the top to include lsClear**

Current first line: `import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'`

Replace with:
```typescript
import { lsGet, lsSet, lsClear, LS_KEYS } from '@/utils/localStorage'
```

- [ ] **Step 2: Add DrillDraft interface and helpers at the bottom of the file**

```typescript
// ─── Draft Persistence ────────────────────────────────────────────────────────

export interface DrillDraft {
  cards: DrillCard[]
  currentIndex: number
  answers: SessionState['answers']
  isRetry: boolean
  unitSlug: string
  savedAt: number
}

export function saveDrillDraft(subject: string, draft: DrillDraft): void {
  lsSet(LS_KEYS.drillDraft(subject), draft)
}

export function loadDrillDraft(subject: string): DrillDraft | null {
  return lsGet<DrillDraft | null>(LS_KEYS.drillDraft(subject), null)
}

export function clearDrillDraft(subject: string): void {
  lsClear(LS_KEYS.drillDraft(subject))
}
```

- [x] **Step 3: Commit** — DONE

```bash
git add utils/drillSession.ts
git commit -m "feat(persistence): add DrillDraft type and helpers"
```

---

### Task 3: Add MCQDraft type and helpers to mcqSession.ts

**Files:**
- Modify: `utils/mcqSession.ts`

- [ ] **Step 1: Update import to include lsClear**

Current first line: `import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'`

Replace with:
```typescript
import { lsGet, lsSet, lsClear, LS_KEYS } from '@/utils/localStorage'
```

- [ ] **Step 2: Add optional currentIndex field to MCQSessionState**

Find the `MCQSessionState` interface and add the optional field so existing construction sites don't break:

```typescript
export interface MCQSessionState {
  questions: MCQ[]
  answers: Record<string, MCQAnswer> // keyed by question id
  currentIndex?: number              // present on resumed sessions
  isRetry: boolean
  unitSlug: string | 'all'
  retryQuestionIds?: string[]
}
```

- [ ] **Step 3: Add MCQDraft interface and helpers at the bottom of the file**

```typescript
// ─── Draft Persistence ────────────────────────────────────────────────────────

export interface MCQDraft {
  questions: MCQ[]
  currentIndex: number
  answers: Record<string, MCQAnswer>
  isRetry: boolean
  unitSlug: string | 'all'
  retryQuestionIds?: string[]
  savedAt: number
}

export function saveMCQDraft(subject: string, draft: MCQDraft): void {
  lsSet(LS_KEYS.mcqDraft(subject), draft)
}

export function loadMCQDraft(subject: string): MCQDraft | null {
  return lsGet<MCQDraft | null>(LS_KEYS.mcqDraft(subject), null)
}

export function clearMCQDraft(subject: string): void {
  lsClear(LS_KEYS.mcqDraft(subject))
}
```

- [ ] **Step 4: Commit**

```bash
git add utils/mcqSession.ts
git commit -m "feat(persistence): add MCQDraft type and helpers, optional currentIndex to MCQSessionState"
```

---

### Task 4: Add TestDraft type and helpers to testSession.ts

**Files:**
- Modify: `utils/testSession.ts`

- [ ] **Step 1: Update import to include lsClear**

Current import: `import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'`

Replace with:
```typescript
import { lsGet, lsSet, lsClear, LS_KEYS } from '@/utils/localStorage'
```

- [ ] **Step 2: Add TestDraft interface and helpers after the existing type definitions (before composeTest)**

```typescript
// ─── Draft Persistence ────────────────────────────────────────────────────────

export interface TestDraft {
  questions: MCQ[]
  answers: Record<string, TestAnswer>
  flagged: Record<string, boolean>
  currentIndex: number
  timed: boolean
  showTimer: boolean
  remainingSeconds: number   // seconds left on timer at time of save; equals durationSeconds for untimed tests
  subjectSlug: string
  savedAt: number
}

export function saveTestDraft(draft: TestDraft): void {
  lsSet(LS_KEYS.testDraft(draft.subjectSlug), draft)
}

export function loadTestDraft(subject: string): TestDraft | null {
  return lsGet<TestDraft | null>(LS_KEYS.testDraft(subject), null)
}

export function clearTestDraft(subject: string): void {
  lsClear(LS_KEYS.testDraft(subject))
}
```

- [ ] **Step 3: Commit**

```bash
git add utils/testSession.ts
git commit -m "feat(persistence): add TestDraft type and helpers"
```

---

### Task 5: Add onTick callback to TestTimer

**Files:**
- Modify: `components/test/TestTimer.tsx`

This lets TestSession track remaining seconds each tick so it can save the correct value to the draft.

- [ ] **Step 1: Replace the TestTimerProps interface and component signature**

```typescript
interface TestTimerProps {
  initialSeconds: number
  timed: boolean
  visible?: boolean
  inline?: boolean
  onExpiry: () => void
  onTick?: (remaining: number) => void
}

export default function TestTimer({
  initialSeconds,
  timed,
  visible = true,
  inline = false,
  onExpiry,
  onTick,
}: TestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onExpiryRef = useRef(onExpiry)
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onExpiryRef.current = onExpiry
  }, [onExpiry])

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])
```

- [ ] **Step 2: Call onTick inside the setInterval callback**

Find the `setSecondsLeft` block inside `setInterval` and replace it:

```typescript
intervalRef.current = setInterval(() => {
  setSecondsLeft(prev => {
    const next = prev - 1
    if (next <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setTimeout(() => onExpiryRef.current(), 0)
      return 0
    }
    onTickRef.current?.(next)
    return next
  })
}, 1000)
```

- [ ] **Step 3: Commit**

```bash
git add components/test/TestTimer.tsx
git commit -m "feat(persistence): add onTick callback to TestTimer"
```

---

### Task 6: Update DrillSession — initialize from props and auto-save

**Files:**
- Modify: `components/drill/DrillSession.tsx`

- [ ] **Step 1: Update imports**

```typescript
import React, { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import DrillCard from '@/components/drill/DrillCard'
import { SessionState, saveDrillDraft, clearDrillDraft } from '@/utils/drillSession'
import { getSubject } from '@/utils/subjects'
```

- [ ] **Step 2: Initialize state from session prop instead of hardcoded defaults**

Find these two lines:
```typescript
const [currentIndex, setCurrentIndex] = useState(0)
const [answers, setAnswers] = useState<
  Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
>({})
```

Replace with:
```typescript
const [currentIndex, setCurrentIndex] = useState(session.index ?? 0)
const [answers, setAnswers] = useState<
  Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
>(session.answers ?? {})
```

- [ ] **Step 3: Add auto-save useEffect after the answersRef line**

```typescript
// Auto-save draft whenever currentIndex advances (fires after each card is answered and Next is clicked)
useEffect(() => {
  if (currentIndex > 0) {
    saveDrillDraft(subject, {
      cards: session.cards,
      currentIndex,
      answers: answersRef.current,
      isRetry: session.isRetry,
      unitSlug: session.unitSlug,
      savedAt: Date.now(),
    })
  }
}, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Clear draft when session completes**

Find `handleNext` and add `clearDrillDraft` before calling `onComplete`:

```typescript
const handleNext = () => {
  if (currentIndex + 1 >= totalCards) {
    clearDrillDraft(subject)
    const finalSession: SessionState = {
      ...session,
      index: currentIndex + 1,
      answers: { ...answersRef.current },
    }
    onComplete(finalSession)
  } else {
    setCurrentIndex(prev => prev + 1)
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add components/drill/DrillSession.tsx
git commit -m "feat(persistence): auto-save drill progress; initialize from resumed state"
```

---

### Task 7: Update MCQSession — initialize from props and auto-save

**Files:**
- Modify: `components/mcq/MCQSession.tsx`

- [ ] **Step 1: Update imports**

```typescript
import React, { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import MCQCard from '@/components/mcq/MCQCard'
import { getSubject } from '@/utils/subjects'
import { saveMCQDraft, clearMCQDraft } from '@/utils/mcqSession'
import type { MCQSessionState, MCQAnswer } from '@/utils/mcqSession'
```

- [ ] **Step 2: Initialize state from session prop**

Find these two lines:
```typescript
const [currentIndex, setCurrentIndex] = useState(0)
const [answers, setAnswers] = useState<Record<string, MCQAnswer>>({})
```

Replace with:
```typescript
const [currentIndex, setCurrentIndex] = useState(session.currentIndex ?? 0)
const [answers, setAnswers] = useState<Record<string, MCQAnswer>>(session.answers ?? {})
```

- [ ] **Step 3: Add auto-save useEffect after the answersRef line**

```typescript
// Auto-save draft whenever currentIndex advances
useEffect(() => {
  if (currentIndex > 0) {
    saveMCQDraft(subject, {
      questions: session.questions,
      currentIndex,
      answers: answersRef.current,
      isRetry: session.isRetry,
      unitSlug: session.unitSlug,
      retryQuestionIds: session.retryQuestionIds,
      savedAt: Date.now(),
    })
  }
}, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Clear draft when session completes**

Find `handleNext` and add `clearMCQDraft` before calling `onComplete`:

```typescript
const handleNext = () => {
  if (currentIndex + 1 >= totalQuestions) {
    clearMCQDraft(subject)
    const finalSession: MCQSessionState = {
      ...session,
      answers: { ...answersRef.current },
    }
    onComplete(finalSession)
  } else {
    setCurrentIndex(prev => prev + 1)
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add components/mcq/MCQSession.tsx
git commit -m "feat(persistence): auto-save MCQ progress; initialize from resumed state"
```

---

### Task 8: Update TestSession — auto-save, track timer, fix Save & Exit

**Files:**
- Modify: `components/test/TestSession.tsx`

- [ ] **Step 1: Update imports — add useEffect and draft helpers**

```typescript
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Flag, Grid, X } from 'lucide-react'
import MCQCard from '@/components/mcq/MCQCard'
import TestTimer from '@/components/test/TestTimer'
import { saveTestDraft, clearTestDraft } from '@/utils/testSession'
import type { TestSessionState, TestAnswer } from '@/utils/testSession'
```

- [ ] **Step 2: Add remainingSecondsRef to track timer state**

Add these two declarations directly after the `flaggedRef` declaration:

```typescript
const remainingSecondsRef = useRef(session.durationSeconds)

function handleTick(seconds: number) {
  remainingSecondsRef.current = seconds
}
```

- [ ] **Step 3: Add auto-save useEffect**

Add after the two existing `useEffect` calls (the ones that sync answersRef and flaggedRef):

```typescript
// Auto-save draft after every answer or navigation change
useEffect(() => {
  if (Object.keys(answers).length > 0 || currentIndex > 0) {
    saveTestDraft({
      questions: session.questions,
      answers: answersRef.current,
      flagged: flaggedRef.current,
      currentIndex,
      timed: session.timed,
      showTimer: session.showTimer,
      remainingSeconds: remainingSecondsRef.current,
      subjectSlug: session.subjectSlug,
      savedAt: Date.now(),
    })
  }
}, [answers, flagged, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Fix handleSaveAndExit to actually save before navigating**

Find `handleSaveAndExit` and replace it:

```typescript
function handleSaveAndExit() {
  saveTestDraft({
    questions: session.questions,
    answers: answersRef.current,
    flagged: flaggedRef.current,
    currentIndex,
    timed: session.timed,
    showTimer: session.showTimer,
    remainingSeconds: remainingSecondsRef.current,
    subjectSlug: session.subjectSlug,
    savedAt: Date.now(),
  })
  router.push(`/${session.subjectSlug}`)
}
```

- [ ] **Step 5: Clear draft on submit**

Find `doSubmit` and add `clearTestDraft` before calling `onComplete`:

```typescript
function doSubmit() {
  clearTestDraft(session.subjectSlug)
  onComplete({
    ...session,
    answers: answersRef.current,
    flagged: flaggedRef.current,
  })
}
```

- [ ] **Step 6: Clear draft on timer expiry**

Find `handleExpiry` and add `clearTestDraft` at the top:

```typescript
function handleExpiry() {
  clearTestDraft(session.subjectSlug)
  setShowTimesUp(true)
  setTimeout(() => {
    setShowTimesUp(false)
    onComplete({
      ...session,
      answers: answersRef.current,
      flagged: flaggedRef.current,
    })
  }, 1500)
}
```

- [ ] **Step 7: Pass onTick to TestTimer**

Find the `<TestTimer>` JSX and add the `onTick` prop:

```tsx
<TestTimer
  initialSeconds={session.durationSeconds}
  timed={session.timed}
  inline
  onExpiry={handleExpiry}
  onTick={handleTick}
/>
```

- [ ] **Step 8: Commit**

```bash
git add components/test/TestSession.tsx
git commit -m "feat(persistence): auto-save test progress, fix Save & Exit, clear draft on complete"
```

---

### Task 9: Update drills page — detect draft and show resume prompt

**Files:**
- Modify: `app/[subject]/drills/page.tsx`

- [ ] **Step 1: Update React import to include useEffect**

Find: `import { useState } from 'react'` and `import { use } from 'react'`

Replace with:
```typescript
import { useState, useEffect, use } from 'react'
```

- [ ] **Step 2: Update the existing drillSession import lines**

The page already has: `import type { DrillView, SessionState, DrillCard } from '@/utils/drillSession'`

Replace that type import and add a function import so you end up with both:
```typescript
import { loadDrillDraft, clearDrillDraft } from '@/utils/drillSession'
import type { DrillView, SessionState, DrillCard, DrillDraft } from '@/utils/drillSession'
```

- [ ] **Step 3: Add draft state declarations after existing state**

```typescript
const [draft, setDraft] = useState<DrillDraft | null>(null)
const [draftChecked, setDraftChecked] = useState(false)
```

- [ ] **Step 4: Add useEffect to load draft on mount**

```typescript
useEffect(() => {
  const saved = loadDrillDraft(subject)
  setDraft(saved)
  setDraftChecked(true)
}, [subject])
```

- [ ] **Step 5: Add resume and dismiss handlers**

```typescript
const handleResumeDraft = () => {
  if (!draft) return
  const resumedSession: SessionState = {
    cards: draft.cards,
    index: draft.currentIndex,
    answers: draft.answers,
    isRetry: draft.isRetry,
    unitSlug: draft.unitSlug,
  }
  setSession(resumedSession)
  setDraft(null)
  setView('session')
}

const handleDismissDraft = () => {
  clearDrillDraft(subject)
  setDraft(null)
}
```

- [ ] **Step 6: Replace the unit-select JSX block with draft-aware rendering**

Find this block in the return statement:
```tsx
{view === 'unit-select' && (
  <UnitSelector
    subject={subject}
    onStart={handleStart}
    browseMode={browseMode}
    onBrowseToggle={setBrowseMode}
    onBrowse={handleBrowse}
  />
)}
```

Replace with:
```tsx
{view === 'unit-select' && draftChecked && draft && (
  <div
    style={{
      maxWidth: '480px',
      margin: '80px auto 0',
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px 24px',
    }}
  >
    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
      Unfinished session
    </p>
    <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
      {draft.unitSlug === 'all' ? 'All Units' : `Unit ${draft.unitSlug.replace('unit-', '')}`}
      {draft.isRetry ? ' · Retry' : ''}
    </p>
    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
      {Object.keys(draft.answers).length} of {draft.cards.length} cards answered
    </p>
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={handleResumeDraft}
        style={{
          flex: 1,
          padding: '11px 0',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: 'var(--accent)',
          color: 'white',
          fontSize: '0.9375rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Continue
      </button>
      <button
        onClick={handleDismissDraft}
        style={{
          flex: 1,
          padding: '11px 0',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--bg-border)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: '0.9375rem',
          cursor: 'pointer',
        }}
      >
        Start Fresh
      </button>
    </div>
  </div>
)}
{view === 'unit-select' && draftChecked && !draft && (
  <UnitSelector
    subject={subject}
    onStart={handleStart}
    browseMode={browseMode}
    onBrowseToggle={setBrowseMode}
    onBrowse={handleBrowse}
  />
)}
```

- [ ] **Step 7: Commit**

```bash
git add app/[subject]/drills/page.tsx
git commit -m "feat(persistence): show resume prompt on drills page when draft exists"
```

---

### Task 10: Update practice page — detect draft and show resume prompt

**Files:**
- Modify: `app/[subject]/practice/page.tsx`

- [ ] **Step 1: Update React import to include useEffect**

Find: `import { useState } from 'react'` and `import { use } from 'react'`

Replace with:
```typescript
import { useState, useEffect, use } from 'react'
```

- [ ] **Step 2: Update the existing mcqSession import lines**

The page already has: `import type { MCQView, MCQSessionState } from '@/utils/mcqSession'`

Replace that type import and add a function import so you end up with both:
```typescript
import { loadMCQDraft, clearMCQDraft } from '@/utils/mcqSession'
import type { MCQView, MCQSessionState, MCQDraft } from '@/utils/mcqSession'
```

- [ ] **Step 3: Add draft state declarations after existing state**

```typescript
const [draft, setDraft] = useState<MCQDraft | null>(null)
const [draftChecked, setDraftChecked] = useState(false)
```

- [ ] **Step 4: Add useEffect to load draft on mount**

```typescript
useEffect(() => {
  const saved = loadMCQDraft(subject)
  setDraft(saved)
  setDraftChecked(true)
}, [subject])
```

- [ ] **Step 5: Add resume and dismiss handlers**

```typescript
const handleResumeDraft = () => {
  if (!draft) return
  const resumedSession: MCQSessionState = {
    questions: draft.questions,
    currentIndex: draft.currentIndex,
    answers: draft.answers,
    isRetry: draft.isRetry,
    unitSlug: draft.unitSlug,
    retryQuestionIds: draft.retryQuestionIds,
  }
  setSession(resumedSession)
  setDraft(null)
  setView('session')
}

const handleDismissDraft = () => {
  clearMCQDraft(subject)
  setDraft(null)
}
```

- [ ] **Step 6: Replace the unit-select JSX block with draft-aware rendering**

Find:
```tsx
{view === 'unit-select' && (
  <UnitSelector subject={subject} onStart={handleStart} />
)}
```

Replace with:
```tsx
{view === 'unit-select' && draftChecked && draft && (
  <div
    style={{
      maxWidth: '480px',
      margin: '80px auto 0',
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px 24px',
    }}
  >
    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
      Unfinished session
    </p>
    <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
      {draft.unitSlug === 'all' ? 'All Units' : `Unit ${draft.unitSlug.replace('unit-', '')}`}
      {draft.isRetry ? ' · Retry' : ''}
    </p>
    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
      {Object.keys(draft.answers).length} of {draft.questions.length} questions answered
    </p>
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={handleResumeDraft}
        style={{
          flex: 1,
          padding: '11px 0',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: 'var(--accent)',
          color: 'white',
          fontSize: '0.9375rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Continue
      </button>
      <button
        onClick={handleDismissDraft}
        style={{
          flex: 1,
          padding: '11px 0',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--bg-border)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: '0.9375rem',
          cursor: 'pointer',
        }}
      >
        Start Fresh
      </button>
    </div>
  </div>
)}
{view === 'unit-select' && draftChecked && !draft && (
  <UnitSelector subject={subject} onStart={handleStart} />
)}
```

- [ ] **Step 7: Commit**

```bash
git add app/[subject]/practice/page.tsx
git commit -m "feat(persistence): show resume prompt on practice page when draft exists"
```

---

### Task 11: Update practice-test page — detect draft and show resume prompt

**Files:**
- Modify: `app/[subject]/practice-test/page.tsx`

- [ ] **Step 1: Update React import to include useEffect**

Find: `import { useState, use } from 'react'`

Replace with:
```typescript
import { useState, use, useEffect } from 'react'
```

- [ ] **Step 2: Update the existing testSession import lines**

The page already has:
```typescript
import { composeTest } from '@/utils/testSession'
import type { TestSessionState } from '@/utils/testSession'
```

Replace those with:
```typescript
import { composeTest, loadTestDraft, clearTestDraft } from '@/utils/testSession'
import type { TestSessionState, TestDraft } from '@/utils/testSession'
```

- [ ] **Step 3: Add draft state declarations after existing state**

```typescript
const [testDraft, setTestDraft] = useState<TestDraft | null>(null)
const [draftChecked, setDraftChecked] = useState(false)
```

- [ ] **Step 4: Add useEffect to load draft on mount**

```typescript
useEffect(() => {
  const saved = loadTestDraft(subject)
  setTestDraft(saved)
  setDraftChecked(true)
}, [subject])
```

- [ ] **Step 5: Add resume and dismiss handlers and time formatter**

```typescript
function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function handleResumeTest() {
  if (!testDraft) return
  const restoredSession: TestSessionState = {
    questions: testDraft.questions,
    answers: testDraft.answers,
    flagged: testDraft.flagged,
    currentIndex: testDraft.currentIndex,
    timed: testDraft.timed,
    showTimer: testDraft.showTimer,
    durationSeconds: testDraft.remainingSeconds,  // start timer from remaining, not full duration
    subjectSlug: testDraft.subjectSlug,
  }
  setSession(restoredSession)
  setTestDraft(null)
  setView('session')
}

function handleDismissTestDraft() {
  clearTestDraft(subject)
  setTestDraft(null)
}
```

- [ ] **Step 6: Replace the setup-view JSX block with draft-aware rendering**

Find:
```tsx
{view === 'setup' && !loadError && (
  <TestSetup
    subjectSlug={subject}
    subjectName={subjectData.name}
    questionCount={config.questionCount}
    durationMinutes={config.durationMinutes}
    onStart={handleStart}
  />
)}
```

Replace with:
```tsx
{view === 'setup' && draftChecked && testDraft && !loadError && (
  <div
    style={{
      maxWidth: '480px',
      margin: '80px auto 0',
      padding: '0 24px',
    }}
  >
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
      }}
    >
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
        Unfinished practice test
      </p>
      <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {subjectData.name}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: testDraft.timed ? '8px' : '24px' }}>
        {Object.keys(testDraft.answers).length} of {testDraft.questions.length} questions answered
      </p>
      {testDraft.timed && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          {formatRemaining(testDraft.remainingSeconds)} remaining
        </p>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleResumeTest}
          style={{
            flex: 1,
            padding: '11px 0',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '0.9375rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Continue Test
        </button>
        <button
          onClick={handleDismissTestDraft}
          style={{
            flex: 1,
            padding: '11px 0',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--bg-border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.9375rem',
            cursor: 'pointer',
          }}
        >
          Start New Test
        </button>
      </div>
    </div>
  </div>
)}
{view === 'setup' && draftChecked && !testDraft && !loadError && (
  <TestSetup
    subjectSlug={subject}
    subjectName={subjectData.name}
    questionCount={config.questionCount}
    durationMinutes={config.durationMinutes}
    onStart={handleStart}
  />
)}
```

- [ ] **Step 7: Commit**

```bash
git add app/[subject]/practice-test/page.tsx
git commit -m "feat(persistence): show resume prompt on practice-test page when draft exists"
```
