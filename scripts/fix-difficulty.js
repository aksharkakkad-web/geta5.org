const fs = require('fs');
const path = require('path');

// Unit 5: reclassify 7 hard → medium to hit ~20/45/35
// Targets: easy=13, med=29, hard=23 (out of 65)
// Candidates: straightforward single-step optimization problems
const u5Reclassify = [
  'calc-mcq-u5-052', // largest output of f(x)=4x-x^2 on [0,5] — simple parabola optimization
  'calc-mcq-u5-056', // MVT for x^3 on (-1,1) — straightforward theorem application
  'calc-mcq-u5-060', // rectangle perimeter 40, maximize area — standard 1-step optimization
  'calc-mcq-u5-047', // absolute minimum of x*ln(x) — 1-step derivative
  'calc-mcq-u5-058', // number of critical points of sin(x)-x on [0,2pi] — 1-step derivative
  'calc-mcq-u5-044', // global minimum of x*e^{-x} on [0,inf) — 1-step derivative
  'calc-mcq-u5-045', // particle at rest times for v(t)=t^3-6t^2+9t — factor and solve
];

// Unit 6: reclassify 8 hard → medium to hit ~20/45/35
// Targets: easy=13, med=30, hard=23 (out of 66)
// Candidates: single u-substitution integrals that are labeled hard
const u6Reclassify = [
  'calc-mcq-u6-040', // integral of (ln x)^3/x dx — single u-sub with u=ln x
  'calc-mcq-u6-050', // integral of sin(x)cos(x) dx on [0,pi/2] — single u-sub
  'calc-mcq-u6-051', // integral of e^x/(e^x+3) dx — single u-sub
  'calc-mcq-u6-057', // integral of x^3/sqrt(1+x^4) dx — single u-sub
  'calc-mcq-u6-067', // integral of 1/(x*ln x) dx — single u-sub with u=ln x
  'calc-mcq-u6-069', // integral of (ln x)^2/x dx on [1,e] — single u-sub
  'calc-mcq-u6-070', // piecewise integral — just geometric area (triangle)
  'calc-mcq-u6-053', // FTC chain rule: F(x) = integral cos(t) dt, F'(x) — straightforward FTC2
];

// Unit 7: reclassify 5 hard → medium to hit ~20/45/35
// Targets: easy=10, med=22, hard=18 (out of 50)
// Candidates: straightforward slope field matching and simple separable ODEs
const u7Reclassify = [
  'calc-mcq-u7-033', // slope field matching — identify DE from slope field (visual matching)
  'calc-mcq-u7-038', // find equilibrium solutions — set dy/dx=0 and solve
  'calc-mcq-u7-039', // carbon-14 half-life fraction — plug into 2^(-t/T) formula
  'calc-mcq-u7-043', // find equilibrium solution — straightforward
  'calc-mcq-u7-045', // car depreciation 15%/yr — plug into exponential decay formula
];

function reclassify(unitFile, ids, label) {
  const filePath = path.join(__dirname, '../public/data/ap-calculus-ab/mcq/' + unitFile + '.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = 0;
  const notFound = [];

  ids.forEach(id => {
    const q = data.questions.find(q => q.id === id);
    if (!q) {
      notFound.push(id);
      return;
    }
    if (q.difficulty !== 'hard') {
      console.log('  WARNING: ' + id + ' is already ' + q.difficulty + ', skipping');
      return;
    }
    q.difficulty = 'medium';
    changed++;
  });

  if (notFound.length > 0) {
    console.log('  NOT FOUND:', notFound.join(', '));
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  const qs = data.questions;
  const total = qs.length;
  const e = qs.filter(q => q.difficulty === 'easy').length;
  const m = qs.filter(q => q.difficulty === 'medium').length;
  const h = qs.filter(q => q.difficulty === 'hard').length;
  console.log(label + ': changed=' + changed + ' | easy=' + Math.round(e/total*100) + '% med=' + Math.round(m/total*100) + '% hard=' + Math.round(h/total*100) + '% (n=' + total + ')');
}

reclassify('unit-5', u5Reclassify, 'unit-5');
reclassify('unit-6', u6Reclassify, 'unit-6');
reclassify('unit-7', u7Reclassify, 'unit-7');
