# AP Calculus AB — Content Plan

> **STATUS: complete**
> Derived entirely from RESEARCH.md (which was derived from the local CED PDF).

---

## Global Targets

| Unit | Name | MCQ Count | Easy | Med | Hard | Stimulus Rate | Drill Count (approx) |
|------|------|-----------|------|-----|------|---------------|----------------------|
| 1 | Limits and Continuity | 55 | 11 | 25 | 19 | 80% | 28 |
| 2 | Differentiation: Definition & Fund. Properties | 55 | 11 | 25 | 19 | 80% | 32 |
| 3 | Differentiation: Composite, Implicit, Inverse | 50 | 10 | 23 | 17 | 80% | 28 |
| 4 | Contextual Applications of Differentiation | 55 | 11 | 25 | 19 | 80% | 28 |
| 5 | Analytical Applications of Differentiation | 65 | 13 | 29 | 23 | 80% | 32 |
| 6 | Integration and Accumulation of Change | 70 | 14 | 32 | 24 | 80% | 38 |
| 7 | Differential Equations | 50 | 10 | 23 | 17 | 80% | 25 |
| 8 | Applications of Integration | 55 | 11 | 25 | 19 | 80% | 32 |
| **TOTAL** | | **455** | | | | | **~243** |

**Difficulty targets per unit:** 20% easy / 45% medium / 35% hard (±5%)
**Stimulus rate:** ≥80% of MCQ questions have stimulus (chart, table, or text)
**Calculator notes:** Questions using numerical answers or graphs tagged as "calculator-appropriate" in difficulty; no-calculator questions emphasize symbolic manipulation

---

## Unit 1: Limits and Continuity

### MCQ Plan (55 questions)
- **Easy (11):** Direct limit evaluation, one-sided limits from graphs, identifying types of discontinuities, basic continuity check
- **Medium (25):** Limits involving algebraic manipulation, Squeeze Theorem applications, continuity on intervals, piecewise functions, IVT applications, limits at infinity
- **Hard (19):** Indeterminate forms requiring algebraic manipulation, complex piecewise continuity, composite limit problems, IVT proofs, analyzing limit behavior from multiple representations

**Topics to cover:**
- Estimating limits from graphs and tables (stimulus: chart/table)
- One-sided limits and limit existence
- Algebraic manipulation of limits (factoring, conjugates, trig limits)
- Squeeze Theorem
- Continuity at a point (3-condition check)
- Types of discontinuities (removable, jump, vertical asymptote)
- Removing discontinuities
- Infinite limits and vertical asymptotes
- Limits at infinity and horizontal asymptotes
- Intermediate Value Theorem

**Stimulus distribution:**
- Charts (function graphs): ~25 questions — reading limits graphically
- Tables (numerical approach): ~10 questions — estimating limits from tables
- Text (contextual): ~9 questions — IVT, verbal descriptions

### Drill Plan (28 cards)
**name_to_formula (15 cards):**
1. Limit notation: `\lim_{x \to c} f(x) = L`
2. Left-hand limit: `\lim_{x \to c^-} f(x)`
3. Right-hand limit: `\lim_{x \to c^+} f(x)`
4. Limit at positive infinity: `\lim_{x \to \infty} f(x)`
5. Continuity 3-condition: f(c) exists, lim exists, lim = f(c)
6. Squeeze Theorem: `g(x) \leq f(x) \leq h(x)` with same limit → `\lim f(x) = L`
7. IVT statement: continuous on [a,b], d between f(a) and f(b) → ∃c with f(c)=d
8. One-sided limit existence: lim exists iff left = right
9. Infinite limit notation: `\lim_{x \to c} f(x) = \infty`
10. Known trig limit: `\lim_{x \to 0} \frac{\sin x}{x} = 1`
11. Known trig limit: `\lim_{x \to 0} \frac{1 - \cos x}{x} = 0`
12. Vertical asymptote condition
13. Horizontal asymptote condition
14. Removable discontinuity definition
15. Limit properties (sum/product/quotient)

**definition_to_term (13 cards):**
1. Limit at a point (definition)
2. One-sided limit
3. Removable discontinuity
4. Jump discontinuity
5. Vertical asymptote
6. Horizontal asymptote
7. Continuity at a point
8. Continuity on an interval
9. Squeeze Theorem
10. Intermediate Value Theorem
11. Indeterminate form 0/0
12. Infinite limit
13. Limit at infinity

**is_key_term: true** on: limit notation, one-sided limit, continuity 3-condition, Squeeze Theorem, IVT statement, removable discontinuity, jump discontinuity, vertical asymptote, horizontal asymptote (9 cards)

---

## Unit 2: Differentiation: Definition and Fundamental Properties

### MCQ Plan (55 questions)
- **Easy (11):** Direct application of power rule, sum/difference, constant multiple; derivative of e^x or sin x
- **Medium (25):** Product rule, quotient rule, tangent line equations, trig derivatives, estimating derivatives from tables/graphs, differentiability vs continuity
- **Hard (19):** Complex combinations of rules, interpretation of derivative in analytical/graphical representations, limit as definition of derivative, higher order

**Topics:**
- Difference quotient and derivative definition
- Derivative notation (f'(x), y', dy/dx)
- Power rule and combinations
- Trig derivatives (sin, cos, tan, sec, csc, cot)
- e^x and ln x derivatives
- Product and quotient rules
- Tangent line equations
- Differentiability and continuity relationship
- Estimating from tables and graphs

**Stimulus distribution:**
- Charts (function graphs): ~20 questions
- Tables (function values): ~15 questions
- Text (contextual): ~9 questions

### Drill Plan (32 cards)
**name_to_formula (22 cards):**
1. Derivative definition (limit form): `f'(x) = \lim_{h \to 0} \frac{f(x+h)-f(x)}{h}`
2. Average rate of change: `\frac{f(b)-f(a)}{b-a}`
3. Power Rule: `\frac{d}{dx}[x^n] = nx^{n-1}`
4. Constant Rule: `\frac{d}{dx}[c] = 0`
5. Sum Rule: `\frac{d}{dx}[f+g] = f'+g'`
6. Constant Multiple: `\frac{d}{dx}[cf] = cf'`
7. Product Rule: `\frac{d}{dx}[fg] = f'g + fg'`
8. Quotient Rule: `\frac{d}{dx}\left[\frac{f}{g}\right] = \frac{f'g - fg'}{g^2}`
9. d/dx[sin x]: `\cos x`
10. d/dx[cos x]: `-\sin x`
11. d/dx[e^x]: `e^x`
12. d/dx[ln x]: `\frac{1}{x}`
13. d/dx[tan x]: `\sec^2 x`
14. d/dx[cot x]: `-\csc^2 x`
15. d/dx[sec x]: `\sec x \tan x`
16. d/dx[csc x]: `-\csc x \cot x`
17. Tangent line: `y - f(a) = f'(a)(x-a)`
18. Normal line slope: `-\frac{1}{f'(a)}`
19. Second derivative notation: `f''(x)` or `\frac{d^2y}{dx^2}`
20. Differentiability implies: continuous but not vice versa
21. Difference quotient (alternate): `\frac{f(x) - f(a)}{x - a}`
22. d/dx[x]: `1` (special case of power rule)

**definition_to_term (10 cards):**
1. Derivative at a point
2. Instantaneous rate of change
3. Average rate of change
4. Tangent line to a curve
5. Differentiability
6. Continuity at a point
7. Second derivative
8. Normal line
9. Difference quotient
10. Slope of tangent line

**is_key_term: true** on: derivative definition, power rule, product rule, quotient rule, d/dx[sin x], d/dx[cos x], d/dx[e^x], d/dx[ln x], d/dx[tan x], tangent line equation (10 cards)

---

## Unit 3: Differentiation: Composite, Implicit, and Inverse Functions

### MCQ Plan (50 questions)
- **Easy (10):** Direct chain rule application on simple composites, basic implicit differentiation, known inverse trig derivatives
- **Medium (23):** Chain rule with nested composites, implicit differentiation for dy/dx, inverse function derivative at a point, higher-order derivatives
- **Hard (17):** Multiple rules combined (chain + product, chain + quotient), implicit differentiation for tangent lines, arctan/arcsin with chain rule, second derivatives implicitly

**Topics:**
- Chain Rule for composites
- Leibniz notation for chain rule (dy/dx = dy/du · du/dx)
- Implicit differentiation
- Inverse function derivative formula
- Derivatives of arcsin, arccos, arctan
- Higher-order derivatives
- Selecting appropriate differentiation procedures

**Stimulus distribution:**
- Charts: ~15 questions (tangent lines, derivative graphs)
- Tables: ~10 questions (function and derivative values)
- Text: ~15 questions (contextual chain rule, related rates preview)

### Drill Plan (28 cards)
**name_to_formula (17 cards):**
1. Chain Rule: `\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x)`
2. Leibniz Chain Rule: `\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}`
3. Inverse function derivative: `(f^{-1})'(x) = \frac{1}{f'(f^{-1}(x))}`
4. d/dx[arcsin x]: `\frac{1}{\sqrt{1-x^2}}`
5. d/dx[arccos x]: `-\frac{1}{\sqrt{1-x^2}}`
6. d/dx[arctan x]: `\frac{1}{1+x^2}`
7. d/dx[arccot x]: `-\frac{1}{1+x^2}`
8. d/dx[arcsec x]: `\frac{1}{|x|\sqrt{x^2-1}}`
9. d/dx[arccsc x]: `-\frac{1}{|x|\sqrt{x^2-1}}`
10. Second derivative notation: `\frac{d^2y}{dx^2}`
11. Implicit diff step: differentiate both sides with respect to x; use chain rule for y terms
12. Chain rule applied to sin(u): `\cos(u) \cdot u'`
13. Chain rule applied to e^u: `e^u \cdot u'`
14. Chain rule applied to ln(u): `\frac{u'}{u}`
15. Chain rule applied to u^n: `nu^{n-1} \cdot u'`
16. Third derivative notation: `f'''(x)` or `\frac{d^3y}{dx^3}`
17. Composite function notation: `(f \circ g)(x) = f(g(x))`

**definition_to_term (11 cards):**
1. Chain Rule
2. Composite function
3. Implicit differentiation
4. Explicit function
5. Inverse function
6. Inverse trigonometric function
7. Higher-order derivative
8. Leibniz notation
9. arcsin (inverse sine)
10. arctan (inverse tangent)
11. Differentiating implicitly

**is_key_term: true** on: Chain Rule, Leibniz Chain Rule, implicit differentiation, inverse function derivative, d/dx[arcsin x], d/dx[arctan x], composite function, higher-order derivative (8 cards)

---

## Unit 4: Contextual Applications of Differentiation

### MCQ Plan (55 questions)
- **Easy (11):** Read velocity from position function, acceleration from velocity, identify linearization formula, basic L'Hôpital's
- **Medium (25):** Related rates problems (area, volume, distance), linearization calculations, interpreting derivative in context with units, L'Hôpital's with trig/exp/log forms
- **Hard (19):** Complex related rates (multiple steps), overestimate vs underestimate of linearization, indeterminate forms requiring repeated L'Hôpital's, real-world optimization setup

**Topics:**
- Position, velocity, acceleration (s'(t)=v(t), v'(t)=a(t), |v(t)|=speed)
- Interpreting derivative with units
- Related rates (Pythagorean, area/volume, shadow)
- Linearization / local linear approximation
- L'Hôpital's Rule (0/0, ∞/∞)

**Stimulus distribution:**
- Charts (position/velocity/acceleration): ~20 questions
- Tables (function values for linearization/rates): ~12 questions
- Text (related rates, contextual): ~12 questions

### Drill Plan (28 cards)
**name_to_formula (14 cards):**
1. Velocity formula: `v(t) = s'(t)`
2. Acceleration formula: `a(t) = v'(t) = s''(t)`
3. Speed: `|v(t)|`
4. Linearization: `L(x) = f(a) + f'(a)(x - a)`
5. L'Hôpital's Rule: `\lim_{x \to c} \frac{f(x)}{g(x)} = \lim_{x \to c} \frac{f'(x)}{g'(x)}`
6. L'Hôpital condition 0/0: applies when `\lim f = \lim g = 0`
7. L'Hôpital condition ∞/∞: applies when `\lim |f| = \lim |g| = \infty`
8. Related rates chain rule: `\frac{dV}{dt} = \frac{dV}{dr} \cdot \frac{dr}{dt}`
9. Circle area: `A = \pi r^2` → `\frac{dA}{dt} = 2\pi r \frac{dr}{dt}`
10. Sphere volume: `V = \frac{4}{3}\pi r^3` → `\frac{dV}{dt} = 4\pi r^2 \frac{dr}{dt}`
11. Pythagorean: `x^2 + y^2 = z^2`
12. Normal approximation error: `f(x) \approx L(x)` for x near a
13. Position from velocity: `s(t) = \int v(t)\,dt`
14. Net displacement: `\int_a^b v(t)\,dt`

**definition_to_term (14 cards):**
1. Position function
2. Velocity
3. Acceleration
4. Speed (vs velocity)
5. Related rates
6. Linearization
7. Local linear approximation
8. L'Hôpital's Rule
9. Indeterminate form 0/0
10. Indeterminate form ∞/∞
11. Overestimate vs underestimate (linearization)
12. Rate of change with units
13. Independent variable in related rates
14. Implicit differentiation in related rates

**is_key_term: true** on: velocity formula, acceleration formula, linearization formula, L'Hôpital's Rule, related rates, speed, position function, indeterminate form (8 cards)

---

## Unit 5: Analytical Applications of Differentiation

### MCQ Plan (65 questions)
- **Easy (13):** Apply MVT to confirm existence, identify critical points, use sign chart for increasing/decreasing
- **Medium (29):** EVT on closed interval, First Derivative Test, Candidates Test, concavity from f'', Second Derivative Test, graph reading
- **Hard (23):** Optimization problems, implicit relations analysis, connecting f/f'/f'' behavior, justifying conclusions using theorems, sketching derivative graphs

**Topics:**
- Mean Value Theorem (MVT): applications and justification
- Extreme Value Theorem (EVT): closed interval method
- Critical points (f'(c) = 0 or undefined)
- Increasing/decreasing intervals from f'
- First Derivative Test for local extrema
- Candidates Test for absolute extrema
- Concavity from f'': concave up/down, inflection points
- Second Derivative Test
- Connecting f, f', f'' graphs
- Optimization (setup and solve)

**Stimulus distribution:**
- Charts: ~30 questions (graphs of f, f', f'')
- Tables: ~10 questions (function values)
- Text: ~12 questions (optimization word problems, theorem applications)

### Drill Plan (32 cards)
**name_to_formula (18 cards):**
1. MVT: `f'(c) = \frac{f(b) - f(a)}{b - a}` for some c in (a,b)
2. MVT conditions: f continuous on [a,b], differentiable on (a,b)
3. EVT: if f continuous on [a,b], then f attains absolute max and min on [a,b]
4. Critical point condition: `f'(c) = 0` or `f'(c)` undefined
5. Increasing test: `f'(x) > 0` on interval → f increasing
6. Decreasing test: `f'(x) < 0` on interval → f decreasing
7. Concave up test: `f''(x) > 0`
8. Concave down test: `f''(x) < 0`
9. Inflection point: `f''` changes sign at x=c
10. First Derivative Test (local max): f' changes + to -
11. First Derivative Test (local min): f' changes - to +
12. Second Derivative Test (local min): `f'(c)=0` and `f''(c)>0`
13. Second Derivative Test (local max): `f'(c)=0` and `f''(c)<0`
14. Candidates Test: evaluate f at critical points and endpoints; largest = abs max
15. Absolute maximum on [a,b]: largest value among f(critical points) and f(endpoints)
16. Average rate of change = MVT slope: `\frac{f(b)-f(a)}{b-a}`
17. Second derivative notation: `f''(x)`
18. Optimization setup: define quantity, express in one variable, differentiate, solve f'=0

**definition_to_term (14 cards):**
1. Mean Value Theorem
2. Extreme Value Theorem
3. Critical point
4. Relative (local) maximum
5. Relative (local) minimum
6. Absolute (global) maximum
7. Absolute (global) minimum
8. Increasing function
9. Decreasing function
10. Concavity
11. Inflection point
12. First Derivative Test
13. Second Derivative Test
14. Candidates Test (closed interval method)

**is_key_term: true** on: MVT formula, EVT, critical point, First Derivative Test, Second Derivative Test, Candidates Test, concave up/down, inflection point, increasing/decreasing test (9 cards)

---

## Unit 6: Integration and Accumulation of Change

### MCQ Plan (70 questions)
- **Easy (14):** Basic antiderivative rules (power, e^x, trig), FTC Part 2 direct evaluation, simple Riemann sum setup
- **Medium (32):** Riemann sums (left, right, midpoint, trap), FTC Part 1 with chain rule, u-substitution, interpreting accumulation functions, definite integral properties
- **Hard (24):** Complex u-substitution (nested), FTC Part 1 with chain rule in hard contexts, long division integration, completing the square, selecting techniques

**Topics:**
- Riemann sums (left, right, midpoint, trapezoidal rule)
- Definite integral notation and properties
- FTC Part 1 (accumulation functions)
- FTC Part 2 (evaluation theorem)
- Basic antiderivative rules (power, trig, exp, log)
- u-Substitution
- Long division and completing the square for integration
- Net area and signed area

**Stimulus distribution:**
- Charts (function graphs, area regions): ~30 questions
- Tables (Riemann sums from data): ~18 questions
- Text (accumulation contexts): ~8 questions

### Drill Plan (38 cards)
**name_to_formula (24 cards):**
1. FTC Part 1: `\frac{d}{dx}\int_a^x f(t)\,dt = f(x)`
2. FTC Part 1 (chain rule form): `\frac{d}{dx}\int_a^{g(x)} f(t)\,dt = f(g(x)) \cdot g'(x)`
3. FTC Part 2: `\int_a^b f(x)\,dx = F(b) - F(a)`
4. Power rule (integral): `\int x^n\,dx = \frac{x^{n+1}}{n+1} + C`
5. `\int e^x\,dx = e^x + C`
6. `\int \frac{1}{x}\,dx = \ln|x| + C`
7. `\int \cos x\,dx = \sin x + C`
8. `\int \sin x\,dx = -\cos x + C`
9. `\int \sec^2 x\,dx = \tan x + C`
10. `\int \csc^2 x\,dx = -\cot x + C`
11. `\int \sec x \tan x\,dx = \sec x + C`
12. `\int \csc x \cot x\,dx = -\csc x + C`
13. Constant: `\int c\,dx = cx + C`
14. Left Riemann sum: `\sum_{i=0}^{n-1} f(x_i) \Delta x`
15. Right Riemann sum: `\sum_{i=1}^{n} f(x_i) \Delta x`
16. Midpoint Riemann sum: `\sum_{i=1}^{n} f\!\left(\frac{x_{i-1}+x_i}{2}\right)\Delta x`
17. Trapezoidal Rule: `\frac{\Delta x}{2}\left[f(x_0)+2f(x_1)+\cdots+2f(x_{n-1})+f(x_n)\right]`
18. u-substitution: `\int f(g(x))g'(x)\,dx = \int f(u)\,du`
19. Reversal property: `\int_a^b f\,dx = -\int_b^a f\,dx`
20. Splitting: `\int_a^c f\,dx = \int_a^b f\,dx + \int_b^c f\,dx`
21. Constant factor: `\int_a^b cf\,dx = c\int_a^b f\,dx`
22. Net area (signed area under curve)
23. Accumulation function: `F(x) = \int_a^x f(t)\,dt`
24. `\int k\,dx = kx + C`

**definition_to_term (14 cards):**
1. Definite integral
2. Indefinite integral
3. Antiderivative
4. Riemann sum
5. FTC Part 1
6. FTC Part 2
7. Accumulation function
8. u-Substitution
9. Net area
10. Constant of integration
11. Trapezoidal Rule
12. Left/Right/Midpoint Riemann sum
13. Interval of integration
14. Integrand

**is_key_term: true** on: FTC Part 1, FTC Part 2, power rule (integral), integral of e^x, integral of cos/sin, u-substitution, Trapezoidal Rule, Riemann sum, accumulation function, definite integral, antiderivative (11 cards)

---

## Unit 7: Differential Equations

### MCQ Plan (50 questions)
- **Easy (10):** Verify a solution satisfies a DE, identify slope field for simple DEs, simple separation of variables, direct exponential model
- **Medium (23):** Sketch slope fields, separation of variables with initial conditions, exponential growth/decay applications, interpret slope fields geometrically
- **Hard (17):** Complex separation of variables (transcendental), identifying solution curves on slope fields, exponential model with context, DE setup from verbal description

**Topics (AB only — no Euler's method, no logistic model):**
- Modeling with differential equations
- Verifying solutions (substitution check)
- Slope fields (sketch and interpret)
- Separation of variables (general solutions)
- Initial value problems (particular solutions)
- Exponential growth and decay: dy/dt = ky → y = Ce^(kt)

**Stimulus distribution:**
- Charts (slope fields): ~25 questions
- Tables: ~5 questions
- Text: ~14 questions (contextual DEs, growth/decay)

### Drill Plan (25 cards)
**name_to_formula (10 cards):**
1. Exponential growth/decay model: `\frac{dy}{dt} = ky`
2. Exponential solution: `y = Ce^{kt}`
3. Particular solution from initial condition y(0)=y₀: `y = y_0 e^{kt}`
4. Separation of variables step 1: `\frac{dy}{g(y)} = f(x)\,dx`
5. General solution form after separation: `\int \frac{dy}{g(y)} = \int f(x)\,dx`
6. Slope at a point (from DE): `\frac{dy}{dx} = F(x,y)` gives slope at (x,y)
7. Verifying solution: substitute y and dy/dx into DE and check equality
8. Doubling time: `t = \frac{\ln 2}{k}` (for exponential growth)
9. Half-life: `t_{1/2} = \frac{\ln 2}{k}` (for exponential decay, k>0)
10. Separating: `\frac{dy}{dx} = \frac{x}{y}` → `y\,dy = x\,dx`

**definition_to_term (15 cards):**
1. Differential equation
2. Slope field
3. Solution to a differential equation
4. General solution
5. Particular solution
6. Initial condition
7. Initial value problem
8. Separation of variables
9. Exponential growth
10. Exponential decay
11. Rate constant k
12. Separable differential equation
13. Verify a solution (method)
14. Solution curve
15. Autonomous differential equation

**is_key_term: true** on: differential equation, slope field, separation of variables, general solution, particular solution, initial condition, exponential growth formula, exponential decay, separable DE (9 cards)

---

## Unit 8: Applications of Integration

### MCQ Plan (55 questions)
- **Easy (11):** Average value formula application, net displacement from velocity, basic area between two curves
- **Medium (25):** Area between curves with multiple intersections, disc method setup, washer method setup, accumulation applied context, net change
- **Hard (19):** Volumes with various cross sections, washer method around non-axis lines, area between curves as functions of y, total distance from velocity

**Topics:**
- Average value of a function
- Displacement and total distance from velocity
- Net change theorem
- Area between curves (functions of x and y)
- Volumes: cross sections (squares, rectangles, triangles, semicircles)
- Volumes: disc method (x-axis, y-axis, other axes)
- Volumes: washer method

**Stimulus distribution:**
- Charts (function graphs, regions): ~30 questions
- Tables (velocity data, function values): ~10 questions
- Text (contextual): ~9 questions

### Drill Plan (32 cards)
**name_to_formula (20 cards):**
1. Average value: `f_{avg} = \frac{1}{b-a}\int_a^b f(x)\,dx`
2. Displacement: `\int_a^b v(t)\,dt`
3. Total distance: `\int_a^b |v(t)|\,dt`
4. Net change: `\int_a^b f'(x)\,dx = f(b) - f(a)`
5. Area between curves (x): `\int_a^b [f(x) - g(x)]\,dx` where f ≥ g
6. Area between curves (y): `\int_c^d [f(y) - g(y)]\,dy` where f ≥ g
7. Volume (cross section — square): `\int_a^b [s(x)]^2\,dx`
8. Volume (cross section — equilateral triangle): `\int_a^b \frac{\sqrt{3}}{4}[s(x)]^2\,dx`
9. Volume (cross section — semicircle): `\int_a^b \frac{\pi}{8}[d(x)]^2\,dx`
10. Volume (disc — x-axis): `\pi\int_a^b [f(x)]^2\,dx`
11. Volume (disc — y-axis): `\pi\int_c^d [f(y)]^2\,dy`
12. Volume (washer — x-axis): `\pi\int_a^b \left([R(x)]^2 - [r(x)]^2\right)\,dx`
13. Volume (washer — y-axis): `\pi\int_c^d \left([R(y)]^2 - [r(y)]^2\right)\,dy`
14. Position from initial position and velocity: `s(t) = s(0) + \int_0^t v(\tau)\,d\tau`
15. Average value theorem: FVT (if fₐᵥg = f(c) for some c in [a,b])
16. Volume (disc — other axis y=k): `\pi\int_a^b [f(x)-k]^2\,dx`
17. Volume (washer — other axis): `\pi\int_a^b\left([R(x)]^2 - [r(x)]^2\right)\,dx` with adjusted radii
18. Finding intersection points: set f(x)=g(x), solve
19. Riemann sum for area: `\sum f(x_i^*)\Delta x` → `\int f(x)\,dx`
20. Area between intersecting curves: split integral at intersection points

**definition_to_term (12 cards):**
1. Average value of a function
2. Displacement
3. Total distance traveled
4. Net change
5. Area between curves
6. Cross-sectional volume
7. Disc method
8. Washer method
9. Outer radius (R)
10. Inner radius (r)
11. Volume of revolution
12. Net change theorem

**is_key_term: true** on: average value formula, displacement, total distance, area between curves, disc method, washer method, volume of revolution, net change theorem, cross-sectional volume (9 cards)

---

## KaTeX Formula Standards

All formulas use `$...$` for inline math in core_concepts and text fields. All formula `katex_string` fields use raw LaTeX without delimiters. All drill `answer` fields for `name_to_formula` mode use raw LaTeX strings.

Standard KaTeX patterns used throughout:
- Derivatives: `\frac{d}{dx}[...]`
- Limits: `\lim_{x \to c}`
- Integrals: `\int_a^b ... \,dx`
- Fractions: `\frac{numerator}{denominator}`
- Square root: `\sqrt{...}`
- Powers: `x^{n-1}`
- Absolute value: `|...|`
- Greek letters: `\pi`, `\theta`, `\Delta`, `\infty`
