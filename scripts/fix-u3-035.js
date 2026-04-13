const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/ap-calculus-ab/mcq/unit-3.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const replacement = {
  "id": "calc-mcq-u3-035",
  "difficulty": "hard",
  "question": "If $x^2 + xy + y^2 = 7$, which of the following gives $\\frac{d^2y}{dx^2}$ at the point $(1, 2)$?",
  "choices": [
    { "id": "A", "text": "$-\\frac{10}{27}$", "is_correct": true },
    { "id": "B", "text": "$-\\frac{4}{9}$", "is_correct": false },
    { "id": "C", "text": "$\\frac{2}{9}$", "is_correct": false },
    { "id": "D", "text": "$-\\frac{2}{3}$", "is_correct": false }
  ],
  "explanation": "Differentiate implicitly: $2x + y + xy' + 2yy' = 0$. At $(1,2)$: $2 + 2 + y' + 4y' = 0 \\Rightarrow y' = -4/5$. Differentiate again: $2 + y' + y' + xy'' + 2(y')^2 + 2yy'' = 0$. At $(1,2)$ with $y'=-4/5$: $2 + 2(-4/5) + y'' + 2(16/25) + 4y'' = 0$. Solving gives $y'' = -10/27$.",
  "choice_explanations": {
    "A": "Correct. Full implicit double differentiation yields $y'' = -10/27$ at $(1,2)$.",
    "B": "Incorrect. This results from an arithmetic error in the second differentiation step.",
    "C": "Incorrect. This has the wrong sign, likely from omitting the chain rule term.",
    "D": "Incorrect. This comes from evaluating only the first derivative and stopping prematurely."
  }
};

const idx = data.questions.findIndex(q => q.id === 'calc-mcq-u3-035');
if (idx === -1) { console.error('Question not found!'); process.exit(1); }

data.questions[idx] = replacement;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('unit-3.json updated — u3-035 replaced at index', idx);
