# Technology Stack

**Analysis Date:** 2026-03-23

## Languages

**Primary:**
- TypeScript ^5 - All source files (`app/`, `components/`, `utils/`, `lib/`)

**Secondary:**
- CSS - `styles/globals.css` for theme tokens and base resets

## Runtime

**Environment:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` present)

**Package Manager:**
- npm (inferred from `package.json` structure)
- Lockfile: present (`package-lock.json` expected; not explicitly verified)

## Frameworks

**Core:**
- Next.js ^16.2.1 - App Router, server components, API routes
- React ^19.2.4 - UI rendering
- React DOM ^19.2.4 - DOM rendering

**Build/Dev:**
- `@tailwindcss/postcss` ^4 - PostCSS integration for Tailwind v4
- `ts-node` ^10.9.2 - TypeScript execution for scripts
- `ts-jest` ^29.4.6 - TypeScript transform for Jest

## Styling

**Framework:** Tailwind CSS ^4 (v4 — no `tailwind.config.ts`)

**Configuration method:** `@theme {}` directive in `styles/globals.css` — not a config file.

**Theme tokens defined in `styles/globals.css`:**
- Colors: `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-card`, `--color-bg-card-hover`, `--color-bg-border`
- Text: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- Accent: `--color-accent` (#6366f1 indigo), `--color-accent-hover`, `--color-accent-success`, `--color-accent-warning`, `--color-accent-danger`
- Mastery: `--color-mastery-empty`, `--color-mastery-fill`
- Radius: `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (16px), `--radius-xl` (24px)

**Dark mode:** Always-on. Tokens duplicated as plain CSS custom properties under `:root` for use in inline styles and non-Tailwind contexts.

**Font stack:** `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif` (set on `html` in globals.css)

## Key Dependencies

**Critical:**
- `katex` ^0.16.40 - Math/formula rendering; all formulas must use KaTeX (never plain text)
- `chart.js` ^4.5.1 - Data visualization for stimulus graphs
- `react-chartjs-2` ^5.3.1 - React wrapper for Chart.js
- `@supabase/supabase-js` ^2.99.3 - Anonymous event logging client
- `lucide-react` ^0.577.0 - Icon library

## Dev Dependencies

- `@types/jest` ^30.0.0 - Jest type definitions
- `@types/katex` ^0.16.8 - KaTeX type definitions
- `@types/node` ^20 - Node.js type definitions
- `@types/react` ^19 - React type definitions
- `@types/react-dom` ^19 - React DOM type definitions
- `jest` ^30.3.0 - Test runner
- `jest-environment-jsdom` ^30.3.0 - Browser environment for Jest
- `ts-jest` ^29.4.6 - TypeScript Jest transformer
- `ts-node` ^10.9.2 - TypeScript Node runner
- `typescript` ^5 - TypeScript compiler
- `tailwindcss` ^4 - Tailwind CSS framework
- `@tailwindcss/postcss` ^4 - PostCSS plugin

## Configuration

**Environment:**
- `.env.local` present (not read — values confidential)
- Required env vars (referenced in source): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_` prefix exposes URL to client bundle; `SUPABASE_ANON_KEY` is server-only (used in API route only)

**Build:**
- `next.config.ts` — minimal, no custom options set
- Entry: `next dev` / `next build` / `next start`
- Test: `jest`

## Platform Requirements

**Development:**
- Node.js with npm
- `.env.local` with Supabase credentials

**Production:**
- Vercel (planned deployment target: ascendly.vercel.app)
- Supabase project with `events` table

---

*Stack analysis: 2026-03-23*
