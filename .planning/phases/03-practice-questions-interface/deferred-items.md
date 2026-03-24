# Deferred Items — Phase 03 Plan 02

## Pre-existing TypeScript Errors (Out of Scope)

`components/ui/SubjectCard.tsx` has 5 TypeScript errors:
- Line 115: `Property 'accentColor' does not exist on type '{ gradient: string; emoji: string; }'`
- Line 116: `Property 'accentColor' does not exist on type '{ gradient: string; emoji: string; }'`
- Line 117: `Property 'accentColor' does not exist on type '{ gradient: string; emoji: string; }'`
- Line 123: `Property 'tag' does not exist on type '{ gradient: string; emoji: string; }'`
- Line 141: `Property 'accentColor' does not exist on type '{ gradient: string; emoji: string; }'`

These pre-existed before this plan and are unrelated to MCQ components. Should be addressed in a separate maintenance task.
