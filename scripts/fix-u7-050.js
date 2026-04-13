const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/ap-calculus-ab/mcq/unit-7.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const replacement = {
  "id": "calc-mcq-u7-050",
  "difficulty": "hard",
  "question": "Which of the following gives the particular solution to $\\frac{dy}{dx} = y^2 \\cos x$ with initial condition $y(0) = 1$?",
  "choices": [
    { "id": "A", "text": "$y = \\frac{1}{1 - \\sin x}$", "is_correct": true },
    { "id": "B", "text": "$y = \\frac{1}{1 + \\sin x}$", "is_correct": false },
    { "id": "C", "text": "$y = e^{\\sin x}$", "is_correct": false },
    { "id": "D", "text": "$y = \\frac{1}{\\cos x - 1}$", "is_correct": false }
  ],
  "explanation": "Separate variables: $y^{-2}\\,dy = \\cos x\\,dx$. Integrate: $-y^{-1} = \\sin x + C$. Apply $y(0)=1$: $-1 = 0 + C$, so $C=-1$. Thus $-1/y = \\sin x - 1$, giving $y = \\frac{1}{1-\\sin x}$.",
  "choice_explanations": {
    "A": "Correct. Separating and integrating gives $-1/y = \\sin x - 1$, so $y = 1/(1-\\sin x)$.",
    "B": "Incorrect. This would result from a sign error when applying the initial condition.",
    "C": "Incorrect. This would come from incorrectly treating $dy/dx = y\\cos x$ (first-order linear, not $y^2\\cos x$).",
    "D": "Incorrect. This arises from integrating $\\cos x$ as $\\sin x - 1$ without properly applying separation."
  }
};

const idx = data.questions.findIndex(q => q.id === 'calc-mcq-u7-050');
if (idx === -1) { console.error('Question not found!'); process.exit(1); }

data.questions[idx] = replacement;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('unit-7.json updated — u7-050 replaced at index', idx);
