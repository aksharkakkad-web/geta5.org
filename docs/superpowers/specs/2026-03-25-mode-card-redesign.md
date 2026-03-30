# Mode Card Redesign — Design Spec
**Date:** 2026-03-25
**Status:** Approved

## Goal
Make the subject page mode-selection grid visually distinctive — each mode has its own color identity, cards have depth and hover life, without adding any new content or complexity.

## Scope
- `components/ui/ModeCard.tsx` — primary change
- `app/[subject]/page.tsx` — pass `colorKey` prop per mode, no other changes

## Color Identity Per Mode

| Mode | `colorKey` | Hex | RGB triplet |
|---|---|---|---|
| Drills | `'indigo'` | `#6366f1` | `99, 102, 241` |
| Practice Questions | `'cyan'` | `#06b6d4` | `6, 182, 212` |
| Study Guide | `'green'` | `#10b981` | `16, 185, 129` |
| Practice Test | `'amber'` | `#f59e0b` | `245, 158, 11` |

**TypeScript prop type:** `colorKey: 'indigo' | 'cyan' | 'green' | 'amber'`

**Mapping in `app/[subject]/page.tsx` modes array:**
```ts
{ title: 'Drills',              colorKey: 'indigo', ... }
{ title: 'Practice Questions',  colorKey: 'cyan',   ... }
{ title: 'Study Guide',         colorKey: 'green',  ... }
{ title: 'Practice Test',       colorKey: 'amber',  ... }
```

## Color Map (in ModeCard.tsx)

Define once at the top of the file. These are component-specific design constants — not universal design tokens — so a `colorMap` object in the component file is the correct pattern. The global design system tokens cover universal values (bg, text, accent); per-mode identity colors are scoped to this component only.

```ts
const colorMap = {
  indigo: { hex: '#6366f1', rgb: '99, 102, 241',   grad: 'linear-gradient(145deg, #1a1a2e 0%, #16161f 100%)' },
  cyan:   { hex: '#06b6d4', rgb: '6, 182, 212',    grad: 'linear-gradient(145deg, #0e1e2b 0%, #121820 100%)' },
  green:  { hex: '#10b981', rgb: '16, 185, 129',   grad: 'linear-gradient(145deg, #0e1e18 0%, #121a16 100%)' },
  amber:  { hex: '#f59e0b', rgb: '245, 158, 11',   grad: 'linear-gradient(145deg, #1e1a0e 0%, #1a1612 100%)' },
}
```

## Card Visual Design

**Background:** `colorMap[colorKey].grad` — very dark tinted gradient, barely-there color wash

**Border at rest:** `1px solid rgba(${colorMap[colorKey].rgb}, 0.20)`
**Border on hover:** `1px solid rgba(${colorMap[colorKey].rgb}, 0.50)`

**Box shadow at rest:** `none`
**Box shadow on hover:** `0 4px 20px rgba(${colorMap[colorKey].rgb}, 0.12)`

**Transform on hover:** `translateY(-2px)` — lift effect
**Transition:** `border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease`

**Icon:** 28px (up from 24px), `color: colorMap[colorKey].hex`

**Card title:** Keep `fontSize: '1rem'` — intentional deviation from H3 spec (1.25rem). These are compact navigation cards, not content headings. The smaller size keeps the 2-column grid tight on mobile.

**Content:** Icon → Title → Description. No new elements.

## Hover State Implementation

The component uses inline styles which cannot express CSS `:hover`. Use `useState` + `onMouseEnter`/`onMouseLeave`:

```tsx
const [hovered, setHovered] = useState(false)
// ...
<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{
    border: hovered ? `1px solid rgba(${c.rgb}, 0.50)` : `1px solid rgba(${c.rgb}, 0.20)`,
    boxShadow: hovered ? `0 4px 20px rgba(${c.rgb}, 0.12)` : 'none',
    transform: hovered && !reducedMotion ? 'translateY(-2px)' : 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
  }}
>
```

## prefers-reduced-motion

Read once at component mount using `window.matchMedia`:

```tsx
const [reducedMotion, setReducedMotion] = useState(false)
useEffect(() => {
  setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}, [])
```

When `reducedMotion` is true: omit `translateY` from transform. Border and shadow transitions are cosmetic-only and can remain.

## Acceptance Criteria
- [ ] Each card has a unique tinted gradient background matching its colorKey
- [ ] Border uses mode RGB at ~20% opacity at rest, brightens to ~50% on hover
- [ ] Hover adds translateY(-2px) lift + faint glow shadow
- [ ] Icon is 28px and colored to match mode
- [ ] No new content elements added
- [ ] colorMap object defined once at top of ModeCard.tsx — no hex scattered in JSX
- [ ] prefers-reduced-motion disables translateY
- [ ] Mobile: 2-column grid unchanged, readable at 375px
- [ ] TypeScript: colorKey prop typed as string literal union
