# Mode Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each mode card a unique color identity (tinted gradient background, colored border, mode-matched icon) so the subject page's mode-selection grid pops instead of looking flat.

**Architecture:** Two files change. `ModeCard.tsx` gains a `colorKey` prop, a `colorMap` lookup object, and `useState`/`useEffect` hooks for hover and reduced-motion. `app/[subject]/page.tsx` passes the new prop per mode. No new files. No new CSS classes. No layout changes.

**Tech Stack:** Next.js 14, React 18, TypeScript, inline styles (existing pattern in this component)

---

## Files

| File | Change |
|---|---|
| `components/ui/ModeCard.tsx` | Add `colorKey` prop + `colorMap`, hooks, updated styles |
| `app/[subject]/page.tsx` | Add `colorKey` to each entry in the `modes` array |

---

### Task 1: Add `colorKey` prop and `colorMap` to ModeCard

**Files:**
- Modify: `components/ui/ModeCard.tsx`

- [ ] **Step 1: Add `'use client'` directive and update imports**

Open `components/ui/ModeCard.tsx`. Add `'use client'` as the very first line (hooks require a client component). Add `useState` and `useEffect` to the React import:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
```

- [ ] **Step 2: Define the `colorMap` object**

Add this constant directly below the imports, before the interface:

```tsx
const colorMap = {
  indigo: {
    hex: '#6366f1',
    rgb: '99, 102, 241',
    grad: 'linear-gradient(145deg, #1a1a2e 0%, #16161f 100%)',
  },
  cyan: {
    hex: '#06b6d4',
    rgb: '6, 182, 212',
    grad: 'linear-gradient(145deg, #0e1e2b 0%, #121820 100%)',
  },
  green: {
    hex: '#10b981',
    rgb: '16, 185, 129',
    grad: 'linear-gradient(145deg, #0e1e18 0%, #121a16 100%)',
  },
  amber: {
    hex: '#f59e0b',
    rgb: '245, 158, 11',
    grad: 'linear-gradient(145deg, #1e1a0e 0%, #1a1612 100%)',
  },
} as const

type ColorKey = keyof typeof colorMap
```

- [ ] **Step 3: Update the `ModeCardProps` interface**

Replace the existing interface:

```tsx
interface ModeCardProps {
  title: string
  description: string
  Icon: LucideIcon
  href: string
  colorKey: ColorKey
}
```

- [ ] **Step 4: Add hover and reduced-motion state inside the component**

Replace the function signature and add state:

```tsx
export function ModeCard({ title, description, Icon, href, colorKey }: ModeCardProps) {
  const [hovered, setHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const c = colorMap[colorKey]
```

- [ ] **Step 5: Update the returned JSX with new styles**

Replace the entire `return` block:

```tsx
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: c.grad,
          border: hovered
            ? `1px solid rgba(${c.rgb}, 0.50)`
            : `1px solid rgba(${c.rgb}, 0.20)`,
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          cursor: 'pointer',
          height: '100%',
          boxShadow: hovered ? `0 4px 20px rgba(${c.rgb}, 0.12)` : 'none',
          transform: hovered && !reducedMotion ? 'translateY(-2px)' : 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
        }}
      >
        <Icon
          size={28}
          color={c.hex}
          style={{ marginBottom: '12px' }}
        />
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. If `colorKey` is missing anywhere it's used, TypeScript will catch it here.

- [ ] **Step 7: Commit**

```bash
git add components/ui/ModeCard.tsx
git commit -m "feat(ui): add per-mode color identity to ModeCard"
```

---

### Task 2: Pass `colorKey` from the subject page

**Files:**
- Modify: `app/[subject]/page.tsx`

- [ ] **Step 1: Update the `modes` array**

In `app/[subject]/page.tsx`, find the `modes` array (around line 52). Add `colorKey` to each entry:

```tsx
const modes = [
  {
    title: 'Drills',
    description: 'Flashcards and term recall',
    Icon: BookOpen,
    href: `/${subject.slug}/drills`,
    colorKey: 'indigo' as const,
  },
  {
    title: 'Practice Questions',
    description: 'MCQs with stimulus',
    Icon: ClipboardList,
    href: `/${subject.slug}/practice`,
    colorKey: 'cyan' as const,
  },
  {
    title: 'Study Guide',
    description: 'Concepts, terms, formulas',
    Icon: BookMarked,
    href: `/${subject.slug}/study-guide`,
    colorKey: 'green' as const,
  },
  {
    title: 'Practice Test',
    description: 'Full-length timed test',
    Icon: Trophy,
    href: `/${subject.slug}/practice-test`,
    colorKey: 'amber' as const,
  },
]
```

- [ ] **Step 2: Pass `colorKey` to `<ModeCard>`**

Find the `ModeCard` usage in the JSX (around line 122) and add the prop:

```tsx
{modes.map(mode => (
  <ModeCard
    key={mode.title}
    title={mode.title}
    description={mode.description}
    Icon={mode.Icon}
    href={mode.href}
    colorKey={mode.colorKey}
  />
))}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Dev server smoke test**

```bash
npm run dev
```

Open `http://localhost:3000/ap-psychology` (or any subject). Verify:
- All 4 cards have distinct tinted backgrounds (dark indigo / cyan / green / amber wash)
- Hover on each card: border brightens + card lifts slightly
- No layout shift, no broken icons

- [ ] **Step 5: Commit**

```bash
git add app/\[subject\]/page.tsx
git commit -m "feat(ui): wire colorKey prop to ModeCard per mode"
```

---

### Task 3: Screenshot loop

- [ ] **Step 1: Trigger screenshot loop**

Say to the user: "UI work is done. Please paste a screenshot so I can verify it looks correct before marking this complete."

- [ ] **Step 2: Verify screenshot**

Check:
- [ ] Each card has a unique, barely-there tinted background (4 different colors visible)
- [ ] Cards are not all the same color
- [ ] No plain white/broken layout
- [ ] 2-column grid intact

- [ ] **Step 3: Mark complete**

Only after screenshot confirmation: task is done.
