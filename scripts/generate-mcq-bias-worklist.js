#!/usr/bin/env node
// Outputs per-subject JSON work lists of MCQs where the correct answer is
// meaningfully longer than the distractors. Consumed by the distractor-
// padding agents. Thresholds are per-subject because severity varies.

const fs = require('fs');
const path = require('path');

// Threshold is the minimum char gap between correct answer and longest
// distractor. 15+ is the rough human-detectable threshold.
const SUBJECTS = {
  'ap-world-history': { gapThreshold: 15 },
  'ap-government':    { gapThreshold: 15 },
  'ap-csp':           { gapThreshold: 15 },
  'ap-chemistry':     { gapThreshold: 15 },
  'ap-psychology':    { gapThreshold: 15 },
};

const outDir = path.join(process.cwd(), '.planning', 'mcq-bias-worklists');
fs.mkdirSync(outDir, { recursive: true });

const summary = [];

for (const [subject, cfg] of Object.entries(SUBJECTS)) {
  const mcqDir = path.join('public', 'data', subject, 'mcq');
  if (!fs.existsSync(mcqDir)) continue;

  const files = fs.readdirSync(mcqDir).filter(f => f.endsWith('.json')).sort();
  const workItems = [];

  for (const f of files) {
    const filePath = path.join(mcqDir, f);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const q of data.questions || []) {
      const choices = q.choices || [];
      if (choices.length !== 4) continue;
      const correct = choices.find(c => c.is_correct);
      const distractors = choices.filter(c => !c.is_correct);
      if (!correct || distractors.length !== 3) continue;

      const cl = correct.text.length;
      const dLens = distractors.map(d => d.text.length);
      const maxDistractor = Math.max(...dLens);
      const gap = cl - maxDistractor;

      const isBiased = cfg.includeAllLongest
        ? cl >= maxDistractor
        : gap >= cfg.gapThreshold;

      if (!isBiased) continue;

      workItems.push({
        file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
        question_id: q.id,
        correct_len: cl,
        max_distractor_len: maxDistractor,
        gap,
        target_len_range: [Math.max(cl - 10, maxDistractor + 5), cl + 5],
      });
    }
  }

  const outPath = path.join(outDir, `${subject}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ subject, count: workItems.length, items: workItems }, null, 2));
  summary.push({ subject, biased_questions: workItems.length, files_touched: new Set(workItems.map(w => w.file)).size });
}

console.log('Work lists written to', outDir);
console.table(summary);
