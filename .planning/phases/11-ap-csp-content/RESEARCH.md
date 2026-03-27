# Phase 11: AP Computer Science Principles Content - Research

**Researched:** 2026-03-25
**Domain:** AP Computer Science Principles (College Board CED)
**Confidence:** HIGH

> **NOTE (2026-03-26):** This research was done before the drill/MCQ redesign. The curriculum facts and pseudocode patterns are accurate. However, the Planner reading this must follow the **new** drill mode taxonomy from `docs/superpowers/specs/2026-03-26-drill-mcq-redesign.md` and `11-CONTEXT.md` — not any references to old modes (term_to_definition, concept_to_example) that may appear in this doc.

## Summary

AP Computer Science Principles (AP CSP) is organized around 5 Big Ideas with 35 total topics. The exam consists of 70 MCQs (120 minutes, 70% of score) plus a Create Performance Task + Written Response section (30%). The MCQ section includes 57 single-select, 5 single-select with reading passages, and 8 multi-select (choose 2) questions.

The exam date for 2026 is **May 14, 2026**. Big Idea 3 (Algorithms and Programming) dominates at 30-35% of exam weight with 18 topics. Big Idea 5 (Impact of Computing) is the second-heaviest at 21-26%.

Critical constraint: All code must use College Board pseudocode only (Critical Rule #5). No Python, Java, JavaScript, or any real programming language.

## Course Structure (from College Board CED)

### Big Idea 1: Creative Development (10-13%)
| Topic | Name |
|-------|------|
| 1.1 | Collaboration |
| 1.2 | Program Function and Purpose |
| 1.3 | Program Design and Development |
| 1.4 | Identifying and Correcting Errors |

**Key Concepts:** Computing innovation, collaboration tools (pair programming, code review, version control), program purpose vs. function, iterative development, incremental development, debugging, error types (syntax, runtime, logic, overflow).

**Learning Objective Codes:** CRD-1.A, CRD-1.B, CRD-1.C, CRD-2.A, CRD-2.B, CRD-2.C, CRD-2.D, CRD-2.E, CRD-2.F, CRD-2.G, CRD-2.H, CRD-2.I, CRD-2.J

### Big Idea 2: Data (17-22%)
| Topic | Name |
|-------|------|
| 2.1 | Binary Numbers |
| 2.2 | Data Compression |
| 2.3 | Extracting Information from Data |
| 2.4 | Using Programs with Data |

**Key Concepts:** Bits, bytes, binary/decimal conversion, overflow errors, analog vs. digital, sampling, lossless vs. lossy compression, metadata, data visualization, correlation vs. causation, cleaning data, filtering/transforming data.

**Learning Objective Codes:** DAT-1.A, DAT-1.B, DAT-1.C, DAT-2.A, DAT-2.B, DAT-2.C, DAT-2.D, DAT-2.E

### Big Idea 3: Algorithms and Programming (30-35%)
| Topic | Name |
|-------|------|
| 3.1 | Variables and Assignments |
| 3.2 | Data Abstraction |
| 3.3 | Mathematical Expressions |
| 3.4 | Strings |
| 3.5 | Boolean Expressions |
| 3.6 | Conditionals |
| 3.7 | Nested Conditionals |
| 3.8 | Iteration |
| 3.9 | Developing Algorithms |
| 3.10 | Lists |
| 3.11 | Binary Search |
| 3.12 | Calling Procedures |
| 3.13 | Developing Procedures |
| 3.14 | Libraries |
| 3.15 | Random Values |
| 3.16 | Simulations |
| 3.17 | Algorithmic Efficiency |
| 3.18 | Undecidable Problems |

**Key Concepts:** Variables, assignment (`a <- expression`), data types, lists (1-indexed), APPEND/INSERT/REMOVE/LENGTH, string operations, Boolean logic (AND/OR/NOT), IF/ELSE, nested conditionals, REPEAT n TIMES, REPEAT UNTIL, FOR EACH, algorithms (search, sort), procedures with parameters and return values, procedural abstraction, API/library usage, RANDOM(a,b), simulations vs. real-world, reasonable time, heuristic solutions, undecidable problems (halting problem).

**Learning Objective Codes:** AAP-1.A, AAP-1.B, AAP-1.C, AAP-1.D, AAP-2.A, AAP-2.B, AAP-2.C, AAP-2.D, AAP-2.E, AAP-2.F, AAP-2.G, AAP-2.H, AAP-2.I, AAP-2.J, AAP-2.K, AAP-2.L, AAP-2.M, AAP-2.N, AAP-2.O, AAP-2.P, AAP-3.A, AAP-3.B, AAP-3.C, AAP-3.D, AAP-3.E, AAP-3.F, AAP-4.A, AAP-4.B

### Big Idea 4: Computing Systems and Networks (11-15%)
| Topic | Name |
|-------|------|
| 4.1 | The Internet |
| 4.2 | Fault Tolerance |
| 4.3 | Parallel and Distributed Computing |

**Key Concepts:** Computing devices, computing systems, computer networks, bandwidth, Internet (decentralized, packet-switched), IP addresses (IPv4 vs IPv6), TCP/IP, UDP, DNS, HTTP/HTTPS, routing, packets, scalability, fault tolerance, redundancy, parallel computing, sequential computing, distributed computing, speedup.

**Learning Objective Codes:** CSN-1.A, CSN-1.B, CSN-1.C, CSN-1.D, CSN-1.E, CSN-2.A, CSN-2.B

### Big Idea 5: Impact of Computing (21-26%)
| Topic | Name |
|-------|------|
| 5.1 | Beneficial and Harmful Effects |
| 5.2 | Digital Divide |
| 5.3 | Computing Bias |
| 5.4 | Crowdsourcing |
| 5.5 | Legal and Ethical Concerns |
| 5.6 | Safe Computing |

**Key Concepts:** Beneficial/harmful effects of innovations, unintended consequences, digital divide (socioeconomic, geographic, demographic), computing bias (in data, algorithms, and design), crowdsourcing, citizen science, open-source, intellectual property (copyright, Creative Commons, open access), digital rights, phishing, keylogging, rogue access points, encryption, symmetric vs. asymmetric encryption, public key encryption, digital certificates, cookies, PII (personally identifiable information), authentication (multi-factor, biometric), malware, viruses.

**Learning Objective Codes:** IOC-1.A, IOC-1.B, IOC-1.C, IOC-1.D, IOC-1.E, IOC-1.F, IOC-2.A, IOC-2.B, IOC-2.C

## Exam Format Details

- **70 MCQs in 120 minutes** (70% of total score)
- **57 single-select** standard MCQs
- **5 single-select with reading passages** about computing innovations
- **8 multi-select** requiring 2 correct answers
- **Create Performance Task** + **Written Response** (30% of total score, separate from MCQ)
- **Exam Date:** May 14, 2026

## College Board Pseudocode Reference (CRITICAL)

```
Assignment:     a <- expression  (NOT = or :=)
Display:        DISPLAY(expression)
Input:          INPUT()
Selection:      IF(condition) { } ELSE { }
Iteration:      REPEAT n TIMES { }
                REPEAT UNTIL(condition) { }
                FOR EACH item IN list { }
Procedure:      PROCEDURE name(param1, param2) { RETURN(expression) }
List ops:       list[i] (1-indexed), APPEND(list, value), INSERT(list, i, value),
                REMOVE(list, i), LENGTH(list)
Math:           MOD (modulus), RANDOM(a, b)
Logic:          NOT, AND, OR
Robot:          MOVE_FORWARD(), ROTATE_LEFT(), ROTATE_RIGHT(), CAN_MOVE(direction)
Strings:        CONCAT(str1, str2), SUBSTRING(str, start, length)
```

## Sources

- [AP CSP Course Page (College Board)](https://apcentral.collegeboard.org/courses/ap-computer-science-principles)
- [AP CSP Exam Page (College Board)](https://apcentral.collegeboard.org/courses/ap-computer-science-principles/exam)
- [Alps Academy AP CSP Big Ideas](https://www.alps.academy/ap-csp-big-ideas/)
- [Fiveable AP CSP Unit Reviews](https://fiveable.me/ap-comp-sci-p/)
- [Knowt AP CSP Study Notes](https://knowt.com/)
- [2026 AP Exam Dates (College Board)](https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates)
