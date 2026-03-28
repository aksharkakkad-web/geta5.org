# AP Chemistry — Reference Documents

Drop official College Board files here before running the content pipeline.

## Files to add

| File | Source | Required |
|------|--------|----------|
| `ced.pdf` | AP Chemistry CED — collegeboard.org/courses/ap-chemistry | YES |
| `frq-[year].pdf` | Released FRQ packet (1-2 years) — collegeboard.org/search/apexams | Recommended |
| `exam-[year].pdf` | Full released exam if freely available | Optional |
| `equations-tables.pdf` | AP Chemistry Equations & Constants sheet — included with CED or separately | Recommended |

## Notes
- CED = Course and Exam Description — canonical topic list, required equations, and lab skills
- Do NOT convert to markdown — chemical formulas and equations do not survive conversion
- The Researcher agent will read the PDF directly via the Read tool
- The Chemistry Checker subagent must verify all equations against the CED equations sheet before Reviewer signs off
- The equations & constants sheet is the authoritative source for all formula KaTeX rendering
