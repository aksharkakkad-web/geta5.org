# Phase 3: Practice Questions Interface - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 03-practice-questions-interface
**Areas discussed:** Stimulus rendering, Question flow, Feedback presentation, Session sizing
**Mode:** Auto (--auto flag)

---

## Stimulus Rendering

| Option | Description | Selected |
|--------|-------------|----------|
| Inline above question | Each stimulus type renders in its own component above the question text | [auto] |
| Collapsible panel | Stimulus in expandable section, collapsed by default | |
| Side-by-side | Stimulus left, question right on desktop | |

**User's choice:** [auto] Inline above question (recommended default)
**Notes:** Matches natural reading flow — stimulus first, then question. Simple responsive behavior (stacks vertically on mobile).

---

## Question Flow

| Option | Description | Selected |
|--------|-------------|----------|
| One at a time | Single question displayed, matches drill pattern | [auto] |
| Scrollable list | All questions visible, scroll to answer | |
| Paginated groups | Groups of 5-10 questions per page | |

**User's choice:** [auto] One at a time (recommended default)
**Notes:** Consistent with drill session UX. Progress bar in header shows advancement.

---

## Feedback Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Inline under each choice | All 4 explanations shown directly under their respective choices | [auto] |
| Modal/overlay | Explanation appears in a centered modal after submit | |
| Bottom panel | Explanations in a panel below all choices | |

**User's choice:** [auto] Inline under each choice (recommended default)
**Notes:** Students see exactly why each choice is right or wrong in context. No extra click to dismiss.

---

## Session Sizing

| Option | Description | Selected |
|--------|-------------|----------|
| All questions in unit | Load and shuffle all MCQs for selected unit | [auto] |
| Fixed count (e.g. 20) | Random subset of N questions per session | |
| Adaptive batch | Size based on available time or mastery level | |

**User's choice:** [auto] All questions in unit (recommended default)
**Notes:** Matches drill behavior. "Study All" aggregates across units.

---

## Claude's Discretion

- Auto-submit vs explicit submit button for answer choices
- Stimulus block visual details (padding, max-height, scroll)
- Chart.js dark theme color mapping
- Pseudocode styling approach
- Whether to reuse drill UnitSelector or create MCQ-specific variant

## Deferred Ideas

- Adaptive difficulty — Phase 13
- Question filtering by difficulty — out of scope
- Bookmarking/flagging — not in v1
- Timed mode — Phase 5
