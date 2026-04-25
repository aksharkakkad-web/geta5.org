# Matching Round Improvements — Design Spec
Date: 2026-04-24

## Problem
Two bugs in the current drill matching round system:

1. **All in a row** — `computeStylePlan` flushes consecutive vocab cards into matching groups sequentially. 20 vocab cards before the first `concept_mc` becomes 5 consecutive matching rounds. The deck order is never changed, so anchors land at positions 0, 4, 8, 12, 16.

2. **Too obvious** — Groups are formed from whichever 4 cards happen to be consecutive in the (possibly random) deck. No semantic clustering, so a round can contain "mitosis / French Revolution / Pythagorean Theorem / photosynthesis" — trivially solvable by elimination without any knowledge.

## Solution: Semantic Clustering + Deck Interleaving

### Grouping (semantic similarity)
Sort vocab cards by `unit + mode` before forming matching groups. Each group of 4 will contain cards from the **same unit and same mode** — e.g., 4 `significance_to_person` cards from Unit 3 AP Psychology. The definitions will be topically similar, requiring actual knowledge to distinguish rather than process of elimination.

Tiered grouping:
1. **Primary**: cluster by `unit + mode` — must have ≥ 4 cards in cluster to form a group
2. Cards in clusters < 4 fall through and become individual typed/tap cards

### Interleaving (mixing)
`computeStylePlan` returns a new field `reorderedDeck: DrillCard[]`. This deck:
- Places 4-card matching blocks evenly spread across the session
- Minimum gap of 3 individual cards between each matching block
- Formula: `gap = max(floor(individualCount / matchingBlockCount), 3)`
- Individual pool (remaining vocab + concept_mc + name_to_formula) is shuffled before interleaving

`DrillSession` uses `reorderedDeck` as the initial `workingDeck` for fresh sessions. Resumed drafts keep their saved working deck unchanged.

## Data Flow

```
session.cards (all cards)
    ↓
computeStylePlan(deck, settings)
    ├─ Separate: vocabCards vs nonVocabCards
    ├─ Cluster vocabCards by unit+mode
    ├─ Form matching groups (4 per cluster ≥ 4)
    ├─ Remaining vocab → individual (typed/tap)
    ├─ Interleave: shuffle individualPool, spread matchingBlocks evenly
    └─ Return { styleMap, matchingAnchorMap, groupMemberIds, reorderedDeck }
         ↓
DrillSession.workingDeck = reorderedDeck (fresh session only)
```

## Files Changed

| File | Change |
|------|--------|
| `utils/drillStyles.ts` | Replace sequential flush with cluster-based grouping; add `reorderedDeck` to `StylePlan`; add shuffle helper |
| `components/drill/DrillSession.tsx` | Use `reorderedDeck` for initial `workingDeck` when no saved draft |

## Edge Cases

- **Cluster < 4 cards**: cards become individual typed/tap — no matching round for them
- **No matching groups formed**: `reorderedDeck` = shuffled individual pool (all vocab + non-vocab)
- **Resumed draft**: `session.workingDeck` present → skip `reorderedDeck`, preserve in-progress order
- **Matching disabled in settings**: all vocab → individual; return original deck unchanged
- **All same unit+mode**: one big cluster, groups formed greedily (0–3, 4–7, etc.)
- **Study All sessions**: cards from multiple units — clusters naturally form within each unit+mode

## Invariants Preserved

- Every card in the original deck appears exactly once in `reorderedDeck`
- Matching group members always appear consecutively in the deck (anchor first, then 3 members) — required for `handleMatchingDone` to advance index by `groupSize`
- `matchingAnchorMap` keyed by anchor card ID — unchanged semantics
- `groupMemberIds` still used as orphan-member fallback — unchanged
