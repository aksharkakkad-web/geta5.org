# UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform geta5.app from a functional dark UI into a premium, animated experience with 3D icons, glass effects, scroll-triggered animations, and micro-interactions across every page.

**Architecture:** Four-wave approach — (1) foundation tokens, font, shared hooks, (2) header + landing page overhaul, (3) inner page enhancements, (4) advanced effects (page transitions, 3D icons, parallax). Each wave produces a working, committable state.

**Tech Stack:** Next.js 14, Tailwind v4 (CSS @theme), Outfit font (next/font/google), CSS keyframes for animations, Intersection Observer for scroll reveals, @react-three/fiber + @react-three/drei for 3D icons, canvas-confetti for score celebrations.

**Spec:** `docs/superpowers/specs/2026-03-30-ui-overhaul-design.md`

---

## Wave 1: Foundation & Shared Infrastructure

### Task 1: Update Theme Tokens & Load Outfit Font

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `design-system/ascendly/MASTER.md`

- [ ] **Step 1: Update color tokens in globals.css @theme block**

Replace the 5 background/border tokens with their new blue-tinted values:

```css
@theme {
  --color-bg-primary: #050508;
  --color-bg-secondary: #0a0a10;
  --color-bg-card: #0e0e16;
  --color-bg-card-hover: #141420;
  --color-bg-border: #1a1a2e;
  /* all other tokens unchanged */
}
```

Do the same for the `:root` block below it — keep both in sync.

- [ ] **Step 2: Update body/html background references**

In globals.css, the `html` and `body` rules already reference `var(--bg-primary)` — no change needed. Verify by reading.

- [ ] **Step 3: Add Outfit font via next/font/google in layout.tsx**

```tsx
import { Outfit } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
})
```

Apply to `<html>` tag: `className={outfit.variable}`.

Update `<body>` style to include `fontFamily: 'var(--font-outfit), -apple-system, BlinkMacSystemFont, sans-serif'`.

- [ ] **Step 4: Update font-family in globals.css**

Replace the existing `font-family` line in the `html` rule:

```css
html {
  font-family: var(--font-outfit), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 5: Update MASTER.md typography section**

Change the font reference from Inter to Outfit. Update the font-family code block. Add note about the `--font-outfit` CSS variable from next/font/google.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx design-system/ascendly/MASTER.md
git commit -m "feat: update theme to darker blue-tinted tokens + Outfit font"
```

---

### Task 2: Add Global CSS Keyframe Animations Library

**Files:**
- Modify: `app/globals.css`

Add all reusable keyframes and utility classes that other tasks depend on. Place after the existing scrollbar and score-ring styles.

- [ ] **Step 1: Add keyframe definitions**

Append to end of `globals.css`:

```css
/* ─── Animation keyframes ──────────────────────────────── */

/* Word/element reveal — deblur and rise */
@keyframes revealUp {
  from { opacity: 0; transform: translateY(20px); filter: blur(6px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* Punchy reveal — overshoot bounce */
@keyframes revealPunch {
  0% { opacity: 0; transform: translateY(30px) scale(0.95); filter: blur(8px); }
  70% { opacity: 1; transform: translateY(-2px) scale(1.02); filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

/* Stagger card entrance */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Ambient blob float */
@keyframes blobFloat1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 15px); }
}
@keyframes blobFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-15px, 20px); }
}

/* Gradient border shift */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Neon glow pulse */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.15); }
  50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.25); }
}

/* Light beam sweep */
@keyframes beamSweep {
  from { left: -150px; }
  to { left: calc(100% + 150px); }
}

/* Underline grow */
@keyframes underlineGrow {
  from { width: 0; }
  to { width: 140px; }
}

/* Celebratory spark drift (generic — overridden per particle with translate values) */
@keyframes sparkDrift {
  0% { opacity: 0.7; transform: translate(0, 0); }
  40% { opacity: 0.5; }
  100% { opacity: 0; transform: translate(var(--drift-x, -40px), var(--drift-y, -50px)); }
}

/* Flame flicker */
@keyframes flameFlicker {
  0% { transform: scale(0.95) rotate(-2deg); }
  100% { transform: scale(1.05) rotate(2deg); }
}

/* Correct answer pulse */
@keyframes correctPulse {
  0% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
  50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.2); }
  100% { box-shadow: 0 0 0 rgba(34, 197, 94, 0); }
}

/* Wrong answer shake */
@keyframes shakeX {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* Score ring fill — animated via CSS custom property */
@keyframes scoreRingFill {
  from { --score-deg: 0; }
}

/* Counter roll-up shimmer on progress bars */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}

/* 3D icon float */
@keyframes float3d {
  0%, 100% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
  25% { transform: translateY(-4px) rotateX(3deg) rotateY(-3deg); }
  50% { transform: translateY(-7px) rotateX(-2deg) rotateY(3deg); }
  75% { transform: translateY(-3px) rotateX(2deg) rotateY(-2deg); }
}

/* ─── Animation utility classes ────────────────────────── */

.animate-reveal-up {
  animation: revealUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Reduced motion — disable all custom animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify globals.css is valid**

Run: `npx next build --no-lint 2>&1 | head -20` — should not error on CSS.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add global CSS keyframe animations library"
```

---

### Task 3: Create Shared Hooks

**Files:**
- Create: `hooks/useScrollDirection.ts`
- Create: `hooks/useParallax.ts`
- Create: `hooks/useCountUp.ts`
- Create: `hooks/useInView.ts`

- [ ] **Step 1: Create hooks directory and useScrollDirection**

```ts
// hooks/useScrollDirection.ts
'use client'
import { useEffect, useRef, useState } from 'react'

type ScrollDir = 'up' | 'down' | null

export function useScrollDirection(threshold = 50) {
  const [direction, setDirection] = useState<ScrollDir>(null)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setIsAtTop(y < 10)
      if (Math.abs(y - lastY.current) < threshold) return
      setDirection(y > lastY.current ? 'down' : 'up')
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { direction, isAtTop }
}
```

- [ ] **Step 2: Create useInView hook**

```ts
// hooks/useInView.ts
'use client'
import { useEffect, useRef, useState } from 'react'

export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.1, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, inView }
}
```

- [ ] **Step 3: Create useParallax hook**

```ts
// hooks/useParallax.ts
'use client'
import { useEffect, useState } from 'react'

export function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * speed)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])

  return offset
}
```

- [ ] **Step 4: Create useCountUp hook**

```ts
// hooks/useCountUp.ts
'use client'
import { useEffect, useRef, useState } from 'react'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function useCountUp(target: number, duration = 1500, enabled = true) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(easeOutCubic(progress) * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled])

  return value
}
```

- [ ] **Step 5: Commit**

```bash
git add hooks/
git commit -m "feat: add shared hooks — useScrollDirection, useInView, useParallax, useCountUp"
```

---

### Task 4: Create ScrollReveal and CursorGlow Components

**Files:**
- Create: `components/ui/ScrollReveal.tsx`
- Create: `components/ui/CursorGlow.tsx`
- Create: `components/ui/AmbientBlobs.tsx`

- [ ] **Step 1: Create ScrollReveal wrapper**

```tsx
// components/ui/ScrollReveal.tsx
'use client'
import { useInView } from '@/hooks/useInView'
import type { CSSProperties, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  style?: CSSProperties
  className?: string
}

export function ScrollReveal({ children, delay = 0, style, className }: ScrollRevealProps) {
  const { ref, inView } = useInView()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create CursorGlow component**

```tsx
// components/ui/CursorGlow.tsx
'use client'
import { useCallback, type CSSProperties, type ReactNode } from 'react'

interface CursorGlowProps {
  children: ReactNode
  color?: string
  style?: CSSProperties
  className?: string
}

export function CursorGlow({ children, color = 'rgba(99,102,241,0.08)', style, className }: CursorGlowProps) {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--glow-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--glow-y', `${e.clientY - rect.top}px`)
  }, [])

  return (
    <div
      onMouseMove={handleMouseMove}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          top: 'var(--glow-y, 50%)',
          left: 'var(--glow-x, 50%)',
          transition: 'opacity 0.3s',
        }}
        onMouseEnter={undefined}
      />
      <style>{`
        div:hover > [aria-hidden] { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 3: Create AmbientBlobs component**

```tsx
// components/ui/AmbientBlobs.tsx
'use client'

interface AmbientBlobsProps {
  color1?: string
  color2?: string
  size1?: number
  size2?: number
}

export function AmbientBlobs({
  color1 = 'rgba(99,102,241,0.1)',
  color2 = 'rgba(139,92,246,0.07)',
  size1 = 350,
  size2 = 250,
}: AmbientBlobsProps) {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: `${size1}px`,
          height: `${size1}px`,
          background: `radial-gradient(circle, ${color1}, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
          top: '-120px',
          left: '-80px',
          pointerEvents: 'none',
          animation: 'blobFloat1 10s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: `${size2}px`,
          height: `${size2}px`,
          background: `radial-gradient(circle, ${color2}, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
          top: '-50px',
          right: '-40px',
          pointerEvents: 'none',
          animation: 'blobFloat2 12s ease-in-out infinite',
        }}
      />
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/ScrollReveal.tsx components/ui/CursorGlow.tsx components/ui/AmbientBlobs.tsx
git commit -m "feat: add ScrollReveal, CursorGlow, and AmbientBlobs components"
```

---

## Wave 2: Header & Landing Page

### Task 5: Rewrite Header with Auto-Hide + Glass Blur + New Logo

**Files:**
- Modify: `components/layout/Header.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Rewrite Header.tsx as a client component**

```tsx
// components/layout/Header.tsx
'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useScrollDirection } from '@/hooks/useScrollDirection'

export function Header() {
  const { direction, isAtTop } = useScrollDirection(50)
  const [hovered, setHovered] = useState(false)
  const visible = isAtTop || direction === 'up' || hovered

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setHovered(e.clientY < 20)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '24px',
      paddingRight: '24px',
      zIndex: 50,
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.3s ease',
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline' }}>
        <span style={{
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#d4d4d4',
          letterSpacing: '-0.02em',
        }}>
          geta
        </span>
        <span style={{
          fontWeight: 800,
          fontSize: '1.35rem',
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          5
        </span>
        <span style={{
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#d4d4d4',
          letterSpacing: '-0.02em',
        }}>
          .app
        </span>
      </Link>
    </header>
  )
}
```

- [ ] **Step 2: Verify layout.tsx still works**

The `<Header />` import path hasn't changed. Ensure `paddingTop: '56px'` on `<main>` is still present. Read `app/layout.tsx` to confirm.

- [ ] **Step 3: Test locally**

Run: `npm run dev` — scroll up/down on the page, verify header hides on scroll down, reappears on scroll up, and reappears when mouse hovers near top.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: rewrite header with auto-hide, glass blur, and gradient logo"
```

---

### Task 6: Landing Page Hero Animation

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx with hero animation + ambient blobs**

Replace the entire `HomePage` component. Key changes:
- Remove the subheading paragraph entirely
- Replace the `<h1>` with a client component for animation (`HeroText`)
- Add `AmbientBlobs` behind the hero
- Subject cards rendered inside `ScrollReveal` wrappers with stagger delays
- Remove the streak strip from between hero and grid (move after grid or keep as-is)

Create a `HeroText` client component inline or as a separate file. Inline is simpler since it's landing-page-specific:

```tsx
// app/page.tsx
import type { Metadata } from 'next'
import { getAllSubjects } from '@/utils/subjects'
import { SubjectCard } from '@/components/ui/SubjectCard'
import { StreakStrip } from '@/components/ui/StreakStrip'
import { HeroSection } from '@/components/landing/HeroSection'

export const metadata: Metadata = {
  title: 'geta5.app — 100% Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides for 7 AP subjects. No signup, no paywall, completely free.',
}

export default function HomePage() {
  const subjects = getAllSubjects()

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
      <HeroSection />

      <div
        className="subject-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '24px' }}
      >
        {subjects.map((subject, i) => (
          <SubjectCard key={subject.slug} name={subject.name} slug={subject.slug} index={i} />
        ))}
      </div>

      <div style={{ marginTop: '32px', paddingBottom: '48px' }}>
        <StreakStrip />
      </div>

      <div style={{ textAlign: 'center', paddingBottom: '24px' }}>
        <a href="/admin" style={{ color: 'var(--bg-border)', fontSize: '0.625rem', textDecoration: 'none' }}>admin</a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create HeroSection component**

```tsx
// components/landing/HeroSection.tsx
'use client'
import { AmbientBlobs } from '@/components/ui/AmbientBlobs'

export function HeroSection() {
  return (
    <div style={{ paddingTop: '48px', paddingBottom: '16px', position: 'relative', overflow: 'hidden' }}>
      <AmbientBlobs />

      {/* Hero text — staggered word reveal */}
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1.2,
        position: 'relative',
        zIndex: 2,
        overflow: 'hidden',
      }}>
        {['AP', 'exam', 'prep.'].map((word, i) => (
          <span
            key={word}
            style={{
              display: 'inline-block',
              opacity: 0,
              animation: `revealUp 0.7s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.15}s forwards`,
              color: 'var(--text-primary)',
            }}
          >
            {word}{' '}
          </span>
        ))}
        {'  '}
        {['100%', 'free.'].map((word, i) => (
          <span
            key={word}
            style={{
              display: 'inline-block',
              opacity: 0,
              animation: `revealPunch 0.65s cubic-bezier(0.16,1,0.3,1) ${1.1 + i * 0.15}s forwards`,
              background: 'linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {word}{i === 0 ? ' ' : ''}
          </span>
        ))}
      </h1>

      {/* Celebratory particles */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '200px', pointerEvents: 'none', zIndex: 3 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const colors = ['#6366f1', '#a78bfa', '#818cf8', '#22c55e']
          const dx = (Math.random() - 0.5) * 100
          const dy = -(30 + Math.random() * 50)
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${2 + Math.random() * 2}px`,
                height: `${2 + Math.random() * 2}px`,
                borderRadius: '50%',
                background: colors[i % colors.length],
                top: `${35 + Math.random() * 20}%`,
                left: `${5 + Math.random() * 35}%`,
                opacity: 0,
                '--drift-x': `${dx}px`,
                '--drift-y': `${dy}px`,
                animation: `sparkDrift ${1.3 + Math.random() * 0.3}s ease-out ${1.55 + i * 0.03}s forwards`,
              } as React.CSSProperties}
            />
          )
        })}
      </div>

      {/* Light beam sweep */}
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.06), transparent)',
        top: 0,
        left: '-150px',
        zIndex: 3,
        pointerEvents: 'none',
        animation: 'beamSweep 1.5s ease-in-out 1.8s forwards',
      }} />

      {/* Gradient underline */}
      <span style={{
        display: 'block',
        width: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #6366f1, #a78bfa, #6366f1)',
        marginTop: '12px',
        borderRadius: '2px',
        boxShadow: '0 0 8px rgba(99,102,241,0.25)',
        animation: 'underlineGrow 0.5s cubic-bezier(0.16,1,0.3,1) 1.6s forwards',
        position: 'relative',
        zIndex: 2,
      }} />
    </div>
  )
}
```

- [ ] **Step 3: Create the components/landing directory**

Run: `ls components/landing 2>/dev/null || echo "need to create"`

- [ ] **Step 4: Test locally — verify hero animation plays on page load**

Run: `npm run dev` — open localhost:3000, watch the word stagger, particle drift, beam sweep, underline grow.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/landing/HeroSection.tsx
git commit -m "feat: landing page hero with staggered animation, particles, and ambient blobs"
```

---

### Task 7: Upgrade SubjectCard with Glass Effect + Stagger + Cursor Glow

**Files:**
- Modify: `components/ui/SubjectCard.tsx`

- [ ] **Step 1: Add index prop and rewrite with glass + stagger + cursor glow**

Add `index` prop for stagger delay. Replace opaque `backgroundColor` with glass effect. Add cursor glow via inline `onMouseMove`. Add stagger entrance animation.

Key changes to SubjectCard:
- Props: add `index: number`
- Card wrapper: `background: rgba(255,255,255,0.03)`, `backdropFilter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.06)`
- Add `opacity: 0`, `animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards`, `animationDelay: ${2.0 + index * 0.1}s`
- Hover: keep existing `subject-card:hover` CSS but update border color to `rgba(99,102,241,0.25)`
- Add `onMouseMove` handler that sets `--mouse-x` and `--mouse-y` CSS properties
- Add a `::after`-equivalent div for the cursor glow radial gradient
- Keep existing gradient art headers and emoji pills (these will be replaced by 3D icons in Wave 4, Task 15)

- [ ] **Step 2: Update SubjectCard hover styles in globals.css**

Replace the existing `.subject-card:hover` rule:

```css
.subject-card:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.25);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 3: Test hover effects and stagger timing**

Run dev server, verify cards stagger in after hero, cursor glow follows mouse.

- [ ] **Step 4: Commit**

```bash
git add components/ui/SubjectCard.tsx app/globals.css
git commit -m "feat: glass subject cards with stagger entrance and cursor glow"
```

---

### Task 8: Upgrade StreakStrip with Flame Flicker

**Files:**
- Modify: `components/ui/StreakStrip.tsx`

- [ ] **Step 1: Add flame flicker animation to the Flame icon**

Wrap the `<Flame>` icon in a span with the flameFlicker animation:

```tsx
<span style={{
  display: 'inline-flex',
  animation: 'flameFlicker 0.8s ease-in-out infinite alternate',
  filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))',
}}>
  <Flame size={14} color="var(--accent-warning)" />
</span>
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/StreakStrip.tsx
git commit -m "feat: add flame flicker animation to streak counter"
```

---

## Wave 3: Inner Page Enhancements

### Task 9: Mode Cards with Gradient Borders

**Files:**
- Modify: `components/ui/ModeCard.tsx`

- [ ] **Step 1: Rewrite ModeCard with gradient border on hover + micro-interactions**

Key changes:
- Replace the static border with a gradient border using the `::before`/`::after` pseudo-element pattern. Since we're using inline styles, implement with a wrapper div for the gradient border.
- Outer div: `position: relative`, holds the gradient border div (absolutely positioned, `inset: -1px`, `borderRadius: 17px`, gradient background, `opacity: 0` → `1` on hover)
- Inner div: `position: relative`, card background color, `borderRadius: 16px`, `zIndex: 1`
- Add hover lift: `transform: translateY(-4px)` with bouncy ease
- Add press squish: `:active` → `scale(0.98)` (via `onMouseDown`/`onMouseUp` state)
- Keep existing icon mapping but make icons glow on hover with `filter: drop-shadow()`

- [ ] **Step 2: Test on subject hub page**

Navigate to any subject page, verify gradient borders animate on hover, cards lift, and press effect works.

- [ ] **Step 3: Commit**

```bash
git add components/ui/ModeCard.tsx
git commit -m "feat: mode cards with animated gradient borders and micro-interactions"
```

---

### Task 10: Subject Hub Page Enhancements

**Files:**
- Modify: `app/[subject]/page.tsx`

- [ ] **Step 1: Add ambient blobs and scroll reveals**

Wrap the page content in a `position: relative` container. Add `<AmbientBlobs>` at top. Wrap mode card grid in `<ScrollReveal>`. Import and use `ScrollReveal` on the projected score badge.

- [ ] **Step 2: Animate mastery bars on scroll into view**

In `components/ui/MasteryBar.tsx`, wrap the fill bar with `useInView` — start at `width: 0` and transition to actual width when visible. Add the shimmer gradient effect to the fill.

- [ ] **Step 3: Enhance projected score badge with glow**

In `app/[subject]/page.tsx`, add a wrapper around `<ProjectedScoreBadge>` with a subtle accent glow:

```tsx
<div style={{
  marginTop: '12px',
  marginBottom: '32px',
}}>
  <ScrollReveal delay={0.1}>
    <ProjectedScoreBadge subject={subject.slug} />
  </ScrollReveal>
</div>
```

- [ ] **Step 4: Stagger mode cards entrance**

Wrap each `<ModeCard>` in `<ScrollReveal delay={0.1 * i}>`.

- [ ] **Step 5: Commit**

```bash
git add app/[subject]/page.tsx components/ui/MasteryBar.tsx
git commit -m "feat: subject hub with ambient blobs, mastery bar animations, and scroll reveals"
```

---

### Task 11: Drill Session & Results Enhancements

**Files:**
- Modify: `components/drill/DrillSession.tsx`
- Modify: `components/drill/DrillResults.tsx`
- Modify: `components/drill/DrillCard.tsx`

- [ ] **Step 1: Add answer feedback animations to DrillCard**

After the user submits an answer, add a CSS class for correct (green pulse) or wrong (shake + red glow). Use a state variable `feedbackClass` that gets set on answer submit and cleared after 600ms.

Add to the card wrapper div:
- Correct: `animation: correctPulse 0.6s ease`
- Wrong: `animation: shakeX 0.4s ease`

- [ ] **Step 2: Add shimmer to progress bar in DrillSession**

The progress indicator (correct/wrong count in header) — add a shimmer effect to the progress display using the `shimmer` keyframe on a gradient background.

- [ ] **Step 3: Enhance DrillResults with animated score ring + counter roll-up**

In DrillResults, replace the instant score display with:
- Score ring: add `animation: scoreRingFill 1s ease forwards` to animate `--score-deg` from 0 to final value. Trigger via `useInView`.
- Score text: use `useCountUp(percentage, 1500, inView)` for the number
- Wrap stats in `<ScrollReveal>` with stagger

- [ ] **Step 4: Add confetti on good scores**

Install canvas-confetti: `npm install canvas-confetti` and `npm install -D @types/canvas-confetti`

Add `<AmbientBlobs />` to the DrillResults wrapper for background atmosphere on the results screen.

In DrillResults, if percentage >= 70, fire confetti on mount:

```tsx
import confetti from 'canvas-confetti'

useEffect(() => {
  if (percentage >= 70) {
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#6366f1', '#a78bfa', '#22c55e', '#f59e0b'],
    })
  }
}, [])
```

- [ ] **Step 5: Commit**

```bash
git add components/drill/ package.json package-lock.json
git commit -m "feat: drill answer feedback animations, score ring fill, and confetti"
```

---

### Task 12: MCQ Session & Results Enhancements

**Files:**
- Modify: `components/mcq/MCQCard.tsx`
- Modify: `components/mcq/MCQResults.tsx`
- Modify: `components/mcq/MCQSession.tsx`

- [ ] **Step 1: Add neon glow on selected MCQ choice**

In MCQCard, when a choice is selected (before submit), add `box-shadow: 0 0 15px rgba(99,102,241,0.2)` and `border-color: rgba(99,102,241,0.3)` to the selected choice div.

- [ ] **Step 2: Add correct/wrong feedback to MCQCard**

After submit, correct choice gets green glow pulse. Wrong selected choice gets red glow + shake. Same pattern as DrillCard in Task 11.

- [ ] **Step 3: Add smooth question transitions in MCQSession**

Wrap the MCQCard in a div with a fade transition. On question change, set `opacity: 0, transform: translateY(10px)`, then after 150ms set the new question and animate back to `opacity: 1, transform: translateY(0)`.

- [ ] **Step 4: Enhance MCQResults same as DrillResults**

Same pattern as Task 11 Step 3-4: animated score ring via `useInView` + `useCountUp`, confetti on good scores, staggered stat reveals.

- [ ] **Step 5: Commit**

```bash
git add components/mcq/
git commit -m "feat: MCQ glow selections, answer feedback, transitions, and results animations"
```

---

### Task 13: Study Guide Enhancements

**Files:**
- Modify: `components/study-guide/StudyGuideReader.tsx`
- Modify: `components/study-guide/sections/CoreConceptsSection.tsx`
- Modify: `components/study-guide/sections/FormulasSection.tsx`
- Modify: `components/study-guide/sections/KeyTermsSection.tsx`
- Modify: `components/study-guide/sections/ThemeSection.tsx`
- Modify: `components/study-guide/sections/ExamTipSection.tsx`

- [ ] **Step 1: Wrap each section component in ScrollReveal**

In StudyGuideReader, wrap each section render in `<ScrollReveal delay={i * 0.1}>`.

- [ ] **Step 2: Add deep shadows to formula cards**

In FormulasSection, add to each formula card:
```
boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.5)'
```

- [ ] **Step 3: Add smooth height animation to collapsible sections**

In StudyGuideReader, if sections expand/collapse, add `transition: max-height 0.4s ease, opacity 0.3s ease` to the section content wrapper. Set `overflow: hidden`, `max-height: 0` when collapsed, `max-height: 2000px` when expanded.

- [ ] **Step 4: Add accent glow highlight to key terms**

In KeyTermsSection, add a subtle `box-shadow: inset 0 -2px 0 rgba(99,102,241,0.3)` underline effect to key term text.

- [ ] **Step 5: Commit**

```bash
git add components/study-guide/
git commit -m "feat: study guide scroll reveals, collapsible sections, formula shadows, key term highlights"
```

---

### Task 14: Practice Test Timer Glow + Transitions

**Files:**
- Modify: `components/test/TestTimer.tsx`
- Modify: `components/test/TestSession.tsx`
- Modify: `components/test/TestResults.tsx`

- [ ] **Step 1: Add neon glow to TestTimer that intensifies as time decreases**

Read TestTimer.tsx first. Add dynamic box-shadow based on remaining time:
- Above 5 min: subtle indigo glow `0 0 10px rgba(99,102,241,0.15)`
- Below 5 min: pulsing red glow `animation: glowPulse` but with danger color
- Below 1 min: faster pulse, brighter

- [ ] **Step 2: Add deep shadow to active question card in TestSession**

Add to the test question card container:
```
boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.5)'
```

- [ ] **Step 3: Enhance TestResults with score ring animation + confetti**

Same pattern as Task 11/12: animated score ring, counter roll-up, confetti on good scores.

- [ ] **Step 4: Commit**

```bash
git add components/test/
git commit -m "feat: practice test timer glow, question shadows, and results animations"
```

---

## Wave 4: Advanced Effects

### Task 15: Page Transitions

**Files:**
- Create: `components/ui/PageTransition.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create PageTransition wrapper**

```tsx
// components/ui/PageTransition.tsx
'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, type ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter')
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      setTransitionStage('exit')
      const timeout = setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage('enter')
        prevPathname.current = pathname
      }, 300)
      return () => clearTimeout(timeout)
    } else {
      setDisplayChildren(children)
    }
  }, [pathname, children])

  return (
    <div style={{
      opacity: transitionStage === 'enter' ? 1 : 0,
      transform: transitionStage === 'enter' ? 'translateY(0)' : 'translateY(-15px)',
      transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {displayChildren}
    </div>
  )
}
```

- [ ] **Step 2: Wrap children in layout.tsx with PageTransition**

In `app/layout.tsx`, wrap `{children}` inside `<main>` with `<PageTransition>`:

```tsx
<main style={{ paddingTop: '56px' }}>
  <PageTransition>{children}</PageTransition>
</main>
```

- [ ] **Step 3: Test navigation between pages**

Click through landing → subject → drills → back. Verify smooth fade transitions.

- [ ] **Step 4: Commit**

```bash
git add components/ui/PageTransition.tsx app/layout.tsx
git commit -m "feat: add page transition wrapper with fade enter/exit"
```

---

### Task 16: Parallax on Subject Card Art Headers

**Files:**
- Modify: `components/ui/SubjectCard.tsx`

- [ ] **Step 1: Add parallax to card art header**

Import `useParallax` in SubjectCard. Apply a `transform: translateY(${offset}px)` to the art header div, where offset is from `useParallax(0.3)`. Since SubjectCard is already a client component (for cursor glow), this just adds the hook.

The art header div gets `overflow: hidden` on the parent and `transform: translateY(${-offset * 0.15}px)` on the gradient div (subtle — moves slower than scroll).

- [ ] **Step 2: Test scrolling on landing page**

Verify card art headers move slightly slower than card body text when scrolling.

- [ ] **Step 3: Commit**

```bash
git add components/ui/SubjectCard.tsx
git commit -m "feat: add parallax to subject card art headers"
```

---

### Task 17: Install 3D Dependencies and Create Icon Loader

**Files:**
- Modify: `package.json`
- Create: `components/3d/SubjectIcon.tsx`
- Create: `components/3d/ModeIcon.tsx`

- [ ] **Step 1: Install Three.js dependencies**

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

- [ ] **Step 2: Create SubjectIcon loader component**

This is a lazy-loaded wrapper that renders a 3D scene per subject. For initial implementation, create CSS 3D placeholder shapes (spheres, cubes with gradients) — Spline models or GLTF assets will replace these in a follow-up.

```tsx
// components/3d/SubjectIcon.tsx
'use client'
import { Suspense, lazy } from 'react'

const Scene = lazy(() => import('./SubjectScene'))

interface SubjectIconProps {
  subject: string
  size?: number
}

function IconSkeleton({ size = 56 }: { size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
      animation: 'shimmer 1.5s ease-in-out infinite',
      backgroundSize: '200% 100%',
    }} />
  )
}

export function SubjectIcon({ subject, size = 56 }: SubjectIconProps) {
  return (
    <Suspense fallback={<IconSkeleton size={size} />}>
      <Scene subject={subject} size={size} />
    </Suspense>
  )
}
```

- [ ] **Step 3: Create SubjectScene with basic Three.js shapes**

```tsx
// components/3d/SubjectScene.tsx
'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Mesh } from 'three'

const SUBJECT_COLORS: Record<string, string> = {
  'ap-psychology': '#8b5cf6',
  'ap-world-history': '#f59e0b',
  'ap-government': '#38bdf8',
  'ap-calculus-ab': '#14b8a6',
  'ap-precalculus': '#6366f1',
  'ap-computer-science-principles': '#22c55e',
  'ap-chemistry': '#f97316',
}

function FloatingShape({ color }: { color: string }) {
  const ref = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * (hovered ? 0.8 : 0.3)
    ref.current.position.y = Math.sin(Date.now() * 0.001) * 0.15
  })

  return (
    <mesh
      ref={ref}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <icosahedronGeometry args={[0.8, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.3 : 0.1}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  )
}

export default function SubjectScene({ subject, size }: { subject: string; size: number }) {
  const color = SUBJECT_COLORS[subject] || '#6366f1'

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <FloatingShape color={color} />
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 4: Create ModeIcon component**

```tsx
// components/3d/ModeIcon.tsx
'use client'

interface ModeIconProps {
  iconName: 'drills' | 'practice' | 'study-guide' | 'test'
  color: string
  size?: number
}

const ICON_PATHS: Record<string, string> = {
  drills: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  practice: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
  'study-guide': 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z',
  test: '',
}

export function ModeIcon({ iconName, color, size = 36 }: ModeIconProps) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: `${size * 0.28}px`,
      background: `linear-gradient(135deg, ${color}88, ${color})`,
      boxShadow: `0 3px 10px ${color}44, inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.1)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'float3d 3s ease-in-out infinite',
      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>
        {iconName === 'test' ? (
          <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>
        ) : iconName === 'study-guide' ? (
          <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>
        ) : iconName === 'practice' ? (
          <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/></>
        ) : (
          <path d={ICON_PATHS[iconName]} />
        )}
      </svg>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json components/3d/
git commit -m "feat: add Three.js 3D icon loader and mode icon components"
```

---

### Task 18: Integrate 3D Icons into Subject and Mode Cards

**Files:**
- Modify: `components/ui/SubjectCard.tsx`
- Modify: `components/ui/ModeCard.tsx`

- [ ] **Step 1: Replace emoji pill in SubjectCard with SubjectIcon**

In SubjectCard, replace the emoji `<div>` inside the art header with `<SubjectIcon subject={slug} size={48} />`. Remove the background emoji decoration div as well.

Keep the gradient art header background — the 3D icon floats on top of it.

- [ ] **Step 2: Replace icon in ModeCard with ModeIcon**

In ModeCard, replace the lucide icon render with `<ModeIcon iconName={iconName} color={colorMap[colorKey]} />`.

- [ ] **Step 3: Test both card types**

Verify 3D shapes render in subject cards and 3D pill icons render in mode cards. Check loading skeleton appears briefly.

- [ ] **Step 4: Commit**

```bash
git add components/ui/SubjectCard.tsx components/ui/ModeCard.tsx
git commit -m "feat: integrate 3D icons into subject and mode cards"
```

---

### Task 19: Final Polish — Update Design System Docs

**Files:**
- Modify: `design-system/ascendly/MASTER.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update MASTER.md with new color palette, effects, and animation specs**

Update the Color Palette table with new hex values. Add a new "Animations" section documenting the keyframe library and utility classes. Add a new "Effects" section documenting glass, glow, gradient border patterns.

- [ ] **Step 2: Update CLAUDE.md decisions log**

Add entry:
```
- 2026-03-30: UI overhaul — darker #050508 base, Outfit font, auto-hide header, 7-effect visual system (glass, glow, blobs, gradient borders, shadows, particles, micro-interactions), 3D icons via Three.js, page transitions, scroll-triggered reveals, parallax
```

- [ ] **Step 3: Commit**

```bash
git add design-system/ascendly/MASTER.md CLAUDE.md
git commit -m "docs: update design system and decisions log for UI overhaul"
```
