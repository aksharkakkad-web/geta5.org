# Concerns

**Analysis Date:** 2026-03-23

## HIGH Priority

### 1. Stub Pages Expose "Coming in Phase 2" Text
**File:** `app/[subject]/drills/page.tsx:4`
**Issue:** The stubs render `<h1>Drills — Coming in Phase 2</h1>` and expose `params.subject` directly. CLAUDE.md Critical Rule #3 prohibits placeholder text visible to users. These are only acceptable while the app is pre-launch.
**Risk:** If deployed before Phase 2 completes, users see placeholder text.
**Action:** Phase 2 must replace these stubs before any public deployment.

### 2. No .planning/ Infrastructure (Now Being Fixed)
**Issue:** Project has been running without GSD planning structure. Phase tracking is manual (a Markdown table in CLAUDE.md). No persistent STATE.md, no ROADMAP.md, no phase verification records.
**Risk:** Lost context between sessions; no machine-readable progress state.
**Action:** GSD initialization in progress (this mapping is step 1).

### 3. No CI/CD Pipeline
**Issue:** No GitHub Actions, no automated test runs on push, no Vercel preview deployments configured.
**Risk:** Broken code can be committed without detection. Tests are only run manually.
**Action:** Should be added before content phases begin (Phase 5 or earlier).

### 4. No Content JSON Files Yet
**Issue:** `data/` contains only schemas — no actual AP content. Phases 6–12 must generate 50–100 MCQs per unit × 7 subjects × multiple units = thousands of JSON entries.
**Risk:** Content quality (KaTeX correctness, answer accuracy, schema validity) is unverified at scale.
**Action:** Content pipeline (Researcher → Writer → Reviewer) must validate each file before integration.

## MEDIUM Priority

### 5. `scoring.ts` Is a Placeholder
**File:** `utils/scoring.ts:3`
**Issue:** Comment says "Stub — calibrated in Phase 13 with real unit weightings." Current thresholds (80%→5, 65%→4, etc.) are not based on actual AP score distributions or College Board data.
**Risk:** Projected score display may be inaccurate and misleading to students.
**Action:** Phase 13 must replace with College Board-calibrated thresholds per subject.

### 6. KaTeX and Chart.js Bundle Weight Not Evaluated
**Issue:** Both KaTeX and Chart.js are heavy libraries. No bundle analysis has been run. These are loaded app-wide (KaTeX) or potentially so (Chart.js).
**Risk:** Slow initial load, especially on mobile (primary target device).
**Action:** Run `next build` + bundle analyzer before Phase 3 (which adds Chart.js usage). Consider dynamic imports.

### 7. `drills/page.tsx` Uses Non-Async `params`
**File:** `app/[subject]/drills/page.tsx:1`
**Issue:** The stub uses `{ params: { subject: string } }` (non-async) while the main subject page uses `params: Promise<{ subject: string }>` with `await params`. Next.js 15+ requires async params.
**Risk:** Will cause a TypeScript or runtime error when the stub is replaced in Phase 2.
**Action:** Phase 2 implementation must use async params pattern.

### 8. `SubjectAnalytics` Fires on Every Mount
**File:** `components/ui/SubjectAnalytics.tsx`
**Issue:** Fires `page_view` on every component mount, including hot reloads in development. No deduplication or session-level throttling.
**Risk:** Inflated analytics counts during development and on rapid navigation.
**Action:** Consider adding a `sessionStorage` guard in Phase 13 polish.

### 9. Mastery Calculation in `UnitProgressGrid` Uses Raw `localStorage`
**File:** `components/ui/UnitProgressGrid.tsx:24`
**Issue:** Reads `localStorage.getItem(...)` directly rather than using `lsGet` from `utils/localStorage.ts`. Inconsistent with the established pattern.
**Risk:** Breaks the convention that all localStorage access goes through the utility wrapper.
**Action:** Refactor to use `lsGet` in Phase 2 or Phase 13.

### 10. No `loading.tsx` Files
**Issue:** No streaming/suspense loading states defined for any route.
**Risk:** Blank/flash during navigation on slow connections.
**Action:** Add `loading.tsx` stubs before launch (Phase 14).

## LOW Priority

### 11. No `prefers-reduced-motion` in Component CSS
**Issue:** MASTER.md requires `prefers-reduced-motion` respect. The CSS classes in `globals.css` may not yet include this media query for all transitions.
**Risk:** Accessibility concern for users who have reduced motion enabled.
**Action:** Audit in Phase 13 (Retention Mechanics & Polish).

### 12. `next.config.ts` Is Empty
**Issue:** No custom Next.js configuration (no image domains, no redirects, no security headers).
**Risk:** Missing security headers (CSP, X-Frame-Options) before public launch.
**Action:** Add security headers before Phase 14 (Launch).

### 13. No Error Boundary
**Issue:** No React Error Boundary defined. If a content component throws (e.g., malformed KaTeX), the entire page crashes.
**Risk:** Single bad JSON entry could break the entire subject page.
**Action:** Add error boundaries around content-rendering sections in Phase 2+.

### 14. Subject Slug `ap-csp` May Conflict with Convention
**File:** `utils/subjects.ts:84`
**Issue:** The slug is `ap-csp` but the folder convention in PRD is `/data/csp/`. Minor inconsistency between route slug and data folder name.
**Risk:** Low — but could cause confusion during content file creation in Phase 11.
**Action:** Decide: rename data folder to `ap-csp/` or update documentation.

---

## No TODO/FIXME Comments Found in Source

A grep across the codebase found no `TODO`, `FIXME`, or `HACK` comments in source files (outside of the "Coming in Phase 2" placeholder text in stub pages).

---
*Concerns analysis: 2026-03-23*
