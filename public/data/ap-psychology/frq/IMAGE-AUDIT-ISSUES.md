# AP Psychology FRQ Image Audit Issues — 2026-04-17

## Images Requiring Manual Replacement

### psych-2025-set1-frq-2-doc3.png
- **Referenced in:** psych-2025-set1-frq-2.json, Source 3
- **Expected content:** A human study about performance monitoring and evaluation — specifically, a study in which participants' performance was improved when observed by an evaluator or monitored electronically. The scoring notes cite: "According to Source 3, performance was improved when participants were observed by an evaluator and when they were monitored electronically."
- **Actual content:** A diagram showing two macaque monkeys performing a conflict trial and a non-conflict trial (two panels labeled "Non-conflict Trial" and "Conflict Trial"). This is a baboon/primate cognitive-control study, which belongs to Source 2, not Source 3.
- **Action required:** This image is a duplicate of the Source 2 baboon diagram (see psych-2025-set1-frq-2-doc2.png, which correctly shows a single monkey interacting with a touchscreen). Source the correct human performance-monitoring study image from the 2025 AP Psychology released exam (Set 1, FRQ 2, Source 3) and replace this file.

## Resolved 2026-04-19

### psych-2025-set1-frq-2 (Social Facilitation EBQ)
- Populated `content` for all three documents (Source 1, Source 2, Source 3) with verbatim text from the College Board PDF (`content-sources/frq-pdfs/ap-psychology/questions/2025 psych set 1 frq.pdf`, pages 6-12). Each `content` field includes Introduction / Participants / Method / Results and Discussion sections plus the APA citation.
- **doc3 image fix:** Re-extracted pages 11 and 12 of the source PDF (Source 3 region) and confirmed Source 3 is **text-only in the original College Board release** — it has no figure, graph, or diagram. The previously-stored `psych-2025-set1-frq-2-doc3.png` (the two-panel baboon Conflict/Non-conflict Trial figure) was the Source 2 "Figure 2" that had been mis-attributed to Source 3. Since no Source 3 figure exists in the PDF to substitute, the wrong image was deleted and `documents[3].image` was set to `null`. The Source 3 stimulus now renders as prose only, which matches the College Board source. (Source 1's bar graph and Source 2's Figure 1 monkey diagram remain in place.)
