# AP Calculus AB — Research Brief

> **STATUS: complete**
> Source: Local CED PDF — `ap-calculus-ab-and-bc-course-and-exam-description.pdf` (256 pages, effective Fall 2020)
> All units, weights, objectives, and formulas extracted from PDF. No web sources used.

---

## Exam Format (from PDF p. 223–226)

| Section | Type | Questions | Weighting | Time | Calculator |
|---------|------|-----------|-----------|------|------------|
| I Part A | Multiple choice | 30 | 33.3% | 60 min | NOT permitted |
| I Part B | Multiple choice | 15 | 16.7% | 45 min | Required |
| II Part A | Free response | 2 | 16.7% | 30 min | Required |
| II Part B | Free response | 4 | 33.3% | 60 min | NOT permitted |

- Total: **45 MCQ + 6 FRQ**, 3 hours 15 minutes
- **NO formula sheet provided** on AP Calculus AB exam — students must memorize all formulas
- Epsilon-delta definition of limit is **NOT assessed** on AB exam (exclusion statement in CED)
- Integration by parts, partial fractions, improper integrals, Euler's method, logistic models: **BC only** (not assessed on AB — see notes below per unit)

---

## Unit Structure — AB Only (8 units)

| Unit | Official Name | CB Exam Weight (AB) |
|------|--------------|---------------------|
| 1 | Limits and Continuity | 10–12% |
| 2 | Differentiation: Definition and Fundamental Properties | 10–12% |
| 3 | Differentiation: Composite, Implicit, and Inverse Functions | 9–13% |
| 4 | Contextual Applications of Differentiation | 10–15% |
| 5 | Analytical Applications of Differentiation | 15–18% |
| 6 | Integration and Accumulation of Change | 17–20% |
| 7 | Differential Equations | 6–12% |
| 8 | Applications of Integration | 10–15% |

**Units 9–10 are BC only. All BC-only content is out of scope for this phase.**

---

## Mathematical Practices (from PDF p. 14)

- **Practice 1: Implementing Mathematical Processes** (53–66% of MCQ) — apply rules, procedures
- **Practice 2: Connecting Representations** (18–28% of MCQ) — translate across graphical/numerical/analytical/verbal
- **Practice 3: Justification** (11–18% of MCQ) — reasoning, theorems, conditions
- **Practice 4: Communication and Notation** (not assessed in MCQ, 13–24% FRQ)

Skills: 1.A–1.F, 2.A–2.E, 3.A–3.G, 4.A–4.E

---

## Per-Unit Research

### Unit 1: Limits and Continuity (10–12%)
**Topics (from CED):** 1.1–1.16
- 1.1: Introducing Calculus — can change occur at an instant?
- 1.2: Defining limits and limit notation
- 1.3–1.4: Estimating limit values from graphs and tables
- 1.5: Determining limits using algebraic properties
- 1.6: Determining limits using algebraic manipulation (factoring, conjugates, trig identities)
- 1.7: Selecting procedures for determining limits
- 1.8: Determining limits using the Squeeze Theorem
- 1.9: Connecting multiple representations of limits
- 1.10: Types of discontinuities (removable, jump, vertical asymptote)
- 1.11: Defining continuity at a point (3 conditions)
- 1.12: Confirming continuity over an interval
- 1.13: Removing discontinuities (redefining function value)
- 1.14: Connecting infinite limits and vertical asymptotes
- 1.15: Connecting limits at infinity and horizontal asymptotes
- 1.16: Intermediate Value Theorem (IVT)

**Learning Objectives:**
- CHA-1.A: Interpret rate of change at an instant via average rates
- LIM-1.A: Represent limits analytically using correct notation
- LIM-1.B: Interpret limits in analytic notation
- LIM-1.C: Estimate limits from graphs and tables (one-sided limits)
- LIM-1.D: Determine limits using limit theorems (sums, products, quotients, composites)
- LIM-1.E: Determine limits using equivalent expressions / Squeeze Theorem
- LIM-2.A: Justify conclusions about continuity at a point using definition
- LIM-2.B: Determine intervals of continuity
- LIM-2.C: Remove discontinuities by redefining function values
- LIM-2.D: Interpret behavior using limits at infinity; asymptotic behavior
- FUN-1.A: Explain behavior using IVT

**Key Theorems:**
- Intermediate Value Theorem (IVT): If f is continuous on [a,b] and d is between f(a) and f(b), then ∃ c in (a,b) such that f(c) = d
- Squeeze Theorem
- Continuity 3-condition definition: f(c) exists, lim_{x→c} f(x) exists, lim_{x→c} f(x) = f(c)

**Exclusion:** Epsilon-delta definition of limit (NOT assessed on AB)

**KaTeX Formula Catalog:**
- `\lim_{x \to c} f(x) = L`
- `\lim_{x \to c^-} f(x)`, `\lim_{x \to c^+} f(x)` (one-sided)
- `\lim_{x \to \infty} f(x)` (horizontal asymptote)
- Continuity: `f(c)` exists, `\lim_{x \to c} f(x)` exists, `\lim_{x \to c} f(x) = f(c)`
- Squeeze Theorem: `g(x) \leq f(x) \leq h(x)` and `\lim_{x \to c} g(x) = \lim_{x \to c} h(x) = L` → `\lim_{x \to c} f(x) = L`
- IVT: `f` continuous on `[a,b]`, `d` between `f(a)` and `f(b)` → `\exists c \in (a,b)` s.t. `f(c) = d`

**is_key_term candidates (8–15 per unit):**
Limit, one-sided limit, continuity at a point, removable discontinuity, jump discontinuity, vertical asymptote, horizontal asymptote, Intermediate Value Theorem, Squeeze Theorem, continuity on an interval, infinite limit, limit at infinity

**Drill mode breakdown:**
- `definition_to_term`: limit, one-sided limit, types of discontinuities, continuity conditions, IVT, Squeeze Theorem, vertical/horizontal asymptote
- `name_to_formula`: limit notation, continuity 3 conditions (as formula), IVT statement

---

### Unit 2: Differentiation: Definition and Fundamental Properties (10–12%)
**Topics (from CED):** 2.1–2.10
- 2.1: Average and instantaneous rates of change
- 2.2: Defining the derivative; notation f'(x), y', dy/dx
- 2.3: Estimating derivatives at a point
- 2.4: Differentiability and continuity (when derivatives do/don't exist)
- 2.5: Power Rule
- 2.6: Constant, Sum, Difference, Constant Multiple rules
- 2.7: Derivatives of sin x, cos x, e^x, ln x
- 2.8: Product Rule
- 2.9: Quotient Rule
- 2.10: Derivatives of tan x, cot x, sec x, csc x

**Learning Objectives:**
- CHA-2.A: Difference quotients — average rate of change
- CHA-2.B: Derivative as limit of difference quotient; notation
- CHA-2.C: Equation of tangent line at a point
- CHA-2.D: Estimate derivatives from tables/graphs
- FUN-2.A: Differentiability implies continuity; continuous may fail to be differentiable
- FUN-3.A: Power rule, constant/sum/difference, sin/cos/exp/log
- FUN-3.B: Product rule, quotient rule, trig derivatives
- LIM-3.A: Limit as definition of derivative

**Key Formulas:**
- Difference quotient (average rate): `\frac{f(a+h)-f(a)}{h}`
- Definition of derivative: `f'(x) = \lim_{h \to 0} \frac{f(x+h)-f(x)}{h}`
- Power Rule: `\frac{d}{dx}[x^n] = nx^{n-1}`
- Constant Multiple: `\frac{d}{dx}[cf(x)] = cf'(x)`
- Sum/Difference: `\frac{d}{dx}[f \pm g] = f' \pm g'`
- Product Rule: `\frac{d}{dx}[fg] = f'g + fg'`
- Quotient Rule: `\frac{d}{dx}\left[\frac{f}{g}\right] = \frac{f'g - fg'}{g^2}`
- `\frac{d}{dx}[\sin x] = \cos x`
- `\frac{d}{dx}[\cos x] = -\sin x`
- `\frac{d}{dx}[e^x] = e^x`
- `\frac{d}{dx}[\ln x] = \frac{1}{x}`
- `\frac{d}{dx}[\tan x] = \sec^2 x`
- `\frac{d}{dx}[\cot x] = -\csc^2 x`
- `\frac{d}{dx}[\sec x] = \sec x \tan x`
- `\frac{d}{dx}[\csc x] = -\csc x \cot x`
- Slope of tangent: `m = f'(a)` → tangent: `y - f(a) = f'(a)(x-a)`

**is_key_term candidates (8–15):**
Power Rule, Product Rule, Quotient Rule, derivative definition (limit form), tangent line equation, derivative of sin x, derivative of cos x, derivative of e^x, derivative of ln x, differentiability implies continuity

**Drill mode breakdown:**
- `name_to_formula`: All derivative rules above (power, product, quotient, trig, exp, log)
- `definition_to_term`: derivative, average rate of change, instantaneous rate of change, differentiability, tangent line

---

### Unit 3: Differentiation: Composite, Implicit, and Inverse Functions (9–13%)
**Topics (from CED):** 3.1–3.6
- 3.1: Chain Rule
- 3.2: Implicit Differentiation
- 3.3: Differentiating Inverse Functions
- 3.4: Differentiating Inverse Trigonometric Functions
- 3.5: Selecting procedures for calculating derivatives
- 3.6: Calculating Higher-Order Derivatives

**Learning Objectives:**
- FUN-3.C: Chain Rule for composite functions
- FUN-3.D: Implicit differentiation (chain rule basis)
- FUN-3.E: Derivatives of inverse and inverse trig functions
- FUN-3.F (implied by 3.6): Higher-order derivatives

**Key Formulas:**
- Chain Rule: `\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x)` or `\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}`
- Inverse function derivative: `(f^{-1})'(x) = \frac{1}{f'(f^{-1}(x))}`
- `\frac{d}{dx}[\arcsin x] = \frac{1}{\sqrt{1-x^2}}`
- `\frac{d}{dx}[\arccos x] = -\frac{1}{\sqrt{1-x^2}}`
- `\frac{d}{dx}[\arctan x] = \frac{1}{1+x^2}`
- Higher-order: f''(x), f'''(x) = second and third derivatives

**is_key_term candidates (8–15):**
Chain Rule, implicit differentiation, inverse function derivative, derivative of arcsin, derivative of arctan, higher-order derivative, Leibniz notation for chain rule

**Drill mode breakdown:**
- `name_to_formula`: Chain rule, inverse derivative formula, arcsin/arctan/arccos derivatives
- `definition_to_term`: implicit differentiation, composite function, higher-order derivative, Leibniz notation

---

### Unit 4: Contextual Applications of Differentiation (10–15%)
**Topics (from CED):** 4.1–4.7
- 4.1: Interpreting meaning of derivative in context (units)
- 4.2: Straight-line motion — position, velocity, acceleration
- 4.3: Rates of change in applied contexts (other than motion)
- 4.4–4.5: Related rates (introduction and problems)
- 4.6: Local linearity and linearization (tangent line approximation)
- 4.7: L'Hôpital's Rule for indeterminate forms (0/0, ∞/∞)

**Learning Objectives:**
- CHA-3.A: Interpret derivative meaning in context (units, rate of change)
- CHA-3.B: Motion — velocity = s'(t), acceleration = v'(t) = s''(t), speed = |v(t)|
- CHA-3.C: Rates in non-motion contexts
- CHA-3.D–3.E: Related rates problems
- CHA-3.F: Local linearity; tangent line approximation (linearization)
- LIM-4.A: L'Hôpital's Rule for 0/0 and ∞/∞ indeterminate forms

**Key Formulas:**
- Velocity: `v(t) = s'(t)`
- Acceleration: `a(t) = v'(t) = s''(t)`
- Speed: `|v(t)|`
- Linearization: `L(x) = f(a) + f'(a)(x - a)`
- L'Hôpital's Rule: `\lim_{x \to c} \frac{f(x)}{g(x)} = \lim_{x \to c} \frac{f'(x)}{g'(x)}` when `\frac{0}{0}` or `\frac{\infty}{\infty}`

**is_key_term candidates (8–15):**
velocity, acceleration, speed, position function, linearization, related rates, L'Hôpital's Rule, indeterminate form, tangent line approximation

**Drill mode breakdown:**
- `name_to_formula`: velocity formula, acceleration, linearization L(x), L'Hôpital's Rule
- `definition_to_term`: related rates, indeterminate form, local linearity, speed vs velocity, position/velocity/acceleration relationship

---

### Unit 5: Analytical Applications of Differentiation (15–18%)
**Topics (from CED):** 5.1–5.12
- 5.1: Mean Value Theorem (MVT)
- 5.2: Extreme Value Theorem (EVT), global vs local extrema, critical points
- 5.3: Increasing/decreasing intervals (sign of f')
- 5.4: First Derivative Test for relative extrema
- 5.5: Candidates Test for absolute extrema on closed interval
- 5.6: Concavity (sign of f'')
- 5.7: Second Derivative Test for relative extrema
- 5.8–5.9: Sketching graphs and connecting f, f', f''
- 5.10–5.11: Optimization problems
- 5.12: Behaviors of implicit relations

**Learning Objectives:**
- FUN-1.B: MVT — if f continuous on [a,b] and differentiable on (a,b), ∃ c such that f'(c) = (f(b)-f(a))/(b-a)
- FUN-1.C: EVT — if f continuous on [a,b], then f has absolute max and min
- FUN-4.A: Critical points, increasing/decreasing
- FUN-4.B: First Derivative Test
- FUN-4.C: Candidates Test (closed interval method)
- FUN-4.D: Concavity, inflection points (sign of f'')
- FUN-4.E: Second Derivative Test
- FUN-4.F: Optimization

**Key Formulas/Theorems:**
- MVT: `f'(c) = \frac{f(b) - f(a)}{b - a}` for some `c \in (a,b)`
- EVT: if `f` continuous on `[a,b]`, then `f` attains both an absolute max and min on `[a,b]`
- Increasing: `f'(x) > 0`; Decreasing: `f'(x) < 0`
- Concave up: `f''(x) > 0`; Concave down: `f''(x) < 0`
- Inflection point: `f''` changes sign
- Second Derivative Test: if `f'(c)=0` and `f''(c) > 0` → local min; `f''(c) < 0` → local max

**is_key_term candidates (8–15):**
Mean Value Theorem, Extreme Value Theorem, critical point, relative extremum, absolute extremum, inflection point, concavity, First Derivative Test, Second Derivative Test, increasing/decreasing interval, Candidates Test

**Drill mode breakdown:**
- `name_to_formula`: MVT formula, EVT statement, Second Derivative Test conditions, concavity test
- `definition_to_term`: critical point, inflection point, concavity, local/relative maximum, absolute maximum, First Derivative Test, Candidates Test

---

### Unit 6: Integration and Accumulation of Change (17–20%)
**Topics (from CED):** 6.1–6.14 (AB topics only; 6.11–6.13 are BC only)
**AB Topics:** 6.1–6.10, 6.14
- 6.1: Accumulation of change (area under rate function)
- 6.2: Riemann sums (left, right, midpoint) and approximating areas
- 6.3: Riemann sums, summation notation, definite integral notation
- 6.4: FTC Part 1 — accumulation functions `F(x) = ∫_a^x f(t) dt`
- 6.5: Interpreting behavior of accumulation functions
- 6.6: Properties of definite integrals
- 6.7: FTC Part 2 — `∫_a^b f(x) dx = F(b) - F(a)`
- 6.8: Antiderivatives and indefinite integrals (basic rules)
- 6.9: u-Substitution
- 6.10: Long division and completing the square (for integration)
- 6.14: Selecting techniques for antidifferentiation

**BC only (OUT OF SCOPE):** 6.11 (integration by parts), 6.12 (partial fractions), 6.13 (improper integrals)

**Learning Objectives:**
- CHA-4.A: Area under rate-of-change function = accumulation
- LIM-5.A: Riemann sums approximate definite integrals
- LIM-5.B: Definite integral as limit of Riemann sum
- FUN-5.A: FTC Part 1 — `\frac{d}{dx}\int_a^x f(t)dt = f(x)`
- FUN-5.B: FTC Part 2 — evaluation theorem
- FUN-6.A: Antiderivative rules; indefinite integrals
- FUN-6.B: u-Substitution technique

**Key Formulas:**
- Left Riemann sum: `\sum_{i=0}^{n-1} f(x_i) \Delta x`
- Right Riemann sum: `\sum_{i=1}^{n} f(x_i) \Delta x`
- Midpoint Riemann sum: `\sum_{i=1}^{n} f\left(\frac{x_{i-1}+x_i}{2}\right) \Delta x`
- Trapezoidal Rule: `\frac{\Delta x}{2}[f(x_0) + 2f(x_1) + \cdots + 2f(x_{n-1}) + f(x_n)]`
- FTC Part 1: `F'(x) = \frac{d}{dx}\int_a^x f(t)\,dt = f(x)`
- FTC Part 2: `\int_a^b f(x)\,dx = F(b) - F(a)`
- Power Rule (integrals): `\int x^n\,dx = \frac{x^{n+1}}{n+1} + C` (n ≠ -1)
- `\int e^x\,dx = e^x + C`
- `\int \frac{1}{x}\,dx = \ln|x| + C`
- `\int \cos x\,dx = \sin x + C`
- `\int \sin x\,dx = -\cos x + C`
- `\int \sec^2 x\,dx = \tan x + C`
- u-substitution: `\int f(g(x))g'(x)\,dx = \int f(u)\,du`

**is_key_term candidates (8–15):**
Riemann sum, definite integral, indefinite integral, antiderivative, FTC Part 1, FTC Part 2, u-substitution, accumulation function, trapezoidal rule, net area, constant of integration

**Drill mode breakdown:**
- `name_to_formula`: FTC Part 1, FTC Part 2, power rule for integrals, integral of e^x, integral of sin/cos, u-substitution formula, Trapezoidal Rule
- `definition_to_term`: Riemann sum, antiderivative, definite integral, accumulation, net change, u-substitution (description)

---

### Unit 7: Differential Equations (6–12%)
**Topics (from CED):** 7.1–7.9 (AB topics; 7.5 and 7.9 are BC only)
**AB Topics:** 7.1–7.4, 7.6–7.8
- 7.1: Modeling situations with differential equations
- 7.2: Verifying solutions for differential equations
- 7.3: Sketching slope fields
- 7.4: Reasoning using slope fields
- 7.5: Euler's method — **BC only, OUT OF SCOPE**
- 7.6: Separation of variables (general solutions)
- 7.7: Particular solutions using initial conditions
- 7.8: Exponential growth and decay models

**BC only (OUT OF SCOPE):** 7.5 (Euler's method), 7.9 (logistic models)

**Learning Objectives:**
- FUN-7.A: Write differential equations from verbal descriptions
- FUN-7.B: Verify solutions to differential equations
- FUN-7.C: Slope fields — draw and interpret
- FUN-7.D: Separation of variables for general solutions
- FUN-7.E: Particular solutions with initial conditions
- FUN-7.F: Exponential model `dy/dt = ky` → `y = Ce^{kt}`

**Key Formulas:**
- Separable ODE general form: separate `g(y)dy = f(x)dx`, then integrate both sides
- Exponential growth/decay: `\frac{dy}{dt} = ky` → `y = Ce^{kt}`
- Particular solution: use initial condition to solve for `C`

**is_key_term candidates (8–15):**
differential equation, slope field, separation of variables, general solution, particular solution, initial condition, exponential growth, exponential decay, separable differential equation

**Drill mode breakdown:**
- `name_to_formula`: exponential growth model formula, general separable ODE approach
- `definition_to_term`: differential equation, slope field, general solution, particular solution, separation of variables, initial condition, exponential growth model

---

### Unit 8: Applications of Integration (10–15%)
**Topics (from CED):** 8.1–8.12 (8.13 is BC only)
**AB Topics:** 8.1–8.12
- 8.1: Average value of a function on an interval
- 8.2: Position, velocity, acceleration using integrals
- 8.3: Accumulation and net change in applied contexts
- 8.4–8.6: Area between curves (functions of x and y; intersecting more than twice)
- 8.7–8.8: Volumes with cross sections (squares, rectangles, triangles, semicircles)
- 8.9–8.10: Volume — Disc method (x-axis, y-axis, other axes)
- 8.11–8.12: Volume — Washer method (x-axis, y-axis, other axes)

**BC only (OUT OF SCOPE):** 8.13 (arc length)

**Learning Objectives:**
- CHA-4.D: Average value of f on [a,b]
- CHA-4.E: Position and displacement via integrals
- CHA-5.A: Area between curves
- CHA-5.B: Volumes with cross sections
- CHA-5.C: Disc/washer method for volumes of revolution

**Key Formulas:**
- Average value: `f_{avg} = \frac{1}{b-a}\int_a^b f(x)\,dx`
- Net change (displacement): `\int_a^b v(t)\,dt`
- Total distance: `\int_a^b |v(t)|\,dt`
- Area between curves (x): `\int_a^b [f(x) - g(x)]\,dx` where `f(x) \geq g(x)`
- Area between curves (y): `\int_c^d [f(y) - g(y)]\,dy`
- Volume (cross sections — squares): `\int_a^b [s(x)]^2\,dx`
- Volume (disc): `\pi\int_a^b [f(x)]^2\,dx`
- Volume (washer): `\pi\int_a^b \left([f(x)]^2 - [g(x)]^2\right)\,dx`

**is_key_term candidates (8–15):**
average value of a function, displacement, total distance, area between curves, volume of revolution, disc method, washer method, cross-sectional volume, net change theorem

**Drill mode breakdown:**
- `name_to_formula`: average value formula, displacement formula, area between curves, disc method, washer method
- `definition_to_term`: average value, displacement vs total distance, disc method, washer method, net change, cross-sectional volume

---

## Formula Sheet Policy
**No formula sheet is provided on the AP Calculus AB exam.** Students must memorize all derivative rules, integral rules, and theorem statements. This is why `name_to_formula` drills are the primary mode for this subject.
