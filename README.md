# geta5.org

100% free AP exam prep. No signup. No paywall. No ads.

**Live:** [geta5.org](https://geta5.org)

## What is this?

A web app that helps high school students prepare for AP exams with drills, multiple-choice practice, study guides, and full-length practice tests. Everything is free and works instantly -- no account needed.

## Subjects

- AP Psychology (5 units)
- AP World History (9 units)
- AP US Government (5 units)
- AP Calculus AB (8 units)
- AP Precalculus (4 units)
- AP Computer Science Principles (5 units)
- AP Chemistry (9 units)

## Features

**Drills** -- Flashcard-style typed recall. Key terms, formulas, historical figures, court cases. Wrong answers get re-queued 5 cards later.

**Practice Questions** -- AP-format multiple choice with per-choice explanations, stimuli (passages, tables, charts, code), and difficulty levels.

**Study Guides** -- Unit-by-unit review with core concepts, key terms, formulas, and exam tips.

**Practice Tests** -- Full-length timed tests with score projection (1-5), question flagging, and navigation grid.

**Session Persistence** -- Leave mid-session, come back later. Drills, MCQs, and practice tests auto-save to localStorage.

**Progress Tracking** -- Per-unit mastery, accuracy tracking, streak counter. All stored locally.

## Tech Stack

- **Framework:** Next.js 14, App Router, TypeScript
- **Styling:** Tailwind CSS v4 (dark theme, CSS custom properties)
- **Math:** KaTeX for all formula rendering
- **Charts:** Chart.js for stimulus graphs and admin dashboard
- **Storage:** localStorage (no user accounts)
- **Analytics:** Supabase (anonymous events only)
- **Deployment:** Vercel

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_ANON_KEY=your_anon_key
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

## Content

All content lives in `public/data/[subject]/` as JSON files:

```
public/data/ap-psychology/
  meta.json          # unit names, exam date, weights
  drills/unit-1.json # flashcard-style drill cards
  mcq/unit-1.json    # multiple choice questions
  study-guide/unit-1.json # study guide sections
```

Content was generated using a multi-agent pipeline (Researcher -> Planner -> Writer -> Reviewer) and verified with Opus-level review across all 7 subjects.

## License

MIT
