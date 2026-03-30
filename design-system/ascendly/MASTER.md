# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/ascendly/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Ascendly
**Generated:** 2026-03-22
**Category:** Educational Productivity Tool — AP Exam Prep
**Theme:** Dark only (no light mode — ever)

---

## Color Palette

All colors are sourced from `app/globals.css` — these are canonical. Never hardcode hex values in components; always use CSS custom properties.

| Role | CSS Variable | Hex | Usage |
|------|-------------|-----|-------|
| Page background | `var(--bg-primary)` | `#050508` | Root background (blue undertone) |
| Section background | `var(--bg-secondary)` | `#0a0a10` | Panels, sidebars |
| Card background | `var(--bg-card)` | `#0e0e16` | Content cards |
| Card hover | `var(--bg-card-hover)` | `#141420` | Card hover state |
| Border / divider | `var(--bg-border)` | `#1a1a2e` | Borders, separators (blue-tinted) |
| Primary text | `var(--text-primary)` | `#f5f5f5` | Headings, body |
| Secondary text | `var(--text-secondary)` | `#a1a1a1` | Subtitles, labels |
| Muted text | `var(--text-muted)` | `#6b6b6b` | Placeholders, hints |
| Accent (primary CTA) | `var(--accent)` | `#6366f1` | Buttons, links, active states |
| Accent hover | `var(--accent-hover)` | `#818cf8` | Button hover |
| Success | `var(--accent-success)` | `#22c55e` | Correct answers, streaks |
| Warning | `var(--accent-warning)` | `#f59e0b` | Partial mastery |
| Danger | `var(--accent-danger)` | `#ef4444` | Wrong answers, errors |
| Mastery empty | `var(--mastery-empty)` | `#1e1e1e` | Empty progress bars |
| Mastery fill | `var(--mastery-fill)` | `#6366f1` | Filled progress bars |

---

## Typography

**Font:** Outfit (loaded via `next/font/google` — self-hosted, CSS variable `--font-outfit`)

```css
font-family: var(--font-outfit), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Type Scale:**

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | `2.25rem` / 36px | 700 | Hero headings |
| H1 | `1.875rem` / 30px | 700 | Page titles |
| H2 | `1.5rem` / 24px | 600 | Section headings |
| H3 | `1.25rem` / 20px | 600 | Card headings |
| H4 | `1.125rem` / 18px | 500 | Sub-section labels |
| Body | `1rem` / 16px | 400 | Body text (minimum — prevents iOS zoom) |
| Small | `0.875rem` / 14px | 400 | Secondary info, captions |
| Micro | `0.75rem` / 12px | 400 | Badges, timestamps only |

**Line height:** 1.5–1.6 for body, 1.2–1.3 for headings
**Letter spacing:** Default system spacing; no tight tracking on body text

---

## Spacing System

4pt/8pt rhythm — always use multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `4px` | 0.25rem | Tight icon gaps |
| `8px` | 0.5rem | Inline spacing, small gaps |
| `12px` | 0.75rem | Compact padding |
| `16px` | 1rem | Standard component padding |
| `24px` | 1.5rem | Card padding, section gaps |
| `32px` | 2rem | Large section spacing |
| `48px` | 3rem | Between major sections |
| `64px` | 4rem | Page-level vertical padding |

---

## Border Radius

From `globals.css`:
- `var(--radius-sm)` = `6px` — small elements (badges, chips)
- `var(--radius-md)` = `10px` — inputs, buttons
- `var(--radius-lg)` = `16px` — cards, modals
- `var(--radius-xl)` = `24px` — large panels, bottom sheets

---

## Component Specs

### Buttons

```css
/* Primary */
background: var(--accent);
color: white;
padding: 10px 20px;
border-radius: var(--radius-md);
font-weight: 600;
font-size: 0.9375rem;
transition: background 150ms ease, transform 150ms ease;
cursor: pointer;

/* Hover */
background: var(--accent-hover);
transform: translateY(-1px);

/* Active/Pressed */
transform: translateY(0);
opacity: 0.9;
```

### Cards

```css
background: var(--bg-card);
border: 1px solid var(--bg-border);
border-radius: var(--radius-lg);
padding: 24px;
transition: background 150ms ease, border-color 150ms ease;
cursor: pointer;

/* Hover */
background: var(--bg-card-hover);
border-color: var(--accent);
```

### Inputs

```css
background: var(--bg-secondary);
border: 1px solid var(--bg-border);
border-radius: var(--radius-md);
padding: 12px 16px;
font-size: 16px;
color: var(--text-primary);
transition: border-color 150ms ease;

/* Focus */
border-color: var(--accent);
outline: none;
box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
```

### Progress / Mastery Bars

```css
background: var(--mastery-empty);
border-radius: 999px;
height: 6px;

/* Fill */
background: var(--mastery-fill);
border-radius: 999px;
transition: width 400ms ease;
```

---

## Style Guidelines

**Style:** Micro-interactions + Minimal Dark
**Keywords:** Focused, low-distraction, tactile feedback, subtle animations, confidence-building
**Target user:** High school student on a phone or laptop, under exam stress — every interaction must feel instant and clear

### Key Interaction Patterns

- **Correct answer feedback:** green flash (`var(--accent-success)`) + subtle scale up (1.02) on card
- **Wrong answer feedback:** red flash (`var(--accent-danger)`) + no scale (don't punish)
- **Button press:** 150ms ease, translateY(-1px) on hover, back on active
- **Card hover:** background shifts from `var(--bg-card)` to `var(--bg-card-hover)`, border highlights to `var(--accent)`
- **Loading states:** skeleton shimmer using `var(--bg-card)` → `var(--bg-card-hover)` animation
- **Progress updates:** 400ms ease width transitions on mastery bars — feels rewarding

### Animation Rules

- Duration: 150–300ms for micro-interactions, max 400ms for progress/reward states
- Easing: `ease` for hover, `ease-out` for entrance, `ease-in` for exit
- Use `transform` and `opacity` only — never animate `width`/`height` except mastery bars
- Always respect `prefers-reduced-motion`

---

## Layout & Responsive

**Breakpoints:**
- Mobile: 375px (primary design target)
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

**Container max-width:** `max-w-3xl` on content, `max-w-6xl` on layout shells
**Viewport:** `min-h-dvh` (not `100vh` — avoids mobile browser chrome issues)
**Navigation:** Fixed top header — all content must account for nav height offset

---

## Shadows (dark-mode adapted)

| Level | Value | Usage |
|-------|-------|-------|
| Subtle | `0 1px 3px rgba(0,0,0,0.4)` | Tight card lift |
| Card | `0 4px 12px rgba(0,0,0,0.5)` | Cards, buttons |
| Modal | `0 16px 40px rgba(0,0,0,0.7)` | Modals, drawers |

---

## Anti-Patterns (Do NOT Use)

- No emojis as icons — use Lucide React SVG icons only
- No light backgrounds anywhere — the app is always dark
- No hardcoded hex values in component files — use CSS custom properties
- No layout-shifting hover transforms — translateY only, never scale that shifts layout
- No instant state changes — always use transitions (150–300ms minimum)
- No invisible focus states — focus rings must be visible for keyboard users
- No placeholder text in screenshots — real content only at all times
- No complex onboarding or friction — open and practice immediately

---

## Pre-Delivery Checklist

Before delivering any UI code:

- [ ] All colors use `var(--*)` tokens — no hardcoded hex
- [ ] No emojis as icons (use Lucide React)
- [ ] `cursor-pointer` on all interactive elements
- [ ] Hover states with 150–300ms transitions
- [ ] Focus states visible (accent ring: `box-shadow: 0 0 0 3px rgba(99,102,241,0.3)`)
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbar (padding-top offset)
- [ ] No horizontal scroll on mobile
- [ ] Text contrast: `var(--text-primary)` on dark bg ≥ 4.5:1 ✓ (#f5f5f5 on #0a0a0a = 18.1:1)
- [ ] Secondary text: `var(--text-secondary)` on `var(--bg-card)` ≥ 3:1 ✓
- [ ] KaTeX: all math rendered via KaTeX, never plain text
- [ ] Supabase calls: fire-and-forget, never block UI
