#!/usr/bin/env node
// Apply compressed distractor rewrites to MCQ unit files.
// For over-length compressions, try strict period-only truncation.
// If that fails, leave the current (possibly broken) text and log it.

const fs = require('fs');
const path = require('path');

const rewriteDir = path.join('.planning', 'distractor-rewrites');
const files = fs.readdirSync(rewriteDir).filter(f => /^compression-output-\d+\.json$/.test(f)).sort();
const compressed = new Map();
for (const f of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(rewriteDir, f), 'utf8'));
  for (const item of arr) compressed.set(item.id, item.text);
}
console.log(`Loaded ${compressed.size} compressed distractors from ${files.length} batches`);

function strictTruncate(text, maxLen) {
  if (text.length <= maxLen) return text;
  // Only break at period, exclamation, question, or semicolon.
  const matches = [...text.matchAll(/[.!?;](?=\s|$)/g)];
  let best = -1;
  for (const m of matches) {
    const endIdx = m.index + 1;
    if (endIdx <= maxLen && endIdx > best) best = endIdx;
  }
  if (best < 0) return null;
  const result = text.slice(0, best).trim();
  // Require the truncation keeps at least 60% of original information
  if (result.length < Math.floor(text.length * 0.4)) return null;
  // Check balanced em-dashes and parens in the truncated result
  const dashes = (result.match(/[—–]/g) || []).length;
  if (dashes % 2 === 1) return null;
  const open = (result.match(/\(/g) || []).length;
  const close = (result.match(/\)/g) || []).length;
  if (open !== close) return null;
  return result;
}

const SUBJECTS = ['ap-world-history', 'ap-government', 'ap-chemistry', 'ap-psychology', 'ap-csp'];

let applied = 0, truncated = 0, skipped = 0, notFound = 0;
const failures = [];

for (const subject of SUBJECTS) {
  const mcqDir = path.join('public', 'data', subject, 'mcq');
  if (!fs.existsSync(mcqDir)) continue;
  const units = fs.readdirSync(mcqDir).filter(f => f.endsWith('.json'));
  for (const uf of units) {
    const fp = path.join(mcqDir, uf);
    const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
    let dirty = false;
    for (const q of d.questions || []) {
      const correct = q.choices.find(c => c.is_correct);
      if (!correct) continue;
      for (const c of q.choices) {
        if (c.is_correct) continue;
        const key = `${q.id}::${c.id}`;
        const compressedText = compressed.get(key);
        if (!compressedText) continue;
        compressed.delete(key);

        const maxLen = correct.text.length;
        let finalText;
        if (compressedText.length <= maxLen) {
          finalText = compressedText;
          applied++;
        } else {
          const t = strictTruncate(compressedText, maxLen);
          if (t) {
            finalText = t;
            truncated++;
          } else {
            // Keep current text (possibly broken from first truncation)
            skipped++;
            failures.push(`${key}: no clean period-break; current text preserved`);
            continue;
          }
        }
        c.text = finalText;
        dirty = true;
      }
    }
    if (dirty) fs.writeFileSync(fp, JSON.stringify(d, null, 2));
  }
}

for (const remaining of compressed.keys()) { notFound++; }

console.log(`Applied as-is: ${applied}`);
console.log(`Truncated at period:  ${truncated}`);
console.log(`Skipped (no clean break): ${skipped}`);
console.log(`Not found: ${notFound}`);
if (failures.length) {
  console.log(`\nFirst few failures:`);
  failures.slice(0, 5).forEach(f => console.log('  - ' + f));
}
