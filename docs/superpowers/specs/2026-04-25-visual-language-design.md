# Visual Language — Direction E (Modern Clean)

**Date:** 2026-04-25
**Status:** Locked, deferred (user requested "save for later")
**Scope:** Sub-project 0 of the larger UI/UX overhaul — defines the new aesthetic vocabulary that all subsequent surface redesigns will reference.

## Summary

Replace Ascendly's current "premium AI" visual stack (glass cards + ambient blobs + neon glow + uniform Outfit + linear indigo gradients) with a clean, modern, study-app aesthetic in the family of **Quizlet, Knowt, Duolingo, and base44**. Indigo brand spine is retained — the generic-AI problem was *how* it was used (flat, alongside the standard effect stack), not the color itself. Differentiation comes from confident type, restrained effects, a visible Adi mascot, and one richer stimulus treatment.

## What We Tried, What We Rejected

The user evaluated three intermediate proposals before landing on Direction E:

- **Direction A (Editorial / Magazine)** — Instrument Serif + vermillion + drop caps + hairline rules → too expressive
- **Direction B (Tactile / Paper)** — Fraunces + cream paper cards + espresso bg + ochre → too expressive
- **Direction C (Engineered / Mono)** — JetBrains Mono display + acid yellow + corner brackets → outright rejected
- **Direction D (Saffron Clean)** — Geist + saffron `#e89c2c` single accent → right structure, wrong color (user has branded on indigo)
- **Direction E (Indigo Clean) — LOCKED**

Reference mockup files preserved at `.superpowers/brainstorm/1154-1777127941/content/`:
- `aesthetic-direction.html` — A vs B vs C type-specimen comparison
- `subject-hub-hybrid.html` — A+B blend on subject hub (rejected)
- `modern-clean-flow.html` — Direction D (saffron) on three surfaces (rejected on color)
- `indigo-clean-darklight.html` — **Direction E, the locked version**

## Typography

**Single family — `Geist`** (Geist Sans + Geist Mono, both free on Google Fonts).

| Role | Family | Weight | Notes |
|---|---|---|---|
| Hero display | Geist Sans | 800 | Subject titles, hero headlines |
| Section heading | Geist Sans | 700 | Page sections, card titles |
| Card title | Geist Sans | 600 | Mode card titles, item titles |
| Button label | Geist Sans | 600 | Primary CTAs |
| UI label | Geist Sans | 500 | Form labels, mode pills |
| Body | Geist Sans | 400 | Stimulus text, descriptions |
| Stimulus pull-quote | Geist Sans | 500 | First sentence of MCQ stimulus, larger size |
| Numerals (timer, %, dates) | Geist Mono | 400/500/600 | Tabular figures via `font-feature-settings: 'tnum'` |
| Hero numeral (projected score) | Geist Mono | 800 | The big "4" / "5" on the projected score card |

Outfit (current) is replaced. Self-host via `next/font/google` for both Geist Sans and Geist Mono.

## Color System

Indigo is brand. Adi purple is mascot. Pink appears only inside the hero gradient triple. No saffron, no vermillion, no editorial accents.

### Dark mode (primary)

| Token | Hex | Usage |
|---|---|---|
| `--bg-page` | `#0b0b13` | Page background (slight blue undertone, not espresso) |
| `--bg-elevated` | `#14141f` | Cards, panels |
| `--bg-elevated-hover` | `#1c1c2b` | Hover state on cards |
| `--border` | `rgba(255,255,255,0.06)` | Standard 1px card border |
| `--border-hover` | `rgba(99,102,241,0.4)` | Card border on hover |
| `--text-primary` | `#f5f5f8` | Headings, body |
| `--text-secondary` | `#a4a8b3` | Subtitles, descriptions |
| `--text-muted` | `#6b6f7a` | Hints, placeholders |
| `--accent` | `#6366f1` | Indigo — primary brand |
| `--accent-hover` | `#818cf8` | Button hover |
| `--accent-deep` | `#4f46e5` | Chunky press-down shadow on primary CTAs |
| `--adi-purple` | `#a855f7` | Adi mascot, special chat moments |
| `--accent-pink` | `#ec4899` | Hero gradient terminal stop only |
| `--success` | `#22c55e` | Correct answers, streaks |
| `--danger` | `#ef4444` | Wrong answers, errors |

### Light mode (sibling theme — revive `[data-theme="light"]`)

| Token | Hex |
|---|---|
| `--bg-page` | `#f7f7fb` |
| `--bg-elevated` | `#ffffff` |
| `--bg-elevated-hover` | `#f0f0f7` |
| `--border` | `rgba(15,23,42,0.08)` |
| `--border-hover` | `rgba(99,102,241,0.5)` |
| `--text-primary` | `#0f172a` |
| `--text-secondary` | `#475569` |
| `--text-muted` | `#94a3b8` |
| `--accent` | `#6366f1` *(same indigo)* |
| `--accent-hover` | `#4f46e5` |
| `--adi-purple` | `#9333ea` *(slightly darker for light bg)* |
| `--accent-pink` | `#db2777` |

CLAUDE.md must be updated: the line "Theme: Dark only — no light mode — ever" is reversed. Both modes are first-class. The current dead `[data-theme="light"]` block in `globals.css` is the starting point — refine its values to match the table above.

### Hero gradient (use sparingly — once per surface max)

```css
background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
```

Permitted uses: subject title underline, projected-score progress ring fill, one feature CTA on a hub. Never on body text, never on standard buttons, never as a card background.

## Surface Vocabulary

### Card (the canonical surface)

```css
background: var(--bg-elevated);
border: 1px solid var(--border);
border-radius: 16px;
padding: 24px;       /* 32px on hero/feature cards */
transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;

/* hover */
transform: translateY(-2px);
border-color: var(--border-hover);
box-shadow: 0 8px 24px rgba(0,0,0,0.4);   /* dark */
/*           0 8px 24px rgba(15,23,42,0.06); light */
```

**No glass blur. No neon glow. No ambient blob behind. No gradient border.** Subtle lift + soft shadow + indigo-tinted border on hover. That's the entire vocabulary.

### Primary CTA (Duolingo-style chunky press)

```css
background: var(--accent);
color: white;
font-weight: 600;
padding: 14px 28px;
border-radius: 12px;
box-shadow: 0 3px 0 var(--accent-deep);
transition: transform 100ms ease, box-shadow 100ms ease;

/* active */
transform: translateY(1px);
box-shadow: 0 2px 0 var(--accent-deep);
```

This is the one personality moment from the Duolingo reference — the button has 3px of "depth" that compresses to 2px on press. Used only on primary actions (Submit, Start, Continue).

### Secondary button

Transparent bg, 1px `var(--border)` border, hover bg `rgba(255,255,255,0.04)` (dark) / `rgba(15,23,42,0.04)` (light). No depth shadow.

### Score progress (replace conic-gradient)

The current `.score-ring` uses CSS `conic-gradient` to fake a progress arc. Replace with an SVG `<circle>` using `stroke-dasharray` for the fill, so the fill can use the indigo→purple→pink gradient via `<defs><linearGradient>` and animate properly via stroke-dashoffset. Conic gradients are killed.

## MCQ Stimulus — Richer Treatment

The stimulus card was the dullest moment in earlier mockups. Four upgrades, applied only to the stimulus surface:

1. **Source-strip header** — instead of a plain `STIMULUS · SOURCE` text label, render a flexbox row: 32×32 manuscript icon (line SVG, indigo-tinted bg) → author name (Geist 600, 14px) + work + date (Geist 400, 12px secondary) → far right `PRIMARY SOURCE` pill (mono 10px caps, light indigo bg, 1px indigo border, radius 999px).
2. **Pull-quote opening** — the first sentence of the stimulus renders at Geist 500, 17px, line-height 1.6. The remaining sentences drop to Geist 400, 15px, line-height 1.7. Creates a visual hook without going editorial.
3. **Subtle paper grain** — apply a tiny SVG noise data-URI as `background-image` at ~2.5% opacity. Stimulus card only — not other cards.
4. **Highlight affordance** — small floating pencil/highlighter icon at the bottom-right of the stimulus card. Functional study-app feature (highlight-as-you-read, persisted to localStorage). Position absolute inside the card.

Question stem and choice rows below the stimulus stay clean — hairline-separated rows with letter circles, indigo selected state.

## Adi as Visible Mascot

Currently Adi is a corner-bubble chatbot icon. In Direction E, Adi is pulled into product UI as a visible character, with three distinct product roles depending on surface:

| Surface | Adi role | Affordance |
|---|---|---|
| Subject hub | Contextual nudge | Floating diamond + speech bubble e.g. "Want to start with Unit 2?" |
| Drill card | Hint affordance | Smaller diamond + thinking-dots animation + "Stuck? I can hint." |
| MCQ | 50/50 helper | Diamond next to indigo pill button: "Hint: I'll narrow it to 2 choices" |
| Practice test | Off (no-help mode) | Hidden — practice test simulates exam conditions |
| Study guide | Context Q&A | Diamond + "Ask about this section" pill |
| FRQ | Rubric check | Diamond + "Walk me through this rubric" pill |
| Empty states | Encouragement | Larger diamond + custom copy ("First time here? Pick a unit and let's go.") |

Adi shape spec — preserved from current code:
- Rotated square (45deg) with a smaller rotated inner square in lighter purple
- Soft drop-shadow purple glow `filter: drop-shadow(0 0 12px rgba(168,85,247,0.4))`
- Sizes: 32px (inline pill), 40-44px (drill/MCQ in-flow), 56px (subject hub float), 80px+ (empty states/celebrations)
- Animation: existing `adiBob` 3.5s ease-in-out, `nudgeFade` for bubble entrance — both retained

## Effects Layer — What's Killed, What Stays

Earlier in the brainstorm the user said "premium effects are okay" but then pivoted to a clean Quizlet/Knowt/Duolingo direction that conflicts with heavy effects. Resolution:

**Killed:**
- `AmbientBlobs` component and the `blobFloat1`/`blobFloat2` keyframes
- Neon glow / `glowPulse` keyframe on cards and buttons
- `sparkDrift` particle system on hero
- `beamSweep` keyframe (gradient sweep on hero)
- Gradient-bordered cards
- Glass blur / backdrop-filter on cards (Adi panel header still uses backdrop-blur — that's product UI, allowed)
- Conic-gradient `.score-ring` (replaced with SVG circle + linearGradient)

**Kept:**
- Page transitions (`PageTransition` component — fade/slide between routes)
- Button hover lifts (`translateY(-1px)` with shadow change)
- `ScrollReveal` Intersection-Observer fade-ins on hero/sections
- Confetti on good scores (`canvas-confetti`)
- Counter roll-up on score numerals (existing animation)
- Streak flame (the static icon stays; the `flameFlicker` keyframe is killed — too cartoonish for clean-modern)
- `revealUp` / `revealPunch` / `fadeInUp` entrance animations
- Adi `adiBob` / `nudgeFade` (Adi has license to be playful — it's the mascot)

Keep only motion that *responds to user action*. Background ambient motion is killed.

## Per-Subject Differentiation

The earlier hybrid mockup gave each subject its own accent color (vermillion/ink-blue/sulfur). Quizlet/Knowt/Duolingo don't do this — they have one brand color across all content. Per-subject themes feel unprofessional at scale.

**Decision:** Single indigo accent across all 8 AP subjects. Per-subject differentiation is via:
- Subject-specific line icon in the hero (preserved from existing `SubjectIcon` Three.js setup, but simplified — the 3D rotation might be too much; evaluate during Sub-project 1)
- Subject-specific copy ("AP Calculus AB" hero, exam date, units)

Mastery bars, CTAs, progress rings all use indigo regardless of subject.

## What Gets Removed From Current Code

When implementing Sub-project 1+ surfaces, the following code is reduced or removed:

- `components/ui/AmbientBlobs.tsx` — delete
- `components/ui/CursorGlow.tsx` — evaluate; likely delete (cursor glow is a generic-AI move)
- `globals.css` keyframes: `blobFloat1`, `blobFloat2`, `sparkDrift`, `glowPulse`, `beamSweep`, `flameFlicker` — delete
- `globals.css` `.subject-card:hover` — replace with the new card vocabulary above (kill the `box-shadow: 0 0 15px rgba(99, 102, 241, 0.25), 0 0 40px rgba(99, 102, 241, 0.1)` glow stack)
- `globals.css` `.score-ring` conic-gradient — replace with SVG component
- `globals.css` `[data-theme="light"]` block — keep but refine values to match table above
- `app/layout.tsx` Outfit font — replace with Geist Sans + Geist Mono via `next/font/google`
- `MASTER.md` — rewrite; the current spec is largely obsolete
- `ModeCard.tsx` `colorMap` (cyan/green/violet/etc per-mode color) — collapse to single indigo accent

## Open Questions Deferred to Implementation Plans

- **Should `SubjectIcon` keep the Three.js 3D rotation?** The rotation is a "premium AI" move adjacent to glass cards. Evaluate against clean-modern feel during Sub-project 1.
- **Theme toggle UX** — where does the dark/light switch live? Header? Settings? Auto-follow OS preference with override?
- **Highlight affordance state model** — is highlighting persisted per stimulus to localStorage? Per-session-only? Cross-session?
- **Adi's "off" state on practice test** — does Adi disappear entirely or stay visible but disabled?
- **Empty-state copy** — Adi gets character moments; needs a writing pass to keep tone consistent.

## Sub-Projects Unlocked

With this language locked, the remaining sub-projects in the larger UI/UX overhaul can now be brainstormed and implemented:

1. **Marketing & discovery** — landing, subject hub, auth screens
2. **Core practice loop** — drill flow + MCQ flow + their results screens
3. **Long-form study surfaces** — study guide, practice test, FRQ, docs-cases
4. **Adi & tooling** — chatbot panel + reference modals + math/chem tools
5. **First-time user UX** — tooltip/coach-mark system, empty states, onboarding moments

Each gets its own brainstorm → spec → plan → implementation cycle, all referencing this document as the visual source of truth.
