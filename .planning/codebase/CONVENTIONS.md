# Conventions

**Analysis Date:** 2026-03-23

## TypeScript

- **Strict mode enabled** (`"strict": true` in `tsconfig.json`)
- **Target:** ES2017, module: ESNext, moduleResolution: bundler
- **Path alias:** `@/*` maps to project root (e.g., `@/utils/subjects`, `@/components/ui/ModeCard`)
- **Interfaces** used for prop types and data shapes (e.g., `SubjectUnit`, `Subject`, `MasteryData`)
- **Type assertions:** Used minimally (`as T` in `lsGet`, `subject!` after notFound guard)
- **Return types:** Explicit on utility functions (`projectScore(): 1|2|3|4|5`); inferred on components

## React

- **Functional components only** — no class components
- **Named exports** for all components (no default exports on components)
  - Exception: page files use `export default function` (Next.js requirement)
- **"use client" placement:** Top of file, first line, before any imports
- **Props interfaces:** Defined locally above the component (`interface ModeCardProps { ... }`)
- **Hooks:** `useState` + `useEffect` for localStorage reads (pattern established in `UnitProgressGrid`)
- **No Context API** usage yet
- **Server components by default** — `'use client'` only when localStorage or browser APIs needed

## CSS / Styling

- **Tailwind CSS v4** — no `tailwind.config.ts`; configured via `@theme {}` in `app/globals.css`
- **CSS custom properties for all colors** — never hardcoded hex values in component files
  - Correct: `color: 'var(--text-primary)'`
  - Wrong: `color: '#f5f5f5'`
- **Inline styles** used in page files (`style={{ ... }}`) for layout and spacing
- **CSS class names** used for hover/transition states defined in `globals.css` (e.g., `.mode-card`, `.subject-grid`)
- **Dark mode:** Always-on via `:root` — no `dark:` variant needed in practice
- **Spacing:** 4pt/8pt rhythm — values observed: 4, 6, 8, 12, 16, 24, 32, 40, 48, 64px
- **No Tailwind utility classes in JSX** except for layout helpers (e.g., `className="subject-grid"`)
- **Icons:** Lucide React only — `import { BookOpen } from 'lucide-react'`. No emojis as icons.

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Component files | PascalCase | `ModeCard.tsx`, `UnitProgressGrid.tsx` |
| Utility files | camelCase | `localStorage.ts`, `fuzzyMatch.ts` |
| Route folders | kebab-case | `[subject]/practice-test/` |
| Subject slugs | kebab-case | `ap-psychology`, `ap-calculus-ab` |
| localStorage keys | snake_case with prefix | `ascendly_mastery_ap-psychology_1` |
| TypeScript interfaces | PascalCase | `SubjectUnit`, `MasteryData` |
| Functions | camelCase | `getSubject()`, `logEvent()`, `projectScore()` |
| CSS classes | kebab-case | `.mode-card`, `.subject-grid` |

## Import Conventions

- **Path alias `@/`** used for all cross-directory imports
  ```ts
  import { getSubject } from '@/utils/subjects'
  import { ModeCard } from '@/components/ui/ModeCard'
  ```
- **Relative imports** used within the same directory (test files importing their utils)
- **Type imports:** `import type { Metadata }` for type-only imports from Next.js

## File Organization

- Components are co-located by domain: `components/ui/`, `components/layout/`
- Tests live in `utils/__tests__/` adjacent to the utils being tested
- No test files in `components/` yet
- Schema files in `data/schemas/`; content JSON will go in `data/[subject]/`

## Critical Coding Rules (from CLAUDE.md)

These are non-negotiable constraints that every code change must respect:

1. **KaTeX always** — Never render math as plain text. Use `KatexRenderer` component.
2. **No hardcoded hex** — Always use `var(--css-token)` for colors.
3. **No emojis as icons** — Lucide React SVG icons only.
4. **Scramble at render time** — `scramble()` from `utils/scramble.ts` called in components, never in JSON files.
5. **Fire-and-forget analytics** — `logEvent()` never awaited; `.catch(() => {})` always present.
6. **No College Board pseudocode in AP CSP** — Use College Board pseudocode format exactly.
7. **localStorage guards** — Always use `lsGet`/`lsSet` from `utils/localStorage.ts`, never raw `localStorage`.
8. **No placeholder text in UI** — Real content only in all rendered states.

## Supabase Pattern

- Client components never import from `lib/supabase.ts` directly for writes
- All events go through `utils/analytics.ts → logEvent() → /api/log-event`
- `lib/supabase.ts` available for future read queries if needed

---
*Conventions analysis: 2026-03-23*
