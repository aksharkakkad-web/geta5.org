# UI Overhaul Design Spec

**Date:** 2026-03-30
**Scope:** Full visual redesign — every page, component, and interaction across geta5.app

---

## 1. Theme — Darker Base

**Current:** `#0a0a0a` background, `#111111` secondary, `#161616` cards
**New:**

| Token | Old | New | Rationale |
|-------|-----|-----|-----------|
| `--bg-primary` | `#0a0a0a` | `#050508` | Blue undertone pairs with indigo accent, makes glows pop |
| `--bg-secondary` | `#111111` | `#0a0a10` | Deeper, retains contrast with cards |
| `--bg-card` | `#161616` | `#0e0e16` | Slightly bluer, glass cards layer on top |
| `--bg-card-hover` | `#1c1c1c` | `#141420` | Maintains hover contrast |
| `--bg-border` | `#222222` | `#1a1a2e` | Blue-tinted borders blend with theme |

All other tokens (accent, success, warning, danger, text) remain unchanged.

---

## 2. Typography — Logo & Font

**Logo font:** Outfit (Google Fonts), weight 700/800
- Load via `next/font/google` for self-hosting
- Full logo: `geta5.app` — "geta" and ".app" in `#d4d4d4`, weight 700
- The "5": weight 800, ~20% larger font-size, `background: linear-gradient(135deg, #6366f1, #a78bfa)` with `-webkit-background-clip: text`
- Header logo size: 1.125rem base, "5" at ~1.35rem

**Body font:** Outfit replaces Inter for everything. Same type scale from MASTER.md, just swap the font family. Outfit is geometric and modern — matches the premium feel.

---

## 3. Header — Auto-Hide on Scroll

**Behavior:**
- Fixed header at top, 56px height
- `background: rgba(5, 5, 8, 0.85)` with `backdrop-filter: blur(12px)` (frosted glass)
- On scroll down >50px: header slides up out of view (`transform: translateY(-100%)`, 300ms ease)
- On scroll up: header slides back down
- On mouse entering top 20px zone: header slides back down regardless of scroll direction
- Transition: `transform 0.3s ease`

**Implementation:** Client component wrapping `<Header>`. Track `lastScrollY` via `useEffect` + scroll listener. Use `onMouseMove` on a transparent 20px-tall div fixed at top for the hover trigger.

---

## 4. Landing Page — Hero Animation

**Remove:** The subheading "No signup. No paywall. No ads. Just practice." — delete entirely.

**Hero text:** Single line: `AP exam prep. 100% free.`

**Animation sequence (on page load):**
1. **Words "AP", "exam", "prep." deblur and rise** — staggered 0.15s apart, starting at 0.3s delay. Each word: `opacity: 0 → 1`, `translateY(30px) → 0`, `filter: blur(8px) → 0`, duration 0.7s, `cubic-bezier(0.16, 1, 0.3, 1)`
2. **Brief pause** (~0.5s gap after "prep." lands)
3. **"100%" and "free." land with punch** — slightly bouncier ease (overshoot to -2px then settle), gradient fill via `background: linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)` with `-webkit-background-clip: text`
4. **Celebratory particles** — ~10 small dots (3-5px, indigo/violet/green mix) gently float upward and fade out over 1.4s. Not explosive — like embers drifting. Fire at ~1.55s (when "free." lands).
5. **Light beam sweep** — a 150px wide translucent indigo bar sweeps left to right across the text at 1.8s
6. **Gradient underline** — 140px wide, 3px tall, `linear-gradient(90deg, #6366f1, #a78bfa)`, grows from 0 width at 1.6s, `box-shadow: 0 0 8px rgba(99, 102, 241, 0.25)`

**Subject cards:** Stagger entrance after hero completes (~2.0s), each card fades in and rises with 0.1s delay between cards.

**Ambient blobs:** Two blurred gradient orbs (`filter: blur(80px)`) drift slowly behind the hero section. Indigo (~350px) top-left, violet (~250px) top-right. CSS keyframe float animation, 10-12s cycle.

---

## 5. Visual Effects System

### 5.1 Frosted Glass Cards
- `background: rgba(255, 255, 255, 0.03)`
- `backdrop-filter: blur(12px)`
- `border: 1px solid rgba(255, 255, 255, 0.06)`
- **Where:** Subject cards on landing, drill/MCQ card containers, overlays
- **Not on:** Mode cards (these get gradient borders instead), results screens

### 5.2 Neon Glow on Accents
- Primary CTA buttons: `box-shadow: 0 0 20px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.15)`
- Subtle pulse animation on CTAs (2s ease-in-out infinite)
- Success feedback: green glow radiates outward from correct answers
- Danger feedback: red glow on wrong answers
- **Where:** Buttons, active states, answer feedback

### 5.3 Ambient Gradient Blobs
- Blurred radial gradients, 200-350px diameter, `filter: blur(60-80px)`
- Float with CSS keyframe (8-12s cycle, small translate offsets)
- Colors: indigo, violet, subtle green
- **Where:** Landing hero, subject hub background, results screen
- **Not on:** Drill/MCQ active session (would distract from content)

### 5.4 Gradient Borders
- `::before` pseudo-element with `background: linear-gradient(135deg, #6366f1, #a78bfa, #22c55e, #6366f1)`, `background-size: 300% 300%`, animated shift (4s ease infinite)
- Inner `::after` pseudo covers the interior with card background color
- Visible on hover by default; always-on for featured/highlighted cards
- **Where:** Mode cards on subject hub, highlighted study guide sections

### 5.5 Deep Elevation Shadows
- Multi-layered: `box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.5)`
- **Where:** Drill cards, MCQ question cards, practice test timer
- **Not on:** Glass cards (glass + heavy shadow conflicts)

### 5.6 Particles (Hero Only)
- Landing page hero section only — celebratory float after headline animation
- CSS-only particles (divs with keyframe animations), no JS library needed
- 10-12 particles, 2-5px, indigo/violet/green
- `animation: sparkDrift 1.3-1.6s ease-out forwards`

### 5.7 Micro-Interactions
- **Hover lift:** `transform: translateY(-4px)`, `cubic-bezier(0.34, 1.56, 0.64, 1)` (bouncy)
- **Press squish:** `:active { transform: translateY(-2px) scale(0.98) }`
- **Cursor glow:** Radial gradient (`rgba(99, 102, 241, 0.08)`) follows mouse position via CSS custom properties (`--mouse-x`, `--mouse-y`), tracked with `onMouseMove`
- **Staggered entrance:** Elements animate in with incremental delay (0.08-0.1s per item)
- **Bouncy toggles:** `cubic-bezier(0.34, 1.56, 0.64, 1)` on toggle thumb
- **Where:** Every interactive element across all pages

### Effect Assignment Matrix

| Element | Glass | Glow | Blobs | Grad Border | Shadow | Particles | Micro |
|---------|-------|------|-------|-------------|--------|-----------|-------|
| Subject cards (landing) | Yes | — | — | — | — | — | Yes |
| Mode cards (subject hub) | — | — | — | Yes (hover) | — | — | Yes |
| Drill card | Yes | feedback | — | — | — | — | Yes |
| MCQ card | Yes | feedback | — | — | — | — | Yes |
| Study guide sections | — | — | — | — | Yes | — | Yes |
| Buttons (CTA) | — | Yes | — | — | — | — | Yes |
| Hero section | — | — | Yes | — | — | Yes | — |
| Results screen | — | Yes | Yes | — | — | confetti | Yes |
| Header | Yes | — | — | — | — | — | — |
| Practice test timer | — | Yes (low time) | — | — | Yes | — | — |

---

## 6. 3D Icons — Spline/Three.js

### Subject Icons (7 total)
Each subject gets a realistic 3D model rendered via Three.js with GLTF models or Spline embeds.

| Subject | 3D Object | Idle Animation | Hover | Click | Scroll |
|---------|-----------|----------------|-------|-------|--------|
| Psychology | Realistic brain | Gentle float + slow rotate | Pause float, tilt toward cursor, scale 1.1x | Pulse glow | Rotate speed increases with scroll velocity |
| World History | Globe | Slow spin on Y axis | Tilt toward cursor | Spin faster briefly | Spin speed tied to scroll delta |
| Government | Capitol building | Gentle float | Rotate to show 3D depth | — | Parallax vertical offset |
| Calculus AB | Integral ∫ symbol | Float + subtle wobble | Scale up, glow | — | Parallax offset |
| Precalculus | 3D graph/function curve | Gentle wave animation | Tilt with cursor | — | Wave amplitude tied to scroll |
| CSP | Terminal/monitor | Cursor blink on screen | Screen lights up brighter | Typing animation plays | — |
| Chemistry | Erlenmeyer flask with liquid | Gentle bubble animation | Bubbles speed up, liquid glows | **Eruption** — liquid overflows, bubbles burst upward, particles spray | Liquid level rises with scroll |

### Mode Icons (4 total)
Smaller 3D pill-shaped icons with white stroke symbols. Same float animation, glow on hover.

### Implementation
- **Approach:** `@react-three/fiber` + `@react-three/drei` for Three.js in React, OR Spline `@splinetool/react-spline` for Spline scenes
- **Loading:** Lazy-load 3D models with `React.lazy()` + `Suspense`. Show shimmer skeleton placeholder (same dimensions) while loading.
- **Performance:**
  - Use `<Canvas frameloop="demand">` to only render on interaction (not continuous)
  - `devicePixelRatio` capped at 2
  - Models should be low-poly with baked lighting (keep each under 200KB)
  - Disable 3D on devices with `prefers-reduced-motion`

### Decision needed before implementation:
Spline vs Three.js+GLTF. Spline is faster to design and iterate but heavier runtime (~500KB). Three.js+GLTF is lighter but needs sourcing/modeling of the 3D assets. **Recommend starting with Spline for speed, optimize later if bundle size is a concern.**

---

## 7. Page Transitions

**Mechanism:** CSS transitions on a wrapper component. Each page has an enter/exit animation.

**Exit:** Current page fades out and shifts up 15px over 300ms
**Enter:** New page fades in and rises from 20px below over 400ms, `cubic-bezier(0.16, 1, 0.3, 1)`
**Flash:** A subtle full-screen overlay (`rgba(99, 102, 241, 0.03)`) flashes for 150ms during the switch

**Card stagger on entry:** All cards/content blocks on the new page animate in with staggered delays (0.08s per item).

**Implementation:** Use Next.js `<ViewTransition>` component (Next.js 15+) or a custom `<PageTransition>` wrapper with `usePathname()` to detect route changes and trigger exit/enter animations via CSS classes.

---

## 8. Scroll-Based Enhancements

### 8.1 Scroll-Triggered Reveals
- Elements below the fold start invisible (`opacity: 0`, `translateY: 20px`)
- When they enter the viewport (Intersection Observer, threshold 0.1), they animate in
- Same ease as stagger entrance: `0.5s cubic-bezier(0.16, 1, 0.3, 1)`
- **Applies to:** Every section, card grid, and content block on every page

### 8.2 Parallax Layers
- Subject card art headers move at 0.3x scroll speed (slower than content)
- Ambient blobs move at 0.5x scroll speed
- 3D icons have subtle vertical offset tied to scroll position
- **Implementation:** CSS `transform: translateY(calc(var(--scroll-offset) * 0.3))` with scroll position tracked in a shared context/hook

### 8.3 Score Counter Roll-Up
- On results screens, numbers count up from 0 to final value
- Duration: 1.5s, eased
- Triggered when the score element enters viewport
- Use `requestAnimationFrame` loop with easing function

### 8.4 Progress-Linked Animations
- Mastery bars and score rings animate their fill when scrolled into view, not on mount
- Score ring: conic-gradient animates from 0deg to final value over 1s

---

## 9. Reward & Feedback Animations

### 9.1 Confetti on Good Scores
- Triggered on results screens when score >= 70%
- ~30-50 small colored particles (indigo, violet, green, amber) burst from top-center
- Fall with gravity + slight horizontal drift
- Duration: ~2s, fade out
- **Implementation:** Lightweight CSS-only confetti (absolute positioned divs with keyframe fall animations) or `canvas-confetti` library (~5KB)

### 9.2 Streak Flame Flicker
- The flame icon next to streak count gets a CSS flicker animation
- `animation: flameFlicker 0.8s ease-in-out infinite alternate`
- Subtle scale(0.95 → 1.05) and slight rotation(-2deg → 2deg)
- Orange glow: `filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))`

### 9.3 Correct Answer Pulse
- On correct drill/MCQ answer: green glow radiates outward from the card
- `box-shadow` transition from `0 0 0 rgba(34, 197, 94, 0)` to `0 0 30px rgba(34, 197, 94, 0.2)` and back
- Duration: 0.6s

### 9.4 Wrong Answer Shake
- On wrong answer: card does a horizontal shake (3 oscillations, ±4px)
- Red glow briefly appears
- Duration: 0.4s

---

## 10. Page-Specific Enhancements

### Landing Page
- Hero animation (Section 4)
- Ambient blobs behind hero
- Glass subject cards with stagger entrance
- Cursor glow on cards
- Parallax on card art headers
- Streak strip: flame flicker animation

### Subject Hub (`/[subject]`)
- 3D subject icon at top (large, interactive)
- Exam date countdown with subtle pulse
- Mode cards with gradient borders on hover, 3D mini icons
- Projected score badge with glow
- Ambient blobs (subject-tinted)

### Drills (`/[subject]/drills`)
- Glass card for drill question
- Shimmer progress bar with glow
- Correct/wrong answer pulse/shake feedback
- Smooth card transition between questions (fade out old, fade in new)
- Score ring animated fill on results

### Practice Questions (`/[subject]/practice`)
- Glass card for question + stimulus
- Neon glow on selected choice
- Smooth transitions between questions
- Per-choice explanation reveal animation (slide down)

### Study Guide (`/[subject]/study-guide`)
- Collapsible sections with smooth height animation
- Formula cards with deep shadows
- Key terms highlighted with subtle accent glow
- Scroll-triggered reveals for each section

### Practice Test (`/[subject]/practice-test`)
- Timer with neon glow that intensifies as time decreases
- Below 5 minutes: timer pulses red
- Smooth question navigation transitions
- Deep shadow on active question card

### Results (all modes)
- Animated score ring fill (triggered on viewport entry)
- Score number counter roll-up
- Confetti burst on good scores (>=70%)
- Stats stagger in below the score
- Ambient blobs in background

---

## 11. Performance Considerations

- **3D models:** Lazy-loaded, `demand` frame loop, max 200KB each, disabled on `prefers-reduced-motion`
- **Animations:** All CSS keyframe where possible (GPU-accelerated transforms/opacity). JS only for scroll tracking, cursor position, and counter roll-up.
- **Backdrop filter:** Only on visible elements. Use `will-change: transform` sparingly.
- **Intersection Observer:** Single shared observer for all scroll-triggered reveals
- **Font:** Outfit loaded via `next/font/google` — subset to latin, swap display
- **Bundle impact:** Spline runtime ~500KB (lazy-loaded), canvas-confetti ~5KB. No other new dependencies needed.

---

## 12. Files to Modify

| File | Change |
|------|--------|
| `app/globals.css` | Update color tokens, add keyframe animations, add utility classes |
| `app/layout.tsx` | Import Outfit font, swap Header for new auto-hide version |
| `app/page.tsx` | Hero animation, remove subheading, ambient blobs |
| `components/layout/Header.tsx` | Complete rewrite — auto-hide, glass blur, new logo |
| `components/ui/SubjectCard.tsx` | Glass card, 3D icon, cursor glow, stagger entrance |
| `components/ui/ModeCard.tsx` | Gradient border, 3D mini icon |
| `components/ui/StreakStrip.tsx` | Flame flicker animation |
| `app/[subject]/page.tsx` | 3D hero icon, ambient blobs, enhanced layout |
| `app/[subject]/drills/page.tsx` | Transition animations, shimmer progress |
| `app/[subject]/practice/page.tsx` | Glass cards, glow selections |
| `app/[subject]/study-guide/page.tsx` | Collapsible animations, deep shadows |
| `app/[subject]/practice-test/page.tsx` | Timer glow, question transitions |
| `components/drill/DrillResults.tsx` | Score ring animation, confetti, counter roll-up |
| `components/mcq/MCQResults.tsx` | Score ring animation, confetti, counter roll-up |
| **New:** `components/ui/PageTransition.tsx` | Page transition wrapper |
| **New:** `components/ui/ScrollReveal.tsx` | Intersection Observer reveal wrapper |
| **New:** `components/ui/CursorGlow.tsx` | Mouse-tracking glow effect |
| **New:** `components/3d/SubjectIcon.tsx` | 3D icon loader per subject |
| **New:** `components/3d/ModeIcon.tsx` | 3D mode icon |
| **New:** `hooks/useScrollDirection.ts` | Scroll direction + velocity tracking |
| **New:** `hooks/useParallax.ts` | Scroll-linked parallax offset |
| **New:** `hooks/useCountUp.ts` | Animated number counter |
