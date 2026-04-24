#!/usr/bin/env node
// Extracts minimal per-question payloads for distractor-padding agents.
// Output: one JSONL file per subject, one question object per line.
// Each line ~500-800 tokens — far smaller than reading full MCQ files.

const fs = require('fs');
const path = require('path');

const subjects = process.argv.slice(2);
if (subjects.length === 0) {
  console.error('Usage: node extract-distractor-payloads.js <subject> [<subject>...]');
  process.exit(1);
}

const worklistDir = path.join('.planning', 'mcq-bias-worklists');
const outDir = path.join('.planning', 'distractor-payloads');
fs.mkdirSync(outDir, { recursive: true });

for (const subject of subjects) {
  const wl = JSON.parse(fs.readFileSync(path.join(worklistDir, `${subject}.json`), 'utf8'));
  const items = wl.items;
  const fileCache = new Map();
  const output = [];

  for (const item of items) {
    if (!fileCache.has(item.file)) {
      fileCache.set(item.file, JSON.parse(fs.readFileSync(item.file, 'utf8')));
    }
    const unit = fileCache.get(item.file);
    const q = unit.questions.find(qq => qq.id === item.question_id);
    if (!q) continue;
    const correct = q.choices.find(c => c.is_correct);
    const distractors = q.choices.filter(c => !c.is_correct);
    output.push({
      id: q.id,
      stem: q.question,
      correct_text: correct.text,
      target_len: correct.text.length - 5,
      distractors: distractors.map(d => ({
        id: d.id,
        old_text: d.text,
        explanation: d.explanation,
      })),
    });
  }

  const outPath = path.join(outDir, `${subject}.jsonl`);
  fs.writeFileSync(outPath, output.map(o => JSON.stringify(o)).join('\n') + '\n');
  console.log(`${subject}: ${output.length} payloads → ${outPath}`);
}
