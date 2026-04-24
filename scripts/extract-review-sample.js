#!/usr/bin/env node
// Extract a stratified sample of rewritten questions for a Reviewer subagent.
// Prefers questions where truncation happened (highest failure risk).

const fs = require('fs');
const path = require('path');

const SUBJECTS = [
  { s: 'ap-world-history', n: 10 },
  { s: 'ap-government',    n: 6  },
  { s: 'ap-chemistry',     n: 5  },
  { s: 'ap-psychology',    n: 5  },
  { s: 'ap-csp',           n: 4  },
];

const rng = (() => { let seed = 42; return () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; })();

const out = [];

for (const { s, n } of SUBJECTS) {
  const rewriteDir = path.join('.planning', 'distractor-rewrites');
  const batchFiles = fs.readdirSync(rewriteDir)
    .filter(f => f.startsWith(`${s}-batch-`) && f.endsWith('.json'));
  if (batchFiles.length === 0) continue;

  const allRewrites = [];
  for (const bf of batchFiles) {
    const arr = JSON.parse(fs.readFileSync(path.join(rewriteDir, bf), 'utf8'));
    allRewrites.push(...arr);
  }

  const mcqDir = path.join('public', 'data', s, 'mcq');
  const unitFiles = fs.readdirSync(mcqDir).filter(f => f.endsWith('.json'));
  const qIndex = new Map();
  for (const uf of unitFiles) {
    const d = JSON.parse(fs.readFileSync(path.join(mcqDir, uf), 'utf8'));
    for (const q of d.questions || []) qIndex.set(q.id, q);
  }

  const candidates = allRewrites
    .map(r => qIndex.get(r.question_id))
    .filter(Boolean)
    .filter(q => q.choices.length === 4);

  const shuffled = [...candidates].sort(() => rng() - 0.5).slice(0, n);
  for (const q of shuffled) {
    const correct = q.choices.find(c => c.is_correct);
    const distractors = q.choices.filter(c => !c.is_correct);
    out.push({
      subject: s,
      id: q.id,
      stem: q.question,
      correct: correct.text,
      distractors: distractors.map(d => ({ id: d.id, text: d.text, explanation: d.explanation })),
    });
  }
}

const outPath = path.join('.planning', 'distractor-rewrites', 'review-sample.jsonl');
fs.writeFileSync(outPath, out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log(`Wrote ${out.length} sample questions to ${outPath}`);
console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
