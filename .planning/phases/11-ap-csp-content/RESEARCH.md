# AP Computer Science Principles — Research Brief

> **STATUS: COMPLETE**
> Source: Local CED PDF (Fall 2023 edition) read via extracted text files.
> Web research: BLOCKED — all content sourced from CED PDF only.

---

## Exam Format

- **Section I:** 70 multiple-choice questions (120 minutes) — 70% of exam score
  - 57 single-select questions
  - 5 single-select questions with a reading passage about a computing innovation
  - 8 multi-select questions (choose 2 correct answers)
- **Section II:** Create Performance Task — 30% of exam score
  - Program code, video, and Personalized Project Reference (at least 9 hours in class)
  - 2 written response questions (4 distinct prompts: WR1, WR2a, WR2b, WR2c) — 60 minutes
- **Total exam time:** 3 hours (end-of-course AP Exam)

### MCQ Computational Thinking Practice Weighting
- Practice 1 (Computational Solution Design): 18–25%
- Practice 2 (Algorithms and Program Development): 20–28%
- Practice 3 (Abstraction in Program Development): 7–12%
- Practice 4 (Code Analysis): 12–19%
- Practice 5 (Computing Innovations): 28–33%
- Practice 6 (Responsible Computing): NOT assessed in MCQ section

---

## Unit Structure (5 Big Ideas)

| Big Idea | Name | CB Exam Weighting | Topics |
|----------|------|--------------------|--------|
| 1 | Creative Development (CRD) | 10–13% | 1.1, 1.2, 1.3, 1.4 |
| 2 | Data (DAT) | 17–22% | 2.1, 2.2, 2.3, 2.4 |
| 3 | Algorithms and Programming (AAP) | 30–35% | 3.1–3.18 |
| 4 | Computer Systems and Networks (CSN) | 11–15% | 4.1, 4.2, 4.3 |
| 5 | Impact of Computing (IOC) | 21–26% | 5.1–5.6 |

Note: Big Ideas are themes across the year — not sequential units. Teachers create their own unit sequences.

---

## CB Pseudocode Specification (from CED Appendix/Exam Reference Sheet)

### Assignment, Display, Input
- `a ← expression` — assigns value to variable a
- `DISPLAY(expression)` — displays value followed by space
- `INPUT()` — accepts value from user, returns it

### Arithmetic Operators
- `a + b`, `a - b`, `a * b`, `a / b` — standard arithmetic
- `a MOD b` — remainder when a divided by b (a ≥ 0, b > 0); e.g., 17 MOD 5 = 2
- `RANDOM(a, b)` — returns random integer from a to b inclusive

### Relational Operators (return Boolean)
- `a = b`, `a ≠ b`, `a > b`, `a < b`, `a ≥ b`, `a ≤ b`

### Boolean Operators
- `NOT condition` — true if condition is false
- `condition1 AND condition2` — true if both are true
- `condition1 OR condition2` — true if either is true

### Selection (Conditionals)
```
IF(condition)
{
  <block of statements>
}

IF(condition)
{
  <first block of statements>
}
ELSE
{
  <second block of statements>
}
```

### Iteration (Loops)
```
REPEAT n TIMES
{
  <block of statements>
}

REPEAT UNTIL(condition)
{
  <block of statements>
}

FOR EACH item IN aList
{
  <block of statements>
}
```

### List Operations (1-based indexing)
- `aList ← [value1, value2, value3, ...]` — create list
- `aList ← []` — create empty list
- `aList[i]` — access element at index i (first element = index 1)
- `aList[i] ← x` — assign x to aList[i]
- `INSERT(aList, i, value)` — insert value at index i, shift right
- `APPEND(aList, value)` — append value to end
- `REMOVE(aList, i)` — remove element at index i, shift left
- `LENGTH(aList)` — number of elements in list

### Procedures
```
PROCEDURE procName(parameter1, parameter2, ...)
{
  <block of statements>
}

PROCEDURE procName(parameter1, parameter2, ...)
{
  <block of statements>
  RETURN(expression)
}
```
- Call: `procName(arg1, arg2, ...)`
- Assign return: `result ← procName(arg1, arg2, ...)`

### Robot Commands (used in some MCQ questions)
- `MOVE_FORWARD()`, `ROTATE_LEFT()`, `ROTATE_RIGHT()`, `CAN_MOVE(direction)`

---

## Per-Unit Research

### Big Idea 1: Creative Development (CRD) — 10–13%
**Topics:** 1.1 Collaboration, 1.2 Program Function and Purpose, 1.3 Program Design and Development, 1.4 Identifying and Correcting Errors

**Learning Objectives:**
- CRD-1.A: Explain how computing innovations are improved through collaboration
- CRD-1.B: Explain how computing innovations are developed by groups of people
- CRD-1.C: Demonstrate effective interpersonal skills during collaboration
- CRD-2.A: Describe the purpose of a computing innovation
- CRD-2.B: Explain how a program or code segment functions
- CRD-2.C: Identify input(s) to a program
- CRD-2.D: Identify output(s) produced by a program
- CRD-2.E: Develop a program using a development process
- CRD-2.F: Design a program and its user interface
- CRD-2.G: Describe the purpose of a code segment by writing documentation
- CRD-2.H: Acknowledge the intellectual property of others
- CRD-2.I: Identify and correct errors in algorithms and programs
- CRD-2.J: Identify inputs/expected outputs for testing correctness

**Essential Knowledge Highlights:**
- Computing innovations can be physical, nonphysical software, or nonphysical computing concepts
- Collaboration includes diverse perspectives to avoid bias
- Development process phases: investigating/reflecting, designing, prototyping, testing
- Iterative process: refinement based on feedback/testing
- Incremental process: break problem into pieces, test each piece
- Types of errors: syntax errors, logic errors, run-time errors
- Debugging strategies: test cases, hand tracing, visualizations
- Input: tactile, audio, visual, text; from user or other programs
- Events trigger program execution in event-driven programming
- Documentation: comments in code, explain purpose of segments
- Pair programming: one writes code, one reviews (common collaboration model)
- Open source, Creative Commons licensing

**Code-heavy:** Minimal — mostly conceptual (design, collaboration, error types)
**Stimulus types:** Short pseudocode snippets, scenario descriptions

---

### Big Idea 2: Data (DAT) — 17–22%
**Topics:** 2.1 Binary Numbers, 2.2 Data Compression, 2.3 Extracting Information from Data, 2.4 Using Programs with Data

**Learning Objectives:**
- DAT-1.A: Explain how data can be represented using bits
- DAT-1.B: Evaluate the effect of encoding data
- DAT-1.C: Evaluate the effect of data abstraction
- DAT-2.A: Describe what information can be extracted from data
- DAT-2.B: Describe what information can be extracted from metadata
- DAT-2.C: Explain how programs can be used to gain insight and knowledge from data
- DAT-2.D: Extract information from data using a program
- DAT-2.E: Explain how programs can be used to process data to gain insight

**Essential Knowledge Highlights:**
- 1 bit = 2 values; N bits = 2^N values
- Binary: base-2 number system using 0s and 1s
- Overflow error: when a number exceeds storage capacity
- Round-off error: loss of precision when representing real numbers
- Analog data: continuous; digital data: discrete
- Sampling: converting analog to digital by measuring at intervals
- Lossless compression: exact reconstruction (e.g., run-length encoding)
- Lossy compression: approximate reconstruction, smaller files (e.g., JPEG, MP3)
- Metadata: data about data (e.g., file size, date created, location)
- Big data: large datasets requiring computational tools
- Data cleaning: removing incomplete/invalid data
- Correlation vs. causation
- Data bias: systematic errors in data collection/representation
- Visualization types: scatter plots, bar charts, histograms
- Citizen science, crowdsourcing for data collection
- Open data: publicly accessible datasets
- Programs can process data to find trends, answer questions

**Code-heavy:** Moderate — data manipulation code segments
**Stimulus types:** Code blocks (data processing), tables, scenarios

---

### Big Idea 3: Algorithms and Programming (AAP) — 30–35%
**Topics:** 3.1–3.18 (Variables/Assignments, Data Abstraction, Mathematical Expressions, Strings, Boolean Expressions, Conditionals, Nested Conditionals, Iteration, Developing Algorithms, Lists, Binary Search, Calling Procedures, Developing Procedures, Libraries, Random Values, Simulations, Algorithmic Efficiency, Undecidable Problems)

**Learning Objectives:**
- AAP-1.A: Represent a value with a variable
- AAP-1.B: Determine the value of a variable after statements are executed
- AAP-1.C: Represent a list using a variable
- AAP-1.D: Develop data abstraction using lists
- AAP-2.A: Express an algorithm that uses sequencing
- AAP-2.B: Represent a step-by-step algorithmic process using sequential code
- AAP-2.C: Evaluate expressions that use arithmetic operators
- AAP-2.D: Evaluate expressions that use string concatenation
- AAP-2.E: Evaluate expressions that use relational operators
- AAP-2.F: Evaluate expressions that use logic operators
- AAP-2.G: Express an algorithm that uses selection
- AAP-2.H: Determine the result of conditional statements
- AAP-2.I: Determine the result of nested conditional statements
- AAP-2.J: Express an algorithm using iteration
- AAP-2.K: Determine the result of iteration statements
- AAP-2.L: Compare multiple algorithms for same result/side effect
- AAP-2.M: Create and combine algorithms
- AAP-2.N: Use list operations in algorithms
- AAP-2.O: Write iteration statements to traverse a list
- AAP-2.P: Determine result of list traversal algorithms
- AAP-3.A: Call and use procedures
- AAP-3.B: Explain how procedural abstraction manages complexity
- AAP-3.C: Evaluate a procedure's behavior
- AAP-3.D: Develop a new procedure
- AAP-3.E: Use APIs and libraries
- AAP-3.F: Use random values and test behavior
- AAP-3.G: Determine the result of simulation code
- AAP-4.A: Explain difference between reasonable/unreasonable time algorithms; identify heuristic solutions
- AAP-4.B: Explain existence of undecidable problems

**Essential Knowledge Highlights:**
- Variables: store values of different types (integer, string, Boolean, list)
- Assignment: `a ← expression` — copies value to variable
- Sequencing: statements execute in the order they appear
- Selection: IF/ELSE — executes different code based on condition
- Iteration: REPEAT n TIMES, REPEAT UNTIL, FOR EACH
- Lists: 1-based indexing; operations: APPEND, INSERT, REMOVE, LENGTH
- Strings: concatenation using + operator
- Boolean expressions: AND, OR, NOT; compare with relational operators
- Nested conditionals: IF inside IF
- Procedures: named code segments; parameters, arguments, return values
- Procedural abstraction: hides implementation details, manages complexity
- Data abstraction: lists manage multiple values under one name
- Binary search: requires sorted list; O(log n) comparisons
- Linear search: works on unsorted list; checks each element
- Libraries/APIs: pre-written code for reuse
- Simulations: model real-world processes; use random values
- Algorithmic efficiency: polynomial = reasonable; exponential/factorial = unreasonable
- Heuristic: approximate solution for hard problems (not guaranteed optimal)
- Decidable problem: algorithm exists to solve all instances correctly
- Undecidable problem: no algorithm can solve all instances correctly (e.g., halting problem)

**Code-heavy:** VERY heavy — most questions involve pseudocode tracing
**Stimulus types:** CB pseudocode blocks (primary), algorithm descriptions

---

### Big Idea 4: Computer Systems and Networks (CSN) — 11–15%
**Topics:** 4.1 The Internet, 4.2 Fault Tolerance, 4.3 Parallel and Distributed Computing

**Learning Objectives:**
- CSN-1.A: Explain how computing devices work together in a network
- CSN-1.B: Explain how the Internet works
- CSN-1.C: Explain how the protocols on the Internet support communication
- CSN-1.D: Describe the characteristics of the Internet and the systems built on it
- CSN-1.E: Explain how the Internet is fault tolerant
- CSN-2.A: Describe the benefits and limitations of parallel computing
- CSN-2.B: Describe the benefits and limitations of distributed computing

**Essential Knowledge Highlights:**
- Network: group of connected computing devices that exchange data
- Computing device: physical device that runs programs (phone, laptop, server)
- IP address: unique numeric address for each device on a network
- Router: routes packets between networks
- Protocol: agreed-upon set of rules for data transmission
- TCP (Transmission Control Protocol): ensures reliable packet delivery, retransmits lost packets
- HTTP/HTTPS: web communication protocol; HTTPS adds encryption
- Packet: small unit of data transmitted over network; contains source/destination IP
- Packet switching: data split into packets sent independently, reassembled at destination
- DNS (Domain Name System): translates URLs to IP addresses
- Bandwidth: max data transmitted per second
- Internet: global network connecting networks via agreed-upon protocols
- World Wide Web: subset of Internet; web pages accessible via HTTP
- Redundancy: multiple paths in network ensure data can still be delivered
- Fault tolerant: system continues working even when parts fail
- Scalability: ability to handle increasing workload
- Sequential computing: processes run one at a time
- Parallel computing: processes run simultaneously on multiple processors; reduces time
- Distributed computing: tasks distributed across multiple computers; enables larger problems
- Speedup: ratio of sequential time to parallel time; cannot exceed number of processors
- Some tasks cannot be parallelized (dependencies)

**Code-heavy:** Low — mostly conceptual
**Stimulus types:** Network diagrams (described in text), scenarios, tables

---

### Big Idea 5: Impact of Computing (IOC) — 21–26%
**Topics:** 5.1 Beneficial and Harmful Effects, 5.2 Digital Divide, 5.3 Computing Bias, 5.4 Crowdsourcing, 5.5 Legal and Ethical Concerns, 5.6 Safe Computing

**Learning Objectives:**
- IOC-1.A: Explain how the development of computing innovations can cause both beneficial and harmful effects
- IOC-1.B: Explain how computing innovations can have unintended effects
- IOC-1.C: Describe issues that contribute to the digital divide
- IOC-1.D: Explain how bias may exist in computational artifacts
- IOC-1.E: Explain how people participate in problem-solving processes at scale through crowdsourcing
- IOC-1.F: Explain how the use of computing raises legal and ethical concerns
- IOC-2.A: Describe the risks to privacy from collecting and storing personal data on a computer system
- IOC-2.B: Explain how computing innovations impact our economies, cultures, and societies
- IOC-2.C: Describe how malicious actors can gain access to personal information
- IOC-2.D: Describe elements used to create secure data transmission

**Essential Knowledge Highlights:**
- Computing innovations: unintended consequences; beneficial AND harmful effects
- Digital divide: unequal access to technology based on socioeconomic status, geography, disability
- Computing bias: reflected in algorithms, training data, design choices
- Crowdsourcing: using many people to contribute to a task (e.g., Wikipedia, open-source)
- Citizen science: public participation in scientific research
- Open-source software: source code freely available; Creative Commons licensing
- Intellectual property: legal rights over creative work; copyright, licenses
- PII (Personally Identifiable Information): data that can identify an individual
- Cookies: stored on user device; track browsing behavior
- Phishing: fraudulent attempts to obtain sensitive information
- Keylogging: recording keystrokes to capture passwords
- Malware: malicious software; includes viruses, ransomware, spyware
- Virus: malicious code that spreads by attaching to programs
- Rogue access point: fake Wi-Fi hotspot used for attacks
- Encryption: converting data to unreadable form; requires key to decrypt
- Symmetric encryption: same key for encrypt/decrypt
- Public key encryption (asymmetric): public key encrypts, private key decrypts
- Multi-factor authentication (MFA): requires multiple verification methods
- HTTPS: HTTP with SSL/TLS encryption for secure web communication
- Privacy concerns: data collection, surveillance, unauthorized access
- Ethical issues: automation/job displacement, algorithmic fairness, surveillance

**Code-heavy:** None — entirely conceptual
**Stimulus types:** Scenario descriptions, text passages about computing innovations
