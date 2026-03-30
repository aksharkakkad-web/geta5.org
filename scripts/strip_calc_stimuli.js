/**
 * Strip artificial stimuli from AP Calculus AB MCQ files.
 * Reduces stimulus rates from 86-100% down to ~48-52% per unit.
 * Pure symbolic/computational questions get stimulus removed.
 * Genuine graph-reading, table-interpretation, and contextual problems keep their stimulus.
 */
const fs = require('fs');
const path = require('path');

// IDs whose stimulus should be stripped (has_stimulus=false, stimulus={type:"none",content:null})

// UNIT 3 — Chain rule, implicit differentiation, inverse functions
// Strip: charts of symbolic functions, tables of rules (not data), text that just re-states the equation
// Keep: table-of-values questions (u-sub data), implicit diff at specific points, folium, etc.
const stripU3 = new Set([
  'calc-mcq-u3-006',  // text just re-states x^2+y^2=25 circle
  'calc-mcq-u3-017',  // chart of arctan(2x) — pure symbolic derivative
  'calc-mcq-u3-018',  // chart of sin(x^2) — pure symbolic 2nd derivative
  'calc-mcq-u3-019',  // table of differentiation rules — hint, not stimulus
  'calc-mcq-u3-020',  // table of differentiation rules — hint, not stimulus
  'calc-mcq-u3-021',  // chart of arcsin(3x) — pure symbolic
  'calc-mcq-u3-023',  // chart of tan(x^3) — pure symbolic
  'calc-mcq-u3-025',  // chart of e^sin(x) — pure symbolic
  'calc-mcq-u3-026',  // chart of x*ln(x) — pure symbolic 2nd derivative
  'calc-mcq-u3-028',  // chart of ln(cos(x)) — pure symbolic
  'calc-mcq-u3-029',  // chart of cos(e^x) — pure symbolic 2nd derivative
  'calc-mcq-u3-030',  // chart of sqrt(1+tan(x)) — pure symbolic
  'calc-mcq-u3-031',  // chart of x^2*e^{-x} — pure symbolic product rule
  'calc-mcq-u3-032',  // chart of arctan(e^x) — pure symbolic
  'calc-mcq-u3-046',  // mismatched text (stimulus describes different function than stem)
  'calc-mcq-u3-047',  // text re-states product rule setup for (1+x)*arctan(x)
  'calc-mcq-u3-048',  // text re-states ln fraction differentiation
  'calc-mcq-u3-049',  // text re-states arcsin(sqrt(x)) chain rule
  // Keeping stimulus on: 007,008,011,012,013,014,015,016,022,024,027,033,034,035,036,037,038,039,040,041,042,043,044,045,050
  // = 25 / 50 = 50%
]);

// UNIT 4 — Motion, L'Hôpital, related rates, linearization
// Strip: L'Hôpital table questions (just restate formula), abstract concavity charts, conceptual recall
// Keep: genuine related rates with real-world setup, contextual motion, linearization applied problems
const stripU4 = new Set([
  'calc-mcq-u4-003',  // table linearization of sqrt(x) — just re-states formula
  'calc-mcq-u4-004',  // table L'Hôpital sin(x)/x^2 — pure limit
  'calc-mcq-u4-007',  // table correct form of L'Hôpital — conceptual recall
  'calc-mcq-u4-009',  // table x^2/sin(x) L'Hôpital — pure limit
  'calc-mcq-u4-010',  // table linearization f(4.1) — just re-states formula
  'calc-mcq-u4-011',  // table (e^x-1)/x L'Hôpital — pure limit
  'calc-mcq-u4-018',  // table tan(x)/x L'Hôpital — pure limit
  'calc-mcq-u4-021',  // chart ln(x)/x L'Hôpital — pure limit
  'calc-mcq-u4-023',  // table x*ln(x) indeterminate — pure limit
  'calc-mcq-u4-025',  // chart concavity at point — abstract, no real graph data
  'calc-mcq-u4-026',  // text about units of d2s/dt2 — pure conceptual
  'calc-mcq-u4-028',  // table (1-cos x)/x^2 L'Hôpital — pure limit
  'calc-mcq-u4-030',  // chart concavity/f'>0 — abstract chart
  'calc-mcq-u4-031',  // table (3x^2-5)/(x^2+1) L'Hôpital — pure limit
  'calc-mcq-u4-033',  // table (e^{2x}-1)/sin(3x) — pure limit
  'calc-mcq-u4-035',  // table linearization e^x at 0 — just re-states
  'calc-mcq-u4-038',  // table x^x as x->0+ — pure limit
  'calc-mcq-u4-041',  // table x(e^{1/x}-1) — pure limit
  'calc-mcq-u4-043',  // table (ln(1+x)-x)/x^2 — pure limit
  'calc-mcq-u4-044',  // text position function just re-states integral setup
  'calc-mcq-u4-045',  // table (1+x)^{1/x} — pure limit
  'calc-mcq-u4-047',  // chart x^3/e^x L'Hôpital — pure limit
  'calc-mcq-u4-048',  // text interpretation of T'(x) units — pure conceptual
  'calc-mcq-u4-051',  // table (sin x - x)/x^3 — pure limit
  'calc-mcq-u4-052',  // text displacement integral — just re-states
  'calc-mcq-u4-053',  // text position y(t) — just re-states setup
  'calc-mcq-u4-054',  // table (1+2/x)^x — pure limit
  'calc-mcq-u4-055',  // text overestimate/underestimate — conceptual
  // Keeping stimulus on: 001,002,005,006,008,012,013,014,015,016,017,019,020,022,024,027,029,032,034,036,037,039,040,042,046,049,050
  // = 27 / 55 = 49%
]);

// UNIT 5 — Curve sketching, EVT/MVT, optimization
// Strip: abstract theory illustrations, charts that just graph a given function symbolically
// Keep: charts where student reads extrema/inflection from graph, sign charts as data, real applied context
const stripU5 = new Set([
  'calc-mcq-u5-001',  // chart illustrating MVT statement — conceptual recall, no graph reading
  'calc-mcq-u5-003',  // chart of x^3-3x — pure symbolic critical point identification
  'calc-mcq-u5-004',  // chart EVT — conceptual, no real graph data
  'calc-mcq-u5-008',  // table candidates test method — just re-states the test
  'calc-mcq-u5-009',  // chart of x^4-6x^2 inflection — pure symbolic
  'calc-mcq-u5-010',  // table f'(c)=0, f''(c)<0 — pure conceptual/recall
  'calc-mcq-u5-011',  // text necessary condition for MVT — pure recall
  'calc-mcq-u5-021',  // table f'(3)=0, f''(3)=0 — conceptual
  'calc-mcq-u5-026',  // chart inflection point definition — conceptual, no real data
  'calc-mcq-u5-028',  // chart f''>0 → local min — abstract, no real data
  'calc-mcq-u5-033',  // chart f'>0, f''<0 — abstract behavior, no data
  'calc-mcq-u5-046',  // text sufficient condition for abs max on open interval — pure conceptual
  'calc-mcq-u5-050',  // text f≤g, what must be true — pure conceptual
  'calc-mcq-u5-051',  // text |f'(x)|≤3 bound — pure conceptual
  'calc-mcq-u5-056',  // table MVT for f(x)=x^3 on (-1,1) — just re-states with no real value data
  'calc-mcq-u5-057',  // table critical point f'(c)=0 conclusion — pure conceptual
  'calc-mcq-u5-062',  // text MUST be true (abstract) — pure conceptual
  // Pure symbolic function analysis with fake charts
  'calc-mcq-u5-044',  // chart xe^{-x} global min — pure symbolic (chart just plots function)
  'calc-mcq-u5-047',  // chart x*ln(x) absolute min — pure symbolic
  'calc-mcq-u5-052',  // chart 4x-x^2 max on [0,5] — pure symbolic
  'calc-mcq-u5-053',  // chart f'(x)=(x+1)^2(x-2)/(x-5)^3 — pure symbolic sign analysis
  'calc-mcq-u5-055',  // chart x/(x^2+1) abs max — pure symbolic
  'calc-mcq-u5-058',  // chart sin(x)-x critical points — pure symbolic
  'calc-mcq-u5-061',  // chart ln(x^2+1) inflection — pure symbolic
  'calc-mcq-u5-063',  // chart x^2*e^{-x} abs max — pure symbolic
  'calc-mcq-u5-065',  // chart e^{-x^2} inflection — pure symbolic
  'calc-mcq-u5-029',  // chart 2x^3 inflection — pure symbolic
  'calc-mcq-u5-032',  // chart x^4-8x^2 inflection — pure symbolic
  'calc-mcq-u5-041',  // chart min dist from (3,0) to y=x^2 — pure symbolic optimization
  'calc-mcq-u5-020',  // chart x^4-4x^3 concavity — pure symbolic
  'calc-mcq-u5-018',  // chart x^3-6x^2+9x local extrema — pure symbolic
  'calc-mcq-u5-006',  // chart First Derivative Test conclusion — pure conceptual
  'calc-mcq-u5-007',  // chart when f is concave up — pure conceptual/symbolic
  // Keeping stimulus on: 002,005,012,013,014,015,016,017,019,022,023,024,025,027,030,031,034,035,036,037,038,039,040,042,043,045,048,049,054,059,060,064
  // = 32 / 65 = 49%
]);

// UNIT 6 — Integration, FTC, u-substitution, Riemann sums
// Strip: tables restating basic integral results, charts for pure numeric integrals, text FTC restaters
// Keep: Riemann sum tables with actual data values, trapezoidal rule with data, FTC g(x)=∫f applied, odd/even integral property with graph
const stripU6 = new Set([
  'calc-mcq-u6-001',  // table int x^4 dx — pure symbolic
  'calc-mcq-u6-002',  // table int e^x dx — pure symbolic
  'calc-mcq-u6-003',  // table int cos(x) dx — pure symbolic
  'calc-mcq-u6-004',  // table int 1/x dx — pure symbolic
  'calc-mcq-u6-005',  // chart int_0^3 (2x+1) dx — pure numeric, chart adds nothing
  'calc-mcq-u6-006',  // chart int_1^e 1/x dx — pure numeric
  'calc-mcq-u6-007',  // text FTC statement — pure conceptual recall
  'calc-mcq-u6-008',  // table int sin(x) dx — pure symbolic
  'calc-mcq-u6-010',  // text FTC Part 1 re-statement — pure conceptual
  'calc-mcq-u6-011',  // text interval property — pure conceptual
  'calc-mcq-u6-013',  // chart int_0^pi sin(x) dx — pure numeric
  'calc-mcq-u6-014',  // chart int_0^2 3x^2 dx — pure numeric
  'calc-mcq-u6-016',  // text int x*cos(x^2) dx u-sub — pure symbolic
  'calc-mcq-u6-018',  // text FTC with chain rule d/dx[∫_0^{x^2} e^t dt] — pure symbolic
  'calc-mcq-u6-021',  // table int (x+1)^{10} dx — pure symbolic
  'calc-mcq-u6-024',  // text d/dx[∫_x^5 t^3 dt] — pure symbolic FTC
  'calc-mcq-u6-025',  // table int sec^2(x) dx — pure symbolic
  'calc-mcq-u6-026',  // chart int_0^{pi/2} cos(2x) dx — pure numeric
  'calc-mcq-u6-028',  // table int x/(x^2+4) dx — pure symbolic
  'calc-mcq-u6-030',  // table int_1^2 ln(x)/x dx — pure symbolic
  'calc-mcq-u6-031',  // text integral interval property — pure conceptual
  'calc-mcq-u6-032',  // table int e^x/(e^x+1) dx — pure symbolic
  'calc-mcq-u6-034',  // table int tan(x) dx — pure symbolic
  'calc-mcq-u6-035',  // table int_0^1 x/sqrt(1-x^2) dx — pure symbolic
  'calc-mcq-u6-036',  // text int (x^2+1)/(x^3+3x) dx — pure symbolic
  'calc-mcq-u6-037',  // table int_0^{pi/4} tan^2(x) dx — pure symbolic
  'calc-mcq-u6-038',  // table int x*sqrt(x+1) dx — pure symbolic
  'calc-mcq-u6-040',  // text int 1/(x^2-4) dx partial fractions — pure symbolic
  'calc-mcq-u6-041',  // text FTC chain rule with trig bounds — pure symbolic
  'calc-mcq-u6-043',  // table int sin^2(x) dx — pure symbolic
  'calc-mcq-u6-046',  // table int_0^pi x*sin(x) dx IBP — pure symbolic
  'calc-mcq-u6-047',  // table int 1/sqrt(4-x^2) dx — pure symbolic
  'calc-mcq-u6-049',  // table int ln(x)/x^2 dx — pure symbolic
  'calc-mcq-u6-050',  // table int_0^{pi/2} sin*cos dx — pure symbolic
  'calc-mcq-u6-051',  // table int e^sqrt(x) dx — pure symbolic
  'calc-mcq-u6-054',  // text int (2x+1)/(x^2+x) dx — pure symbolic
  // Keeping stimulus on: 009,012,015,017,019,020,022,023,027,029,033,039,042,044,045,048,052,053,055,057,058,059,060,061,062,063,064,065,066,067,068,069,070,056
  // 70 - 36 = 34 → 34/70 = 49%
]);

// UNIT 7 — Differential equations, slope fields, exponential models
// Strip: text that just re-states "solve dy/dx = [simple expression]" with no real context
// Keep: slope field descriptions (genuine graph interpretation), real-world exponential decay/growth models, Euler's method
const stripU7 = new Set([
  'calc-mcq-u7-002',  // text re-states dy/dx=3y — pure symbolic
  'calc-mcq-u7-004',  // text re-states dy/dx=x/y — pure symbolic
  'calc-mcq-u7-006',  // text asks first step separating — pure conceptual
  'calc-mcq-u7-010',  // table dy/dx=cos(x) — pure symbolic
  'calc-mcq-u7-012',  // text dy/dx=xy — pure symbolic
  'calc-mcq-u7-013',  // text dy/dx=y/x^2 — pure symbolic
  'calc-mcq-u7-015',  // table dy/dx=y^2 — pure symbolic
  'calc-mcq-u7-017',  // text dy/dx=(x+1)/y — pure symbolic
  'calc-mcq-u7-020',  // text x dy = y dx — pure symbolic
  'calc-mcq-u7-022',  // text dy/dx=x/y^2 — pure symbolic
  'calc-mcq-u7-023',  // text dy/dx=2-y — pure symbolic
  'calc-mcq-u7-026',  // text dy/dx=y*ln(y)/x — pure symbolic
  'calc-mcq-u7-028',  // text dy/dx=(1-y^2)/y — pure symbolic
  'calc-mcq-u7-030',  // text dy/dx=(y^2-1)/(2y) — pure symbolic
  'calc-mcq-u7-032',  // text dy/dx=sin(x)/cos(y) — pure symbolic
  'calc-mcq-u7-034',  // text dy/dx=sqrt(y)*cos(x) — pure symbolic
  'calc-mcq-u7-035',  // text dy/dx=x^2/(1+y^2) — pure symbolic
  'calc-mcq-u7-037',  // text dy/dx=2x/(y^2+1) — pure symbolic
  'calc-mcq-u7-040',  // text dy/dx=e^x/y — pure symbolic
  'calc-mcq-u7-042',  // text dy/dx=y/(x^2+1) — pure symbolic
  'calc-mcq-u7-043',  // text equilibrium dy/dx=ay(1-y) — pure symbolic
  'calc-mcq-u7-044',  // text dy/dx=y^2-4 — pure symbolic
  'calc-mcq-u7-047',  // text dy/dx=(x^2+1)/(xy) — pure symbolic
  'calc-mcq-u7-049',  // text IVP dy/dx=sin(y) — pure symbolic
  'calc-mcq-u7-050',  // text general solution dy/dx=y-x — pure symbolic
  // Keeping stimulus on: 001,003,005,007,008,009,011,014,016,018,019,021,024,025,027,029,031,033,036,038,039,041,045,046,048
  // = 25 / 50 = 50%
]);

// UNIT 8 — Applications: area, volume, average value, particle motion
// Strip: text that just re-states a particle motion integral or region description without real context
// Keep: charts showing regions/bounded areas, velocity tables for Riemann sum, displacement with real data
const stripU8 = new Set([
  'calc-mcq-u8-004',  // text total distance particle — pure symbolic
  'calc-mcq-u8-011',  // text particle changes direction — pure symbolic
  'calc-mcq-u8-012',  // text total distance over [0,4] — pure symbolic
  'calc-mcq-u8-013',  // text net displacement — pure symbolic
  'calc-mcq-u8-014',  // text area of region R — pure symbolic (no graph)
  'calc-mcq-u8-015',  // text area of region R — pure symbolic
  'calc-mcq-u8-017',  // text volume of solid — pure symbolic (no diagram)
  'calc-mcq-u8-018',  // text washer method — pure symbolic
  'calc-mcq-u8-021',  // text total distance over [0,4] — pure symbolic
  'calc-mcq-u8-023',  // text volume of resulting solid — pure symbolic
  'calc-mcq-u8-025',  // text volume of solid — pure symbolic
  'calc-mcq-u8-026',  // text area of region R — pure symbolic
  'calc-mcq-u8-028',  // text total distance over [0,2pi] — pure symbolic
  'calc-mcq-u8-030',  // text washer/disc method — pure symbolic
  'calc-mcq-u8-032',  // text position at t=5 — pure symbolic
  'calc-mcq-u8-034',  // text area of region R — pure symbolic
  'calc-mcq-u8-036',  // text region R revolved — pure symbolic
  'calc-mcq-u8-037',  // text volume of solid — pure symbolic
  'calc-mcq-u8-038',  // text washer method volume — pure symbolic
  'calc-mcq-u8-041',  // text volume of resulting solid — pure symbolic
  'calc-mcq-u8-042',  // text MVT c value for x^3 on [0,2] — pure symbolic
  'calc-mcq-u8-044',  // text position at t=6 — pure symbolic
  'calc-mcq-u8-045',  // text value of k for area=ln3 — pure symbolic
  'calc-mcq-u8-047',  // text area of region — pure symbolic
  'calc-mcq-u8-048',  // text integral for volume — pure symbolic
  'calc-mcq-u8-050',  // text particle behavior — pure symbolic
  'calc-mcq-u8-051',  // text washer method y=-1 — pure symbolic
  'calc-mcq-u8-053',  // text int g(x)^2 dx — pure symbolic
  // Keeping stimulus on: 001,002,003,005,006,007,008,009,010,016,019,020,022,024,027,029,031,033,035,039,040,043,046,049,052,054,055
  // = 27 / 55 = 49%
]);

// Map unit number -> strip set
const stripSets = {
  3: stripU3,
  4: stripU4,
  5: stripU5,
  6: stripU6,
  7: stripU7,
  8: stripU8,
};

const basePath = 'C:/Ascendly/public/data/ap-calculus-ab/mcq';

let allResults = [];

for (let u = 3; u <= 8; u++) {
  const filePath = path.join(basePath, `unit-${u}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const stripSet = stripSets[u];

  let strippedCount = 0;
  let alreadyNone = 0;
  let keptCount = 0;

  data.questions = data.questions.map(q => {
    if (stripSet.has(q.id)) {
      // Verify this question currently has stimulus
      if (!q.has_stimulus) {
        console.warn(`WARNING: ${q.id} in strip list but already has has_stimulus=false`);
        alreadyNone++;
        return q;
      }
      strippedCount++;
      return {
        ...q,
        has_stimulus: false,
        stimulus: {
          type: 'none',
          content: null
        }
      };
    } else {
      if (q.has_stimulus) keptCount++;
      return q;
    }
  });

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

  const finalStimulus = data.questions.filter(q => q.has_stimulus).length;
  const total = data.questions.length;
  const pct = Math.round(finalStimulus / total * 100);

  console.log(`unit-${u}: stripped ${strippedCount}, kept ${keptCount}, final ${finalStimulus}/${total} = ${pct}% stimulus`);
  allResults.push({ u, finalStimulus, total, pct });
}

console.log('\n=== FINAL VERIFICATION ===');
allResults.forEach(({u, finalStimulus, total, pct}) => {
  const inRange = pct >= 48 && pct <= 52;
  console.log(`unit-${u}: ${finalStimulus}/${total} = ${pct}% ${inRange ? '✓' : '⚠ OUT OF RANGE'}`);
});
