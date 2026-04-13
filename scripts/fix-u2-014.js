const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/ap-calculus-ab/mcq/unit-2.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const before = data.questions.length;
const idx = data.questions.findIndex(q => q.id === 'calc-mcq-u2-014');
if (idx === -1) { console.error('Question u2-014 not found!'); process.exit(1); }

data.questions.splice(idx, 1);
const after = data.questions.length;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('unit-2.json updated — u2-014 removed at index', idx);
console.log('Questions:', before, '->', after);
