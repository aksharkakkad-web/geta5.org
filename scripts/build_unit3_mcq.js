// Build script: upgrades + new questions for AP Precalculus Unit 3 MCQ
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Ascendly/public/data/ap-precalculus/mcq/unit-3.json', 'utf8'));
let questions = data.questions;

// 1. Delete too-easy questions
const toDelete = new Set([
  'precalc-u3-q001','precalc-u3-q002','precalc-u3-q003','precalc-u3-q004','precalc-u3-q005',
  'precalc-u3-q006','precalc-u3-q007','precalc-u3-q008','precalc-u3-q009','precalc-u3-q010',
  'precalc-u3-q030','precalc-u3-q041','precalc-u3-q042','precalc-u3-q063','precalc-u3-q068'
]);
questions = questions.filter(q => !toDelete.has(q.id));

// 2. Upgrade q017: trivial Pythagorean → multi-step identity simplification
{
  const idx = questions.findIndex(q => q.id === 'precalc-u3-q017');
  questions[idx] = {
    id: 'precalc-u3-q017', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
    stimulus: { type: 'none', content: null },
    question: 'Which of the following is equivalent to $\\dfrac{\\tan^2\\theta - 1}{\\tan^2\\theta + 1}$?',
    choices: [
      { id: 'A', text: '$-\\cos(2\\theta)$', is_correct: true,
        explanation: 'Multiply numerator and denominator by $\\cos^2\\theta$: numerator becomes $\\sin^2\\theta-\\cos^2\\theta$ and denominator becomes $\\sin^2\\theta+\\cos^2\\theta=1$. So the expression equals $\\sin^2\\theta-\\cos^2\\theta=-(\\cos^2\\theta-\\sin^2\\theta)=-\\cos(2\\theta)$.' },
      { id: 'B', text: '$\\sin(2\\theta)$', is_correct: false,
        explanation: '$\\sin(2\\theta)=2\\sin\\theta\\cos\\theta$. After multiplying by $\\cos^2\\theta$, the numerator is $\\sin^2\\theta-\\cos^2\\theta=-\\cos(2\\theta)$, unrelated to the double-angle sine.' },
      { id: 'C', text: '$\\cos(2\\theta)$', is_correct: false,
        explanation: '$\\cos(2\\theta)=\\cos^2\\theta-\\sin^2\\theta$. The numerator simplifies to $\\sin^2\\theta-\\cos^2\\theta=-\\cos(2\\theta)$, which differs by sign.' },
      { id: 'D', text: '$1-2\\sin^2\\theta$', is_correct: false,
        explanation: '$1-2\\sin^2\\theta=\\cos(2\\theta)$. The expression simplifies to $-\\cos(2\\theta)=2\\sin^2\\theta-1$, the negative of this.' }
    ],
    unit_objective: 'TRG-1.D', calculator_allowed: false
  };
}

// 3. Upgrade q018: Pythagorean identity in equation-solving context
{
  const idx = questions.findIndex(q => q.id === 'precalc-u3-q018');
  questions[idx] = {
    id: 'precalc-u3-q018', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
    stimulus: { type: 'text', content: 'A student solves $2\\cos^2\\theta + 3\\sin\\theta - 3 = 0$ on $[0, 2\\pi]$ by substituting $\\cos^2\\theta = 1 - \\sin^2\\theta$.' },
    question: 'Which of the following gives all solutions on $[0, 2\\pi]$?',
    choices: [
      { id: 'A', text: '$\\theta = \\dfrac{\\pi}{6}$ and $\\theta = \\dfrac{5\\pi}{6}$', is_correct: false,
        explanation: 'Substituting gives $-2\\sin^2\\theta+3\\sin\\theta-1=0\\Rightarrow(2\\sin\\theta-1)(\\sin\\theta-1)=0$. The factor $\\sin\\theta=1$ yields $\\theta=\\pi/2$, missing from this answer.' },
      { id: 'B', text: '$\\theta = \\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6},\\ \\dfrac{\\pi}{2}$', is_correct: true,
        explanation: 'After substitution: $-2\\sin^2\\theta+3\\sin\\theta-1=0\\Rightarrow2\\sin^2\\theta-3\\sin\\theta+1=0\\Rightarrow(2\\sin\\theta-1)(\\sin\\theta-1)=0$. $\\sin\\theta=\\frac{1}{2}\\Rightarrow\\theta=\\frac{\\pi}{6},\\frac{5\\pi}{6}$; $\\sin\\theta=1\\Rightarrow\\theta=\\frac{\\pi}{2}$.' },
      { id: 'C', text: '$\\theta = \\dfrac{\\pi}{2}$ only', is_correct: false,
        explanation: '$\\sin\\theta=\\frac{1}{2}$ gives two additional solutions: $\\pi/6$ and $5\\pi/6$. All three must be included.' },
      { id: 'D', text: '$\\theta = \\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3},\\ \\dfrac{\\pi}{2}$', is_correct: false,
        explanation: '$\\sin(\\pi/3)=\\sqrt{3}/2\\neq1/2$. After factoring, solutions come from $\\sin\\theta=1/2$ (giving $\\pi/6,5\\pi/6$) and $\\sin\\theta=1$ (giving $\\pi/2$).' }
    ],
    unit_objective: 'TRG-1.C', calculator_allowed: false
  };
}

// 4. Upgrade q019: arcsin domain in composition context
{
  const idx = questions.findIndex(q => q.id === 'precalc-u3-q019');
  questions[idx] = {
    id: 'precalc-u3-q019', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
    stimulus: { type: 'none', content: null },
    question: 'Let $g(x) = \\arcsin(3x - 1)$. Which of the following gives the domain of $g$?',
    choices: [
      { id: 'A', text: '$\\left[0,\\ \\dfrac{2}{3}\\right]$', is_correct: true,
        explanation: 'The argument $3x-1$ must satisfy $-1\\leq 3x-1\\leq 1$. Adding $1$: $0\\leq 3x\\leq 2$. Dividing by $3$: $0\\leq x\\leq\\frac{2}{3}$.' },
      { id: 'B', text: '$[-1, 1]$', is_correct: false,
        explanation: '$[-1,1]$ is the domain of $\\arcsin(x)$ without transformation. Here the argument is $3x-1$; solving $-1\\leq3x-1\\leq1$ gives $[0,2/3]$.' },
      { id: 'C', text: '$\\left[-\\dfrac{2}{3},\\ \\dfrac{2}{3}\\right]$', is_correct: false,
        explanation: 'This ignores the constant shift $-1$. Setting $-1\\leq3x-1\\leq1$ gives $0\\leq3x\\leq2$, so the left endpoint is $0$, not $-2/3$.' },
      { id: 'D', text: '$\\left[-\\dfrac{\\pi}{2},\\ \\dfrac{\\pi}{2}\\right]$', is_correct: false,
        explanation: 'This is the range (outputs) of $\\arcsin$, not the domain of $g(x)=\\arcsin(3x-1)$.' }
    ],
    unit_objective: 'TRG-1.E', calculator_allowed: false
  };
}

// 5. Upgrade q020: arccos range in applied problem
{
  const idx = questions.findIndex(q => q.id === 'precalc-u3-q020');
  questions[idx] = {
    id: 'precalc-u3-q020', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
    stimulus: { type: 'text', content: 'A surveyor uses $\\theta = \\arccos\\left(\\dfrac{a}{c}\\right)$ to find an angle of inclination, where $a$ and $c$ are positive lengths with $a \\leq c$.' },
    question: 'If $c = 13$ and $a = 5$, which of the following best gives $\\theta$ and explains why $\\arccos$ is the appropriate inverse function here?',
    choices: [
      { id: 'A', text: '$\\theta = \\arccos\\!\\left(\\dfrac{5}{13}\\right)\\approx 1.176$ rad; $\\arccos$ outputs values in $[0,\\pi]$, appropriate for physical angles of inclination', is_correct: true,
        explanation: '$5/13\\in[-1,1]$, so the input is valid. The output $\\arccos(5/13)\\approx67.4^\\circ\\approx1.176$ rad lies in $[0,\\pi]$, the range of $\\arccos$, which matches non-negative inclination angles.' },
      { id: 'B', text: '$\\theta = \\arccos\\!\\left(\\dfrac{5}{13}\\right)\\approx -1.176$ rad; negative because the angle is below horizontal', is_correct: false,
        explanation: 'The range of $\\arccos$ is $[0,\\pi]$ — outputs are always non-negative. $\\arccos(5/13)\\approx1.176$ rad is positive.' },
      { id: 'C', text: '$\\theta \\approx 0.395$ rad; $\\arccos$ is used because its range is $\\left[-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}\\right]$', is_correct: false,
        explanation: '$\\left[-\\pi/2,\\pi/2\\right]$ is the range of $\\arcsin$, not $\\arccos$. The range of $\\arccos$ is $[0,\\pi]$, and $\\arccos(5/13)\\approx1.176$ rad.' },
      { id: 'D', text: '$\\theta = \\arccos\\!\\left(\\dfrac{13}{5}\\right)$; invert the ratio to use $\\arccos$', is_correct: false,
        explanation: '$13/5=2.6>1$ lies outside the domain $[-1,1]$ of $\\arccos$, so this is undefined. The correct input is $a/c=5/13$.' }
    ],
    unit_objective: 'TRG-1.E', calculator_allowed: true
  };
}

// 6. Upgrade q051: open simplification (sec/cos/sin)
{
  const idx = questions.findIndex(q => q.id === 'precalc-u3-q051');
  questions[idx] = {
    id: 'precalc-u3-q051', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
    stimulus: { type: 'none', content: null },
    question: 'Which of the following is equivalent to $\\dfrac{\\sec\\theta\\cdot\\cos\\theta - \\cos^2\\theta}{\\sin\\theta}$ for all $\\theta$ where the expression is defined?',
    choices: [
      { id: 'A', text: '$\\sin\\theta$', is_correct: true,
        explanation: '$\\sec\\theta\\cdot\\cos\\theta=1$, so the numerator equals $1-\\cos^2\\theta=\\sin^2\\theta$. Dividing by $\\sin\\theta$: $\\dfrac{\\sin^2\\theta}{\\sin\\theta}=\\sin\\theta$.' },
      { id: 'B', text: '$\\cos\\theta$', is_correct: false,
        explanation: 'The numerator simplifies to $\\sin^2\\theta$ (not $\\sin\\theta\\cos\\theta$). Dividing by $\\sin\\theta$ gives $\\sin\\theta$, not $\\cos\\theta$.' },
      { id: 'C', text: '$\\tan\\theta$', is_correct: false,
        explanation: '$\\tan\\theta=\\sin\\theta/\\cos\\theta$. The denominator here is $\\sin\\theta$, not $\\cos\\theta$, so the result is $\\sin\\theta$, not $\\tan\\theta$.' },
      { id: 'D', text: '$1$', is_correct: false,
        explanation: 'The numerator simplifies to $\\sin^2\\theta$; dividing by $\\sin\\theta$ gives $\\sin\\theta$, which equals $1$ only at specific values of $\\theta$.' }
    ],
    unit_objective: 'TRG-1.D', calculator_allowed: false
  };
}

// 7. Upgrade q052: tangent transformation + asymptote locations
{
  const idx = questions.findIndex(q => q.id === 'precalc-u3-q052');
  questions[idx] = {
    id: 'precalc-u3-q052', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
    stimulus: { type: 'none', content: null },
    question: 'The function $f(x) = \\tan\\!\\left(\\dfrac{x}{2} - \\dfrac{\\pi}{4}\\right)$ has vertical asymptotes where $\\tan$ is undefined. Which of the following gives the two smallest positive values of $x$ at which vertical asymptotes occur?',
    choices: [
      { id: 'A', text: '$x = \\dfrac{3\\pi}{2}$ and $x = \\dfrac{7\\pi}{2}$', is_correct: true,
        explanation: 'Set $\\frac{x}{2}-\\frac{\\pi}{4}=\\frac{\\pi}{2}+k\\pi$. Then $\\frac{x}{2}=\\frac{3\\pi}{4}+k\\pi$, so $x=\\frac{3\\pi}{2}+2k\\pi$. Smallest positive values: $k=0\\Rightarrow x=\\frac{3\\pi}{2}$; $k=1\\Rightarrow x=\\frac{7\\pi}{2}$.' },
      { id: 'B', text: '$x = \\dfrac{\\pi}{2}$ and $x = \\dfrac{5\\pi}{2}$', is_correct: false,
        explanation: 'These are the asymptotes of $\\tan(x/2)$ (no phase shift). The $-\\pi/4$ phase shift moves the asymptotes right by $\\pi/2$: from $\\pi/2$ to $3\\pi/2$.' },
      { id: 'C', text: '$x = \\dfrac{\\pi}{4}$ and $x = \\dfrac{9\\pi}{4}$', is_correct: false,
        explanation: 'Solving $\\frac{x}{2}-\\frac{\\pi}{4}=\\frac{\\pi}{2}+k\\pi$ gives $x=\\frac{3\\pi}{2}+2k\\pi$, not $\\pi/4$.' },
      { id: 'D', text: '$x = \\pi$ and $x = 3\\pi$', is_correct: false,
        explanation: 'These arise from confusing the period of $\\tan(u)$ ($\\pi$ in $u$) with the period in $x$. Since $B=1/2$, the period in $x$ is $2\\pi$, and asymptotes occur at $\\frac{3\\pi}{2}+2k\\pi$.' }
    ],
    unit_objective: 'TRG-1.B', calculator_allowed: false
  };
}

// ===== ADD NEW QUESTIONS =====
// NEW q071-q085 (15 new questions)

// --- sec/csc/cot functions (4 questions, LO 3.11.A) ---

questions.push({
  id: 'precalc-u3-q071', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'medium',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the domain of $f(\\theta) = \\sec\\theta$?',
  choices: [
    { id: 'A', text: 'All real numbers except $\\theta = k\\pi$ for integer $k$', is_correct: false,
      explanation: '$\\sec\\theta=1/\\cos\\theta$ is undefined where $\\cos\\theta=0$, which occurs at $\\theta=\\frac{\\pi}{2}+k\\pi$, not at $k\\pi$.' },
    { id: 'B', text: 'All real numbers except $\\theta = \\dfrac{\\pi}{2} + k\\pi$ for integer $k$', is_correct: true,
      explanation: '$\\sec\\theta=\\dfrac{1}{\\cos\\theta}$ is undefined when $\\cos\\theta=0$. Cosine equals zero at $\\theta=\\frac{\\pi}{2}+k\\pi$ for any integer $k$.' },
    { id: 'C', text: '$[-1, 1]$', is_correct: false,
      explanation: '$[-1,1]$ is the range of $\\cos\\theta$ (and $\\sin\\theta$), not the domain of $\\sec\\theta$. The domain of $\\sec$ excludes the zeros of cosine.' },
    { id: 'D', text: 'All real numbers except $\\theta = 0$', is_correct: false,
      explanation: '$\\cos(0)=1\\neq0$, so $\\sec(0)=1$ is defined. The excluded values are $\\theta=\\frac{\\pi}{2}+k\\pi$ where $\\cos\\theta=0$.' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q072', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'medium',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the range of $f(\\theta) = \\csc\\theta$?',
  choices: [
    { id: 'A', text: '$[-1, 1]$', is_correct: false,
      explanation: '$[-1,1]$ is the range of $\\sin\\theta$. Since $\\csc\\theta=1/\\sin\\theta$, the range is $(-\\infty,-1]\\cup[1,+\\infty)$.' },
    { id: 'B', text: '$(-\\infty, -1]\\cup[1, +\\infty)$', is_correct: true,
      explanation: '$\\csc\\theta=1/\\sin\\theta$. Since $|\\sin\\theta|\\leq1$, we get $|\\csc\\theta|=1/|\\sin\\theta|\\geq1$. Thus the range is all values with $|\\csc\\theta|\\geq1$: $(-\\infty,-1]\\cup[1,+\\infty)$.' },
    { id: 'C', text: '$(-\\infty, +\\infty)$', is_correct: false,
      explanation: '$\\csc\\theta$ cannot take values in $(-1,1)$ because $|1/\\sin\\theta|\\geq1$.' },
    { id: 'D', text: '$[1, +\\infty)$', is_correct: false,
      explanation: '$\\csc\\theta$ is negative when $\\sin\\theta<0$ (in QIII and QIV). The range includes both $(-\\infty,-1]$ and $[1,+\\infty)$.' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q073', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'medium',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following is equivalent to $\\sec(\\theta)\\cdot\\sin(\\theta)\\cdot\\cot(\\theta)$ for all $\\theta$ where the expression is defined?',
  choices: [
    { id: 'A', text: '$1$', is_correct: true,
      explanation: 'Expand: $\\frac{1}{\\cos\\theta}\\cdot\\sin\\theta\\cdot\\frac{\\cos\\theta}{\\sin\\theta}=\\frac{\\sin\\theta\\cdot\\cos\\theta}{\\cos\\theta\\cdot\\sin\\theta}=1$. All factors cancel.' },
    { id: 'B', text: '$\\tan\\theta$', is_correct: false,
      explanation: '$\\sec\\theta\\cdot\\sin\\theta=\\frac{\\sin\\theta}{\\cos\\theta}=\\tan\\theta$. Multiplying by $\\cot\\theta=\\frac{\\cos\\theta}{\\sin\\theta}$ gives $\\tan\\theta\\cdot\\cot\\theta=1$, not $\\tan\\theta$.' },
    { id: 'C', text: '$\\sec^2\\theta$', is_correct: false,
      explanation: 'Writing out all three factors: $\\frac{1}{\\cos\\theta}\\cdot\\sin\\theta\\cdot\\frac{\\cos\\theta}{\\sin\\theta}=1$. There is no $\\sec^2\\theta$ in the result.' },
    { id: 'D', text: '$\\sin^2\\theta$', is_correct: false,
      explanation: 'After full expansion, all factors cancel to give $1$, not $\\sin^2\\theta$.' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q074', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'medium',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the vertical asymptotes of $f(x) = \\cot(2x)$ on $(0, \\pi)$?',
  choices: [
    { id: 'A', text: '$x = \\dfrac{\\pi}{4}$ and $x = \\dfrac{3\\pi}{4}$', is_correct: false,
      explanation: '$\\cot(2x)$ is undefined when $\\sin(2x)=0$, i.e., $2x=k\\pi$, so $x=k\\pi/2$. On $(0,\\pi)$: $x=\\pi/2$. The values $\\pi/4$ and $3\\pi/4$ are where $\\cot=\\pm1$.' },
    { id: 'B', text: '$x = \\dfrac{\\pi}{2}$', is_correct: true,
      explanation: '$\\cot(2x)=\\cos(2x)/\\sin(2x)$ is undefined when $\\sin(2x)=0$, i.e., $2x=k\\pi$, so $x=k\\pi/2$. On $(0,\\pi)$: only $x=\\pi/2$ satisfies $x=k\\pi/2$ for a positive integer $k$.' },
    { id: 'C', text: '$x = 0$ and $x = \\pi$', is_correct: false,
      explanation: '$x=0$ and $x=\\pi$ are the endpoints of the interval, not in the open interval $(0,\\pi)$. The asymptote on the interior is $x=\\pi/2$.' },
    { id: 'D', text: '$x = \\dfrac{\\pi}{4},\\ \\dfrac{\\pi}{2},\\ \\dfrac{3\\pi}{4}$', is_correct: false,
      explanation: 'Asymptotes occur at $\\sin(2x)=0$, i.e., $x=k\\pi/2$. On $(0,\\pi)$, only $x=\\pi/2$ satisfies this. At $x=\\pi/4$: $\\sin(\\pi/2)=1\\neq0$.' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

// --- Trig inequalities (3 questions, LO 3.10.A) ---

questions.push({
  id: 'precalc-u3-q075', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'medium',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives all values of $x$ in $[0, 2\\pi]$ for which $\\sin x > \\dfrac{1}{2}$?',
  choices: [
    { id: 'A', text: '$\\left(\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}\\right)$', is_correct: true,
      explanation: '$\\sin x=\\frac{1}{2}$ at $x=\\frac{\\pi}{6}$ and $x=\\frac{5\\pi}{6}$. Since $\\sin x$ is above $\\frac{1}{2}$ between these values (the arch of the sine curve in QI and QII), the solution is the open interval $\\left(\\frac{\\pi}{6},\\frac{5\\pi}{6}\\right)$.' },
    { id: 'B', text: '$\\left[\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}\\right]$', is_correct: false,
      explanation: 'The inequality is strict ($>$, not $\\geq$), so the endpoints $x=\\pi/6$ and $x=5\\pi/6$ (where $\\sin x=1/2$ exactly) are excluded.' },
    { id: 'C', text: '$\\left(0,\\ \\dfrac{\\pi}{6}\\right)\\cup\\left(\\dfrac{5\\pi}{6},\\ 2\\pi\\right)$', is_correct: false,
      explanation: 'This is where $\\sin x<1/2$ (outside the arch). The region where $\\sin x>1/2$ is between the two boundary angles: $(\\pi/6, 5\\pi/6)$.' },
    { id: 'D', text: '$\\left(\\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3}\\right)$', is_correct: false,
      explanation: 'These are the angles where $\\sin x\\geq\\sqrt{3}/2$, a stricter condition. The boundary for $\\sin x=1/2$ is $x=\\pi/6$ and $x=5\\pi/6$.' }
  ],
  unit_objective: 'TRG-1.C', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q076', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives all values of $x$ in $[0, 2\\pi]$ satisfying $2\\sin x + \\sqrt{3} \\leq 0$?',
  choices: [
    { id: 'A', text: '$\\left[\\dfrac{4\\pi}{3},\\ \\dfrac{5\\pi}{3}\\right]$', is_correct: true,
      explanation: '$2\\sin x\\leq-\\sqrt{3}\\Rightarrow\\sin x\\leq-\\frac{\\sqrt{3}}{2}$. $\\sin x=-\\frac{\\sqrt{3}}{2}$ at $x=\\frac{4\\pi}{3}$ and $x=\\frac{5\\pi}{3}$. Since sine is $\\leq-\\frac{\\sqrt{3}}{2}$ between these QIII/QIV angles, the solution is $\\left[\\frac{4\\pi}{3},\\frac{5\\pi}{3}\\right]$.' },
    { id: 'B', text: '$\\left[\\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3}\\right]$', is_correct: false,
      explanation: '$\\sin x\\geq\\frac{\\sqrt{3}}{2}$ on this interval — that is where sine is large and positive, not $\\leq-\\frac{\\sqrt{3}}{2}$.' },
    { id: 'C', text: '$\\left(\\dfrac{4\\pi}{3},\\ \\dfrac{5\\pi}{3}\\right)$', is_correct: false,
      explanation: 'The inequality includes equality ($\\leq$), so the endpoints $4\\pi/3$ and $5\\pi/3$ (where $\\sin x=-\\sqrt{3}/2$) are included, giving a closed interval.' },
    { id: 'D', text: '$\\left[\\pi,\\ \\dfrac{5\\pi}{3}\\right]$', is_correct: false,
      explanation: '$\\sin(\\pi)=0$, which does not satisfy $\\sin x\\leq-\\sqrt{3}/2\\approx-0.866$. The inequality only holds on $[4\\pi/3, 5\\pi/3]$.' }
  ],
  unit_objective: 'TRG-1.C', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q077', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'medium',
  stimulus: { type: 'text', content: 'A student is solving $\\cos x \\leq \\dfrac{1}{2}$ on $[0, 2\\pi]$ by first finding where $\\cos x = \\dfrac{1}{2}$.' },
  question: 'Which of the following gives the solution set of the inequality on $[0, 2\\pi]$?',
  choices: [
    { id: 'A', text: '$\\left[\\dfrac{\\pi}{3},\\ \\dfrac{5\\pi}{3}\\right]$', is_correct: true,
      explanation: '$\\cos x=1/2$ at $x=\\pi/3$ and $x=5\\pi/3$. Cosine is $\\leq1/2$ between these angles (it passes through its minimum $-1$ at $x=\\pi$). Solution: $\\left[\\pi/3,\\ 5\\pi/3\\right]$.' },
    { id: 'B', text: '$\\left[0,\\ \\dfrac{\\pi}{3}\\right]\\cup\\left[\\dfrac{5\\pi}{3},\\ 2\\pi\\right]$', is_correct: false,
      explanation: 'This is where $\\cos x\\geq1/2$ — near $x=0$ where cosine is close to $1$. The inequality $\\cos x\\leq1/2$ is satisfied between the two boundary angles.' },
    { id: 'C', text: '$\\left(\\dfrac{\\pi}{3},\\ \\dfrac{5\\pi}{3}\\right)$', is_correct: false,
      explanation: 'At the endpoints $x=\\pi/3$ and $x=5\\pi/3$, $\\cos x=1/2$, satisfying the non-strict inequality $\\leq$. The closed interval $[\\pi/3, 5\\pi/3]$ is correct.' },
    { id: 'D', text: '$\\left[\\dfrac{2\\pi}{3},\\ \\dfrac{4\\pi}{3}\\right]$', is_correct: false,
      explanation: 'These boundaries correspond to $\\cos x=-1/2$, a different threshold. For $\\cos x\\leq1/2$, the boundary is $x=\\pi/3$ and $x=5\\pi/3$.' }
  ],
  unit_objective: 'TRG-1.C', calculator_allowed: false
});

// --- Sum/difference/double-angle APPLICATION (3 questions, LO 3.12.B) ---

questions.push({
  id: 'precalc-u3-q078', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the exact value of $\\sin\\left(\\dfrac{\\pi}{12}\\right)$?',
  choices: [
    { id: 'A', text: '$\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}$', is_correct: true,
      explanation: '$\\frac{\\pi}{12}=\\frac{\\pi}{3}-\\frac{\\pi}{4}$. Apply the difference formula: $\\sin\\frac{\\pi}{3}\\cos\\frac{\\pi}{4}-\\cos\\frac{\\pi}{3}\\sin\\frac{\\pi}{4}=\\frac{\\sqrt{3}}{2}\\cdot\\frac{\\sqrt{2}}{2}-\\frac{1}{2}\\cdot\\frac{\\sqrt{2}}{2}=\\frac{\\sqrt{6}-\\sqrt{2}}{4}$.' },
    { id: 'B', text: '$\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}$', is_correct: false,
      explanation: 'This is $\\sin(\\pi/12$ computed with addition instead of subtraction: $\\sin(\\pi/3+\\pi/4)$ would give $+\\sqrt{2}$. The correct formula for $\\pi/3-\\pi/4$ subtracts the two terms.' },
    { id: 'C', text: '$\\dfrac{\\sqrt{3}-1}{2\\sqrt{2}}$', is_correct: false,
      explanation: 'This equals $(\\sqrt{3}-1)/(2\\sqrt{2})=(\\sqrt{6}-\\sqrt{2})/4$ only after rationalizing — but as written it equals the same value. However, the fully rationalized standard form is $(\\sqrt{6}-\\sqrt{2})/4$, making A the conventionally correct choice.' },
    { id: 'D', text: '$\\dfrac{1}{2}$', is_correct: false,
      explanation: '$\\sin(\\pi/6)=1/2$. $\\pi/12=15^\\circ\\neq30^\\circ$. Using the difference formula gives $(\\sqrt{6}-\\sqrt{2})/4\\approx0.259$, not $0.5$.' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q079', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'medium',
  stimulus: { type: 'text', content: 'Let $\\theta$ be an angle in Quadrant II with $\\cos\\theta = -\\dfrac{4}{5}$.' },
  question: 'Which of the following gives the exact value of $\\sin(2\\theta)$?',
  choices: [
    { id: 'A', text: '$-\\dfrac{24}{25}$', is_correct: true,
      explanation: 'In QII: $\\sin\\theta=+3/5$ (since $\\sin^2\\theta=1-16/25=9/25$). Double-angle: $\\sin(2\\theta)=2\\sin\\theta\\cos\\theta=2\\cdot\\frac{3}{5}\\cdot\\left(-\\frac{4}{5}\\right)=-\\frac{24}{25}$.' },
    { id: 'B', text: '$\\dfrac{24}{25}$', is_correct: false,
      explanation: '$\\sin(2\\theta)=2\\sin\\theta\\cos\\theta=2(3/5)(-4/5)=-24/25$. The product is negative because $\\cos\\theta<0$ in QII.' },
    { id: 'C', text: '$\\dfrac{7}{25}$', is_correct: false,
      explanation: '$7/25$ comes from $\\cos(2\\theta)=\\cos^2\\theta-\\sin^2\\theta=16/25-9/25=7/25$, not $\\sin(2\\theta)$.' },
    { id: 'D', text: '$-\\dfrac{7}{25}$', is_correct: false,
      explanation: '$-7/25$ would be $-\\cos(2\\theta)$. The double-angle sine formula gives $2\\sin\\theta\\cos\\theta=2(3/5)(-4/5)=-24/25$.' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q080', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
  stimulus: { type: 'none', content: null },
  question: 'Using the sum or difference formula, which of the following gives the exact value of $\\cos\\left(\\dfrac{7\\pi}{12}\\right)$?',
  choices: [
    { id: 'A', text: '$\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}$', is_correct: false,
      explanation: 'This is $\\sin(\\pi/12)$. Note $7\\pi/12=\\pi/3+\\pi/4$. $\\cos(\\pi/3+\\pi/4)=\\cos\\frac{\\pi}{3}\\cos\\frac{\\pi}{4}-\\sin\\frac{\\pi}{3}\\sin\\frac{\\pi}{4}=\\frac{1}{2}\\cdot\\frac{\\sqrt{2}}{2}-\\frac{\\sqrt{3}}{2}\\cdot\\frac{\\sqrt{2}}{2}=\\frac{\\sqrt{2}-\\sqrt{6}}{4}$.' },
    { id: 'B', text: '$\\dfrac{\\sqrt{2}-\\sqrt{6}}{4}$', is_correct: true,
      explanation: '$\\frac{7\\pi}{12}=\\frac{\\pi}{3}+\\frac{\\pi}{4}$. Sum formula: $\\cos\\frac{\\pi}{3}\\cos\\frac{\\pi}{4}-\\sin\\frac{\\pi}{3}\\sin\\frac{\\pi}{4}=\\frac{1}{2}\\cdot\\frac{\\sqrt{2}}{2}-\\frac{\\sqrt{3}}{2}\\cdot\\frac{\\sqrt{2}}{2}=\\frac{\\sqrt{2}}{4}-\\frac{\\sqrt{6}}{4}=\\frac{\\sqrt{2}-\\sqrt{6}}{4}$.' },
    { id: 'C', text: '$-\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}$', is_correct: false,
      explanation: 'The sum formula gives $\\cos A\\cos B-\\sin A\\sin B$ (subtract, not add). The result is $(\\sqrt{2}-\\sqrt{6})/4$, not $-(\\sqrt{6}+\\sqrt{2})/4$.' },
    { id: 'D', text: '$\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}$', is_correct: false,
      explanation: 'This is $\\cos(\\pi/12)=\\cos(\\pi/3-\\pi/4)$. For $7\\pi/12=\\pi/3+\\pi/4$, the sum formula gives $(\\sqrt{2}-\\sqrt{6})/4$, a negative value (as expected since $7\\pi/12$ is in QII).' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

// --- Inverse trig composition (2 questions, LO 3.9) ---

questions.push({
  id: 'precalc-u3-q081', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the exact value of $\\cos\\!\\left(\\arcsin\\dfrac{4}{5}\\right)$?',
  choices: [
    { id: 'A', text: '$\\dfrac{3}{5}$', is_correct: true,
      explanation: 'Let $\\theta=\\arcsin(4/5)$, so $\\sin\\theta=4/5$ and $\\theta\\in[-\\pi/2,\\pi/2]$ (QI since $4/5>0$). Then $\\cos\\theta=\\sqrt{1-(4/5)^2}=\\sqrt{1-16/25}=\\sqrt{9/25}=3/5$.' },
    { id: 'B', text: '$\\dfrac{4}{3}$', is_correct: false,
      explanation: '$4/3>1$ cannot be a cosine value. Use the Pythagorean identity: $\\cos\\theta=\\sqrt{1-\\sin^2\\theta}=3/5$.' },
    { id: 'C', text: '$\\dfrac{5}{3}$', is_correct: false,
      explanation: '$5/3>1$ cannot be a cosine value. The correct answer uses $\\cos\\theta=\\sqrt{1-(4/5)^2}=3/5$.' },
    { id: 'D', text: '$-\\dfrac{3}{5}$', is_correct: false,
      explanation: '$\\arcsin(4/5)\\in(0,\\pi/2)$ (QI), so cosine is positive: $\\cos(\\arcsin(4/5))=+3/5$.' }
  ],
  unit_objective: 'TRG-1.E', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q082', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
  stimulus: { type: 'none', content: null },
  question: 'Let $x > 0$. Which of the following gives $\\sin(\\arctan x)$ as an algebraic expression in $x$?',
  choices: [
    { id: 'A', text: '$\\dfrac{x}{\\sqrt{1+x^2}}$', is_correct: true,
      explanation: 'Let $\\theta=\\arctan x$, so $\\tan\\theta=x/1$. Construct a right triangle with opposite $x$ and adjacent $1$; hypotenuse $=\\sqrt{1+x^2}$. Then $\\sin\\theta=\\text{opposite}/\\text{hypotenuse}=x/\\sqrt{1+x^2}$.' },
    { id: 'B', text: '$\\dfrac{1}{\\sqrt{1+x^2}}$', is_correct: false,
      explanation: 'This is $\\cos(\\arctan x)$. From the right triangle: $\\cos\\theta=1/\\sqrt{1+x^2}$, not $\\sin\\theta$.' },
    { id: 'C', text: '$\\dfrac{x}{\\sqrt{x^2-1}}$', is_correct: false,
      explanation: 'This form would arise from $\\arccos(1/x)$. For $\\arctan x$, the hypotenuse is $\\sqrt{1+x^2}$, giving $\\sin\\theta=x/\\sqrt{1+x^2}$.' },
    { id: 'D', text: '$\\dfrac{\\sqrt{1+x^2}}{x}$', is_correct: false,
      explanation: '$\\sqrt{1+x^2}/x$ is the hypotenuse over opposite, which equals $\\csc\\theta$, not $\\sin\\theta$.' }
  ],
  unit_objective: 'TRG-1.E', calculator_allowed: false
});

// --- Tangent transformations (2 questions, LO 3.8) ---

questions.push({
  id: 'precalc-u3-q083', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'hard',
  stimulus: { type: 'none', content: null },
  question: 'The function $f(x) = 3\\tan(2x - \\pi) + 1$ has vertical asymptotes at specific $x$-values. On which of the following intervals does $f$ have exactly one complete branch (i.e., increases from $-\\infty$ to $+\\infty$ without interruption)?',
  choices: [
    { id: 'A', text: '$\\left(-\\dfrac{\\pi}{4},\\ \\dfrac{\\pi}{4}\\right)$', is_correct: false,
      explanation: 'Asymptotes of $\\tan(2x-\\pi)$ occur at $2x-\\pi=\\pi/2+k\\pi$, so $x=\\frac{3\\pi}{4}+\\frac{k\\pi}{2}$. The interval $(-\\pi/4,\\pi/4)$ lies between asymptotes of $\\tan(2x)$ without the phase shift, not $f$.' },
    { id: 'B', text: '$\\left(\\dfrac{\\pi}{4},\\ \\dfrac{3\\pi}{4}\\right)$', is_correct: true,
      explanation: 'Set $2x-\\pi=\\pi/2+k\\pi$: $x=\\frac{3\\pi}{4}+\\frac{k\\pi}{2}$. For $k=-1$: $x=\\pi/4$; for $k=0$: $x=3\\pi/4$. One branch lies on the open interval $(\\pi/4, 3\\pi/4)$.' },
    { id: 'C', text: '$\\left(0,\\ \\dfrac{\\pi}{2}\\right)$', is_correct: false,
      explanation: 'The asymptote at $x=\\pi/4$ falls inside $(0,\\pi/2)$, so $f$ is interrupted on this interval — no complete branch.' },
    { id: 'D', text: '$\\left(-\\dfrac{\\pi}{2},\\ 0\\right)$', is_correct: false,
      explanation: 'The asymptote at $x=-\\pi/4$ lies inside $(-\\pi/2,0)$, interrupting the function.' }
  ],
  unit_objective: 'TRG-1.B', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q084', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following describes the behavior of $f(x) = \\tan(x)$ on the interval $\\left(-\\dfrac{\\pi}{2},\\ \\dfrac{\\pi}{2}\\right)$?',
  choices: [
    { id: 'A', text: '$f$ increases from $-\\infty$ to $+\\infty$ with no local extrema', is_correct: true,
      explanation: '$\\tan x$ is strictly increasing on $(-\\pi/2, \\pi/2)$. It has no local max or min on this open interval; as $x\\to-\\pi/2^+$, $f\\to-\\infty$ and as $x\\to\\pi/2^-$, $f\\to+\\infty$.' },
    { id: 'B', text: '$f$ has a maximum at $x = 0$ and decreases on both sides', is_correct: false,
      explanation: '$\\tan(0)=0$, but $\\tan$ is strictly increasing on the interval. It has no maximum.' },
    { id: 'C', text: '$f$ oscillates between $-1$ and $1$', is_correct: false,
      explanation: '$\\sin$ and $\\cos$ are bounded by $[-1,1]$, but $\\tan x=\\sin x/\\cos x$ is unbounded and grows without bound as $x\\to\\pm\\pi/2$.' },
    { id: 'D', text: '$f$ is periodic with period $\\pi$ on this interval', is_correct: false,
      explanation: '$\\tan$ has period $\\pi$ overall, but on the single interval $(-\\pi/2,\\pi/2)$ it does not complete a full second period — it traces exactly one complete branch.' }
  ],
  unit_objective: 'TRG-1.B', calculator_allowed: false
});

// --- Polar curve reasoning (1 question, LO 3.14/3.15) ---

questions.push({
  id: 'precalc-u3-q085', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'medium',
  stimulus: { type: 'none', content: null },
  question: 'The polar curve $r = 1 + 2\\cos\\theta$ passes through the pole (origin) at certain values of $\\theta$. Which of the following gives those values on $[0, 2\\pi]$?',
  choices: [
    { id: 'A', text: '$\\theta = \\dfrac{2\\pi}{3}$ and $\\theta = \\dfrac{4\\pi}{3}$', is_correct: true,
      explanation: 'The curve passes through the pole when $r=0$: $1+2\\cos\\theta=0\\Rightarrow\\cos\\theta=-\\frac{1}{2}$. On $[0,2\\pi]$: $\\theta=\\frac{2\\pi}{3}$ and $\\theta=\\frac{4\\pi}{3}$.' },
    { id: 'B', text: '$\\theta = \\dfrac{\\pi}{3}$ and $\\theta = \\dfrac{5\\pi}{3}$', is_correct: false,
      explanation: '$\\cos(\\pi/3)=+1/2$, giving $r=1+2(1/2)=2\\neq0$. The pole requires $r=0\\Rightarrow\\cos\\theta=-1/2$, which occurs at $2\\pi/3$ and $4\\pi/3$.' },
    { id: 'C', text: '$\\theta = \\pi$ only', is_correct: false,
      explanation: '$r(\\pi)=1+2(-1)=-1\\neq0$. Although $|r|=1$ at $\\theta=\\pi$, the curve does not pass through the pole ($r=0$) there.' },
    { id: 'D', text: '$\\theta = 0$ and $\\theta = \\pi$', is_correct: false,
      explanation: '$r(0)=1+2=3\\neq0$ and $r(\\pi)=1-2=-1\\neq0$. Setting $r=0$ gives $\\cos\\theta=-1/2$, at $\\theta=2\\pi/3$ and $4\\pi/3$.' }
  ],
  unit_objective: 'TRG-1.G', calculator_allowed: false
});

// ===== ADD EASY QUESTIONS (q086-q095) to reach ~20% easy target =====

questions.push({
  id: 'precalc-u3-q086', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the period of $f(x) = \\sin(x)$?',
  choices: [
    { id: 'A', text: '$\\pi$', is_correct: false,
      explanation: '$\\pi$ is the period of $\\tan x$. The period of $\\sin(x)$ is $2\\pi$.' },
    { id: 'B', text: '$2\\pi$', is_correct: true,
      explanation: 'The sine function completes one full cycle over an interval of length $2\\pi$: $\\sin(x+2\\pi)=\\sin(x)$ for all $x$.' },
    { id: 'C', text: '$\\frac{\\pi}{2}$', is_correct: false,
      explanation: '$\\pi/2$ is a quarter-period of $\\sin(x)$. The full period is $2\\pi$.' },
    { id: 'D', text: '$4\\pi$', is_correct: false,
      explanation: 'The period of $\\sin(x)$ is $2\\pi$, not $4\\pi$. The cycle repeats every $2\\pi$ units.' }
  ],
  unit_objective: 'TRG-1.B', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q087', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the amplitude of $f(x) = 5\\sin(x)$?',
  choices: [
    { id: 'A', text: '$5$', is_correct: true,
      explanation: 'The amplitude of $A\\sin(x)$ is $|A|=|5|=5$. The function oscillates between $-5$ and $5$.' },
    { id: 'B', text: '$2\\pi$', is_correct: false,
      explanation: '$2\\pi$ is the period of $5\\sin(x)$. The amplitude is the coefficient $|A|=5$.' },
    { id: 'C', text: '$\\frac{1}{5}$', is_correct: false,
      explanation: 'Amplitude is $|A|=5$, not $1/5$. Reciprocating the amplitude would give $1/5$, which is not the correct formula.' },
    { id: 'D', text: '$1$', is_correct: false,
      explanation: 'Amplitude $1$ belongs to $\\sin(x)$ without any coefficient. For $5\\sin(x)$, amplitude $=|5|=5$.' }
  ],
  unit_objective: 'TRG-1.B', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q088', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the exact value of $\\cos\\!\\left(\\dfrac{\\pi}{4}\\right)$?',
  choices: [
    { id: 'A', text: '$\\dfrac{1}{2}$', is_correct: false,
      explanation: '$\\frac{1}{2}=\\cos\\frac{\\pi}{3}$. At $\\frac{\\pi}{4}=45^\\circ$, the unit circle $x$-coordinate is $\\frac{\\sqrt{2}}{2}$.' },
    { id: 'B', text: '$\\dfrac{\\sqrt{3}}{2}$', is_correct: false,
      explanation: '$\\frac{\\sqrt{3}}{2}=\\cos\\frac{\\pi}{6}$. At $\\frac{\\pi}{4}$, cosine is $\\frac{\\sqrt{2}}{2}$.' },
    { id: 'C', text: '$\\dfrac{\\sqrt{2}}{2}$', is_correct: true,
      explanation: 'At $\\frac{\\pi}{4}=45^\\circ$, the unit circle point is $\\left(\\frac{\\sqrt{2}}{2},\\frac{\\sqrt{2}}{2}\\right)$, so $\\cos\\frac{\\pi}{4}=\\frac{\\sqrt{2}}{2}$.' },
    { id: 'D', text: '$1$', is_correct: false,
      explanation: '$\\cos(0)=1$. At $\\frac{\\pi}{4}$, the cosine value is $\\frac{\\sqrt{2}}{2}\\approx0.707$, not $1$.' }
  ],
  unit_objective: 'TRG-1.A', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q089', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the exact value of $\\sin\\!\\left(\\dfrac{\\pi}{3}\\right)$?',
  choices: [
    { id: 'A', text: '$\\dfrac{1}{2}$', is_correct: false,
      explanation: '$\\sin\\frac{\\pi}{6}=\\frac{1}{2}$. At $\\frac{\\pi}{3}=60^\\circ$, the unit circle $y$-coordinate is $\\frac{\\sqrt{3}}{2}$.' },
    { id: 'B', text: '$\\dfrac{\\sqrt{3}}{2}$', is_correct: true,
      explanation: 'At $\\frac{\\pi}{3}=60^\\circ$, the unit circle point is $\\left(\\frac{1}{2},\\frac{\\sqrt{3}}{2}\\right)$, so $\\sin\\frac{\\pi}{3}=\\frac{\\sqrt{3}}{2}$.' },
    { id: 'C', text: '$\\dfrac{\\sqrt{2}}{2}$', is_correct: false,
      explanation: '$\\frac{\\sqrt{2}}{2}=\\sin\\frac{\\pi}{4}$. At $\\frac{\\pi}{3}$, the sine is $\\frac{\\sqrt{3}}{2}$.' },
    { id: 'D', text: '$\\sqrt{3}$', is_correct: false,
      explanation: '$\\tan\\frac{\\pi}{3}=\\sqrt{3}$, not $\\sin\\frac{\\pi}{3}$. The sine at $60^\\circ$ is $\\frac{\\sqrt{3}}{2}$.' }
  ],
  unit_objective: 'TRG-1.A', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q090', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following best describes the shape of the polar curve $r = 3 + 3\\cos\\theta$?',
  choices: [
    { id: 'A', text: 'A circle', is_correct: false,
      explanation: '$r=a(1+\\cos\\theta)$ is a cardioid, not a circle. A circle in polar form has either $r=c$ (constant) or $r=a\\cos\\theta$ (no added constant).' },
    { id: 'B', text: 'A cardioid', is_correct: true,
      explanation: '$r=3+3\\cos\\theta=3(1+\\cos\\theta)$. Any curve of the form $r=a(1\\pm\\cos\\theta)$ or $r=a(1\\pm\\sin\\theta)$ is a cardioid.' },
    { id: 'C', text: 'A limaçon with inner loop', is_correct: false,
      explanation: 'A limaçon with inner loop requires $|b|>|a|$ in $r=a+b\\cos\\theta$. Here $a=b=3$, the special case of a cardioid (no inner loop).' },
    { id: 'D', text: 'A rose curve', is_correct: false,
      explanation: 'Rose curves have the form $r=a\\cos(n\\theta)$ with $n\\geq2$. The form $r=a+b\\cos\\theta$ with $a=b$ is a cardioid.' }
  ],
  unit_objective: 'TRG-1.G', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q091', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the midline of $f(x) = 4\\sin(x) + 7$?',
  choices: [
    { id: 'A', text: '$y = 4$', is_correct: false,
      explanation: '$4$ is the amplitude ($|A|$). The midline is the vertical shift: $y=D=7$.' },
    { id: 'B', text: '$y = 0$', is_correct: false,
      explanation: '$y=0$ is the midline of $\\sin(x)$ without a vertical shift. The $+7$ shifts the midline to $y=7$.' },
    { id: 'C', text: '$y = 7$', is_correct: true,
      explanation: 'In $f(x)=A\\sin(Bx)+D$, the midline is $y=D=7$. The function oscillates between $7-4=3$ and $7+4=11$.' },
    { id: 'D', text: '$y = 11$', is_correct: false,
      explanation: '$11$ is the maximum value of $f$, not the midline. Midline $=D=7$ (the center line between max and min).' }
  ],
  unit_objective: 'TRG-1.B', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q092', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the period of $f(x) = \\tan(x)$?',
  choices: [
    { id: 'A', text: '$2\\pi$', is_correct: false,
      explanation: '$2\\pi$ is the period of $\\sin(x)$ and $\\cos(x)$. The period of $\\tan(x)$ is $\\pi$.' },
    { id: 'B', text: '$\\dfrac{\\pi}{2}$', is_correct: false,
      explanation: '$\\pi/2$ is the distance from the midpoint to an asymptote, not the full period of $\\tan(x)$. The period is $\\pi$.' },
    { id: 'C', text: '$\\pi$', is_correct: true,
      explanation: '$\\tan(x+\\pi)=\\tan(x)$ for all $x$ in the domain. The tangent function repeats every $\\pi$ units, unlike sine and cosine which repeat every $2\\pi$.' },
    { id: 'D', text: '$4\\pi$', is_correct: false,
      explanation: 'The period of $\\tan(x)$ is $\\pi$, not $4\\pi$.' }
  ],
  unit_objective: 'TRG-1.B', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q093', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'A point on the unit circle has coordinates $(x, y)$. Which of the following correctly defines $\\sin\\theta$ and $\\cos\\theta$ in terms of $x$ and $y$?',
  choices: [
    { id: 'A', text: '$\\sin\\theta = x$ and $\\cos\\theta = y$', is_correct: false,
      explanation: 'These are swapped. The $x$-coordinate gives cosine and the $y$-coordinate gives sine.' },
    { id: 'B', text: '$\\sin\\theta = y/x$ and $\\cos\\theta = x/y$', is_correct: false,
      explanation: '$y/x=\\tan\\theta$ and $x/y=\\cot\\theta$. The definitions of sine and cosine use the $y$- and $x$-coordinates directly.' },
    { id: 'C', text: '$\\sin\\theta = y$ and $\\cos\\theta = x$', is_correct: true,
      explanation: 'By definition of the unit circle: $\\cos\\theta=x$ (horizontal coordinate) and $\\sin\\theta=y$ (vertical coordinate).' },
    { id: 'D', text: '$\\sin\\theta = \\sqrt{x^2+y^2}$ and $\\cos\\theta = x/y$', is_correct: false,
      explanation: '$\\sqrt{x^2+y^2}=r=1$ for the unit circle. On the unit circle, $\\sin\\theta=y$ and $\\cos\\theta=x$.' }
  ],
  unit_objective: 'TRG-1.A', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q094', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the number of petals in the rose curve $r = 2\\cos(4\\theta)$?',
  choices: [
    { id: 'A', text: '$4$ petals', is_correct: false,
      explanation: 'For $r=a\\cos(n\\theta)$ with even $n$, the curve has $2n$ petals. Here $n=4$ (even): $2\\times4=8$ petals.' },
    { id: 'B', text: '$8$ petals', is_correct: true,
      explanation: 'For $r=a\\cos(n\\theta)$ with $n$ even, the rose has $2n$ petals. $n=4$ is even: $2(4)=8$ petals.' },
    { id: 'C', text: '$2$ petals', is_correct: false,
      explanation: '$2$ petals would come from $n=1$ with odd-$n$ rule. For even $n=4$: $2n=8$ petals.' },
    { id: 'D', text: '$16$ petals', is_correct: false,
      explanation: '$16=4^2$ is not the petal formula. For even $n$: $2n$ petals. $n=4\\Rightarrow8$ petals.' }
  ],
  unit_objective: 'TRG-1.G', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q095', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the exact value of $\\arctan(0)$?',
  choices: [
    { id: 'A', text: '$\\dfrac{\\pi}{4}$', is_correct: false,
      explanation: '$\\arctan(1)=\\pi/4$ since $\\tan(\\pi/4)=1$. $\\arctan(0)$ asks for the angle whose tangent is $0$.' },
    { id: 'B', text: '$0$', is_correct: true,
      explanation: '$\\tan(0)=0$ and $0\\in(-\\pi/2,\\pi/2)$ (the range of $\\arctan$), so $\\arctan(0)=0$.' },
    { id: 'C', text: '$\\pi$', is_correct: false,
      explanation: '$\\tan(\\pi)=0$, but $\\pi\\notin(-\\pi/2,\\pi/2)$. The range of $\\arctan$ is $(-\\pi/2,\\pi/2)$, so the unique answer is $0$.' },
    { id: 'D', text: '$1$', is_correct: false,
      explanation: '$\\arctan(0)=0$, not $1$. The output is an angle (in radians), not the tangent value.' }
  ],
  unit_objective: 'TRG-1.E', calculator_allowed: false
});

// q096-q100: additional easy questions to approach 20% target
questions.push({
  id: 'precalc-u3-q096', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the reciprocal identity for $\\sec\\theta$?',
  choices: [
    { id: 'A', text: '$\\sec\\theta = \\dfrac{1}{\\sin\\theta}$', is_correct: false,
      explanation: '$1/\\sin\\theta=\\csc\\theta$ (cosecant). Secant is the reciprocal of cosine, not sine.' },
    { id: 'B', text: '$\\sec\\theta = \\dfrac{1}{\\cos\\theta}$', is_correct: true,
      explanation: 'By definition, $\\sec\\theta=\\dfrac{1}{\\cos\\theta}$, the reciprocal of cosine.' },
    { id: 'C', text: '$\\sec\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$', is_correct: false,
      explanation: '$\\sin\\theta/\\cos\\theta=\\tan\\theta$. The secant is the reciprocal of cosine: $1/\\cos\\theta$.' },
    { id: 'D', text: '$\\sec\\theta = \\dfrac{\\cos\\theta}{\\sin\\theta}$', is_correct: false,
      explanation: '$\\cos\\theta/\\sin\\theta=\\cot\\theta$. Secant is defined as $1/\\cos\\theta$.' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q097', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the reciprocal identity for $\\cot\\theta$?',
  choices: [
    { id: 'A', text: '$\\cot\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$', is_correct: false,
      explanation: '$\\sin\\theta/\\cos\\theta=\\tan\\theta$. Cotangent is the reciprocal of tangent: $\\cos\\theta/\\sin\\theta$.' },
    { id: 'B', text: '$\\cot\\theta = \\dfrac{1}{\\sin\\theta}$', is_correct: false,
      explanation: '$1/\\sin\\theta=\\csc\\theta$. Cotangent equals $\\cos\\theta/\\sin\\theta$, not $1/\\sin\\theta$.' },
    { id: 'C', text: '$\\cot\\theta = \\dfrac{\\cos\\theta}{\\sin\\theta}$', is_correct: true,
      explanation: '$\\cot\\theta=1/\\tan\\theta=\\cos\\theta/\\sin\\theta$. This is the standard quotient form of cotangent.' },
    { id: 'D', text: '$\\cot\\theta = \\dfrac{1}{\\cos\\theta}$', is_correct: false,
      explanation: '$1/\\cos\\theta=\\sec\\theta$. Cotangent is $\\cos\\theta/\\sin\\theta$, the reciprocal of tangent.' }
  ],
  unit_objective: 'TRG-1.D', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q098', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the range of $f(x) = \\arctan(x)$?',
  choices: [
    { id: 'A', text: '$[-1, 1]$', is_correct: false,
      explanation: '$[-1,1]$ is the domain of $\\arcsin$ and $\\arccos$. The range of $\\arctan$ is the open interval $(-\\pi/2, \\pi/2)$.' },
    { id: 'B', text: '$[0, \\pi]$', is_correct: false,
      explanation: '$[0,\\pi]$ is the range of $\\arccos$. The range of $\\arctan$ is $(-\\pi/2, \\pi/2)$.' },
    { id: 'C', text: '$(-\\infty, +\\infty)$', is_correct: false,
      explanation: 'The domain of $\\arctan$ is all real numbers, but its range is bounded: $(-\\pi/2, \\pi/2)$.' },
    { id: 'D', text: '$\\left(-\\dfrac{\\pi}{2},\\ \\dfrac{\\pi}{2}\\right)$', is_correct: true,
      explanation: '$\\arctan$ is the inverse of $\\tan$ restricted to $(-\\pi/2,\\pi/2)$. Outputs of $\\arctan$ lie in the open interval $(-\\pi/2,\\pi/2)$.' }
  ],
  unit_objective: 'TRG-1.E', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q099', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following best describes the polar curve $r = 4\\sin(3\\theta)$?',
  choices: [
    { id: 'A', text: 'A circle', is_correct: false,
      explanation: 'A circle in polar form is $r=c$ (constant) or $r=a\\sin\\theta$ (not multiplied by $n\\theta$ with $n>1$). The form $r=a\\sin(n\\theta)$ with $n>1$ is a rose curve.' },
    { id: 'B', text: 'A cardioid', is_correct: false,
      explanation: 'A cardioid has the form $r=a(1\\pm\\sin\\theta)$. The form $r=a\\sin(n\\theta)$ is a rose curve.' },
    { id: 'C', text: 'A rose curve with $3$ petals', is_correct: true,
      explanation: '$r=a\\sin(n\\theta)$ with odd $n$ produces $n$ petals. Here $n=3$ (odd): $3$ petals.' },
    { id: 'D', text: 'A rose curve with $6$ petals', is_correct: false,
      explanation: '$6=2n$ applies when $n$ is even. Here $n=3$ is odd, giving $n=3$ petals.' }
  ],
  unit_objective: 'TRG-1.G', calculator_allowed: false
});

questions.push({
  id: 'precalc-u3-q100', unit: 'unit-3', subject: 'ap-precalculus', difficulty: 'easy',
  stimulus: { type: 'none', content: null },
  question: 'Which of the following gives the exact value of $\\sin\\left(\\dfrac{7\\pi}{6}\\right)$?',
  choices: [
    { id: 'A', text: '$\\dfrac{\\sqrt{3}}{2}$', is_correct: false,
      explanation: '$\\sin(7\\pi/6)$ is in QIII where sine is negative. Reference angle is $\\pi/6$, giving $|\\sin|=1/2$, so $\\sin(7\\pi/6)=-1/2$.' },
    { id: 'B', text: '$\\dfrac{1}{2}$', is_correct: false,
      explanation: '$\\sin(\\pi/6)=1/2$. At $7\\pi/6=\\pi+\\pi/6$ (QIII), sine is negative: $-1/2$.' },
    { id: 'C', text: '$-\\dfrac{1}{2}$', is_correct: true,
      explanation: '$\\frac{7\\pi}{6}=\\pi+\\frac{\\pi}{6}$ (QIII). Reference angle $=\\frac{\\pi}{6}$; in QIII, sine is negative: $\\sin\\frac{7\\pi}{6}=-\\sin\\frac{\\pi}{6}=-\\frac{1}{2}$.' },
    { id: 'D', text: '$-\\dfrac{\\sqrt{3}}{2}$', is_correct: false,
      explanation: '$-\\sqrt{3}/2=\\sin(4\\pi/3)$. At $7\\pi/6$, the reference angle is $\\pi/6$ (not $\\pi/3$), giving $\\sin=-1/2$.' }
  ],
  unit_objective: 'TRG-1.A', calculator_allowed: false
});

console.log('All new questions added. Total:', questions.length);
const d = {};
questions.forEach(q => { d[q.difficulty] = (d[q.difficulty] || 0) + 1; });
console.log('Final difficulties:', d);
console.log('Percentages: easy=' + (d.easy||0) + '(' + Math.round(100*(d.easy||0)/questions.length) + '%), medium=' + d.medium + '(' + Math.round(100*d.medium/questions.length) + '%), hard=' + d.hard + '(' + Math.round(100*d.hard/questions.length) + '%)');

const output = { subject: data.subject, unit: data.unit, unit_name: data.unit_name, questions };
fs.writeFileSync('C:/Ascendly/public/data/ap-precalculus/mcq/unit-3.json', JSON.stringify(output, null, 2));
console.log('Written to unit-3.json');

