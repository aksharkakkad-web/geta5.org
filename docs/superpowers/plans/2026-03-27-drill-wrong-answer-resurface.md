# Drill Wrong-Answer Resurface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a student answers a drill card wrong, the card is re-inserted into the deck 3 positions ahead and keeps reappearing until they answer it correctly.

**Architecture:** A `workingDeck` state (separate from the immutable `session.cards` original deck) drives card presentation in `DrillSession`. When the user clicks "Next" after a wrong answer, `insertRetryCard` splices the card back into `workingDeck` at `currentIndex + RETRY_INTERVAL + 1`. The session ends only when the working deck is exhausted — meaning all cards were eventually answered correctly. Session results use `session.cards` (original length) for accuracy calculations, so retry appearances don't inflate stats.

**Tech Stack:** React 18 state/refs, TypeScript, Jest/ts-jest

---

## File Map

| File | Change |
|------|--------|
| `utils/drillSession.ts` | Add `RETRY_INTERVAL = 3`, `insertRetryCard()`, `workingDeck?` to `SessionState` and `DrillDraft` |
| `utils/__tests__/drillSession.test.ts` | Add tests for `insertRetryCard` |
| `components/drill/DrillSession.tsx` | Replace `session.cards[currentIndex]` with `workingDeck` state; retry insertion in `handleNext`; update draft save |
| `app/[subject]/drills/page.tsx` | Pass `workingDeck` from draft through `SessionState` on resume |

---

## Task 1: Add `insertRetryCard` to `utils/drillSession.ts`

**Files:**
- Modify: `utils/drillSession.ts`

- [ ] **Step 1: Add `RETRY_INTERVAL` constant and `insertRetryCard` function**

  Open `utils/drillSession.ts`. After the `MODE_LABELS` constant (line ~49), add:

  ```typescript
  export const RETRY_INTERVAL = 3

  /**
   * Returns a new deck with `card` spliced in RETRY_INTERVAL+1 positions
   * after `currentIndex`. If the deck is too short, card goes at the end.
   * Pure function — does not mutate the input array.
   */
  export function insertRetryCard(deck: DrillCard[], card: DrillCard, currentIndex: number): DrillCard[] {
    const insertAt = Math.min(currentIndex + RETRY_INTERVAL + 1, deck.length)
    const updated = [...deck]
    updated.splice(insertAt, 0, card)
    return updated
  }
  ```

- [ ] **Step 2: Add `workingDeck?` to `SessionState` and `DrillDraft`**

  In `SessionState` interface, add one optional field:

  ```typescript
  export interface SessionState {
    cards: DrillCard[]
    workingDeck?: DrillCard[]   // active sequence; includes retry insertions
    index: number
    answers: Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
    isRetry: boolean
    unitSlug: string | 'all'
  }
  ```

  In `DrillDraft` interface, add one optional field:

  ```typescript
  export interface DrillDraft {
    cards: DrillCard[]
    workingDeck?: DrillCard[]   // saved so retries survive refresh
    currentIndex: number
    answers: SessionState['answers']
    isRetry: boolean
    unitSlug: string
    savedAt: number
  }
  ```

---

## Task 2: Test `insertRetryCard`

**Files:**
- Modify: `utils/__tests__/drillSession.test.ts`

- [ ] **Step 1: Add import for new exports**

  At the top of `utils/__tests__/drillSession.test.ts`, add `insertRetryCard` and `RETRY_INTERVAL` to the existing import:

  ```typescript
  import { handleSessionComplete, insertRetryCard, RETRY_INTERVAL, SessionState, DrillCard, DrillMode, normalizeCard } from '../drillSession'
  ```

- [ ] **Step 2: Add `describe('insertRetryCard')` block at the end of the file**

  ```typescript
  describe('insertRetryCard', () => {
    function card(id: string): DrillCard {
      return {
        id,
        unit: 'unit-1',
        subject: 'ap-psychology',
        mode: 'definition_to_term',
        prompt: `Prompt ${id}`,
        answer: `Answer ${id}`,
        difficulty: 'easy',
      }
    }

    it('inserts RETRY_INTERVAL+1 positions ahead of currentIndex', () => {
      // deck: [a, b, c, d, e], currentIndex=0
      // insertAt = min(0+3+1, 5) = 4
      // result: [a, b, c, d, a, e]
      const deck = [card('a'), card('b'), card('c'), card('d'), card('e')]
      const result = insertRetryCard(deck, deck[0], 0)
      expect(result.length).toBe(6)
      expect(result[4]).toEqual(deck[0])
    })

    it('inserts at end when deck is shorter than RETRY_INTERVAL', () => {
      // deck: [a, b], currentIndex=0
      // insertAt = min(0+3+1, 2) = 2
      // result: [a, b, a]
      const deck = [card('a'), card('b')]
      const result = insertRetryCard(deck, deck[0], 0)
      expect(result.length).toBe(3)
      expect(result[result.length - 1]).toEqual(deck[0])
    })

    it('does not mutate the original deck', () => {
      const deck = [card('a'), card('b'), card('c'), card('d'), card('e')]
      const snapshot = [...deck]
      insertRetryCard(deck, deck[0], 0)
      expect(deck).toEqual(snapshot)
    })

    it('handles currentIndex at the last card', () => {
      // deck: [a, b, c], currentIndex=2 (last card)
      // insertAt = min(2+3+1, 3) = 3 = end
      const deck = [card('a'), card('b'), card('c')]
      const result = insertRetryCard(deck, deck[2], 2)
      expect(result.length).toBe(4)
      expect(result[3]).toEqual(deck[2])
    })

    it('works with mid-session currentIndex', () => {
      // deck: [a, b, c, d, e, f, g], currentIndex=2
      // insertAt = min(2+3+1, 7) = 6
      // result: [a, b, c, d, e, f, c, g]
      const deck = [card('a'), card('b'), card('c'), card('d'), card('e'), card('f'), card('g')]
      const result = insertRetryCard(deck, deck[2], 2)
      expect(result.length).toBe(8)
      expect(result[6]).toEqual(deck[2])
    })
  })
  ```

- [ ] **Step 3: Run tests — expect FAIL (function not yet exported)**

  ```bash
  npx jest utils/__tests__/drillSession.test.ts --no-coverage 2>&1 | tail -20
  ```

  Expected: `Cannot find module` or `insertRetryCard is not a function` — confirms tests are wired.

- [ ] **Step 4: Run tests after Task 1 is complete — expect PASS**

  ```bash
  npx jest utils/__tests__/drillSession.test.ts --no-coverage 2>&1 | tail -20
  ```

  Expected: all tests pass (including existing `handleSessionComplete` and `normalizeCard` suites).

- [ ] **Step 5: Commit**

  ```bash
  git add utils/drillSession.ts utils/__tests__/drillSession.test.ts
  git commit -m "feat(drill): add insertRetryCard + RETRY_INTERVAL; extend SessionState/DrillDraft types"
  ```

---

## Task 3: Implement working deck in `DrillSession.tsx`

**Files:**
- Modify: `components/drill/DrillSession.tsx`

- [ ] **Step 1: Add `insertRetryCard` and `RETRY_INTERVAL` to import**

  Line 6 currently reads:
  ```typescript
  import { SessionState, saveDrillDraft, clearDrillDraft } from '@/utils/drillSession'
  ```

  Replace with:
  ```typescript
  import { SessionState, saveDrillDraft, clearDrillDraft, insertRetryCard, RETRY_INTERVAL } from '@/utils/drillSession'
  ```

  (Remove the unused `RETRY_INTERVAL` import lint warning — it IS used below.)

- [ ] **Step 2: Add `workingDeck` state and ref**

  After the existing `const [answers, ...]` state declaration (currently line ~19), add:

  ```typescript
  const [workingDeck, setWorkingDeck] = useState<SessionState['cards']>(() =>
    session.workingDeck ?? [...session.cards]
  )
  const workingDeckRef = useRef(workingDeck)
  workingDeckRef.current = workingDeck
  ```

- [ ] **Step 3: Replace `session.cards[currentIndex]` and `session.cards.length`**

  Change these two lines:
  ```typescript
  // BEFORE
  const totalCards = session.cards.length
  const currentCard = session.cards[currentIndex]
  ```

  To:
  ```typescript
  const totalCards = workingDeck.length
  const currentCard = workingDeck[currentIndex]
  ```

- [ ] **Step 4: Update `handleNext` — insert retry card before advancing**

  Replace the current `handleNext` function:

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

  With:

  ```typescript
  const handleNext = () => {
    const currentCard = workingDeckRef.current[currentIndex]
    const finalVerdict = answersRef.current[currentCard.id]?.verdict

    // If wrong, splice card back into deck RETRY_INTERVAL positions ahead
    let nextDeck = workingDeckRef.current
    if (finalVerdict === 'wrong') {
      nextDeck = insertRetryCard(workingDeckRef.current, currentCard, currentIndex)
      setWorkingDeck(nextDeck)
    }

    if (currentIndex + 1 >= nextDeck.length) {
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

  **Why `nextDeck` instead of `workingDeckRef.current` for the end check:** `setWorkingDeck` is async — `workingDeckRef.current` won't have updated by the time the `>= nextDeck.length` check runs. Using the local `nextDeck` variable (which has the retry card already inserted) gives the correct length synchronously.

- [ ] **Step 5: Update draft save to include `workingDeck`**

  The existing `useEffect` for draft saving passes `cards: session.cards`. Update it to also pass `workingDeck`:

  ```typescript
  useEffect(() => {
    if (currentIndex > 0) {
      saveDrillDraft(subject, {
        cards: session.cards,
        workingDeck: workingDeckRef.current,
        currentIndex,
        answers: answersRef.current,
        isRetry: session.isRetry,
        unitSlug: session.unitSlug,
        savedAt: Date.now(),
      })
    }
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps
  ```

- [ ] **Step 6: Add `key` prop to DrillCard to force remount on re-appearance**

  In the JSX where `<DrillCard>` is rendered (currently no key prop), add a composite key:

  ```tsx
  <DrillCard
    key={`${currentCard.id}-${currentIndex}`}
    card={currentCard}
    onAnswer={handleAnswer}
    onNext={handleNext}
  />
  ```

  **Why:** When the same card reappears (same `id`), React would reuse the component instance and the `useEffect([card.id])` inside won't fire (id hasn't changed). Adding `currentIndex` to the key forces a fresh mount, resetting `verdict`, `inputValue`, `shuffledChoices`, etc.

- [ ] **Step 7: Verify the file compiles**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: no errors.

- [ ] **Step 8: Commit**

  ```bash
  git add components/drill/DrillSession.tsx
  git commit -m "feat(drill): re-queue wrong answers every 3 cards until correct"
  ```

---

## Task 4: Pass `workingDeck` through draft resume in `page.tsx`

**Files:**
- Modify: `app/[subject]/drills/page.tsx`

- [ ] **Step 1: Update `handleResumeDraft`**

  The current function builds a `SessionState` from the draft. Add `workingDeck`:

  ```typescript
  const handleResumeDraft = () => {
    if (!draft) return
    const resumedSession: SessionState = {
      cards: draft.cards,
      workingDeck: draft.workingDeck,   // restores retry insertions across refresh
      index: draft.currentIndex,
      answers: draft.answers,
      isRetry: draft.isRetry,
      unitSlug: draft.unitSlug,
    }
    setSession(resumedSession)
    setDraft(null)
    setView('session')
  }
  ```

  **Why:** Without this, a resumed session loses all retry insertions and restarts from the original deck, which would skip cards the student still needs to review.

- [ ] **Step 2: Verify the file compiles**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: no errors.

- [ ] **Step 3: Run full test suite**

  ```bash
  npx jest --no-coverage 2>&1 | tail -20
  ```

  Expected: all tests pass.

- [ ] **Step 4: Commit**

  ```bash
  git add app/[subject]/drills/page.tsx
  git commit -m "feat(drill): restore workingDeck (retry state) from draft on resume"
  ```

---

## Self-Review

**Spec coverage:**
- ✓ Wrong card reappears after X terms (X = RETRY_INTERVAL = 3)
- ✓ Card keeps reappearing until correct (re-inserted on every wrong pass through `handleNext`)
- ✓ "I knew this" correctly marks card correct — `handleNext` sees verdict 'correct', skips insertion ✓
- ✓ Session ends only when all retry cards are exhausted (uses `nextDeck.length` not original)
- ✓ MCQ choices already randomized per previous fix (not in scope here)
- ✓ Accuracy stats unaffected — `onComplete` always passes `session.cards` (original), `handleSessionComplete` uses `session.cards.length` for denominator

**Edge cases handled:**
- Same card reappearing: `key={id-index}` forces fresh DrillCard mount → correct reset of all card state
- "I knew this" after wrong: `handleNext` reads FINAL verdict from `answersRef` — if 'correct', no retry
- Short deck: `insertRetryCard` clamps `insertAt` to `deck.length`
- Draft resume: `workingDeck` passed through `SessionState` and initialized in useState

**Placeholder scan:** None found.

**Type consistency:** `SessionState['cards']` used for `workingDeck` type → same `DrillCard[]` type throughout.
