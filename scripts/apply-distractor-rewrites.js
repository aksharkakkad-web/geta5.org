#!/usr/bin/env node
// Applies agent-generated distractor rewrites to MCQ unit files with smart
// length enforcement. If an agent output is too long for its question's
// correct_len, truncate at the nearest natural break (., ;, —, , or word boundary).
// If truncation can't produce a result within acceptable length range, fall
// back to the original distractor text (preserves content quality over bias fix
// for that one distractor).

const fs = require('fs');
const path = require('path');

const subject = process.argv[2];
if (!subject) {
  console.error('Usage: node apply-distractor-rewrites.js <subject>');
  process.exit(1);
}

const payloadPath = path.join('.planning', 'distractor-payloads', `${subject}.jsonl`);
const payloads = new Map();
fs.readFileSync(payloadPath, 'utf8').split('\n').filter(l => l).forEach(l => {
  const o = JSON.parse(l);
  payloads.set(o.id, o);
});

// Load all batch rewrite files
const rewriteDir = path.join('.planning', 'distractor-rewrites');
const batchFiles = fs.readdirSync(rewriteDir)
  .filter(f => f.startsWith(`${subject}-batch-`) && f.endsWith('.json'))
  .sort();
const rewrites = new Map();
for (const f of batchFiles) {
  const arr = JSON.parse(fs.readFileSync(path.join(rewriteDir, f), 'utf8'));
  for (const r of arr) rewrites.set(r.question_id, r);
}
console.log(`Loaded ${rewrites.size} rewrites from ${batchFiles.length} batch files`);

// Smart truncate: find the last natural break point at or before maxLen.
// Returns null if no acceptable truncation exists.
function smartTruncate(text, maxLen, minLen) {
  if (text.length <= maxLen) return text;

  // Try progressively weaker break points. Require result >= minLen.
  const breakPatterns = [
    /[.!?](?=\s|$)/g,   // sentence-ending
    /[;:](?=\s|$)/g,    // heavy clause
    /[—–](?=\s|$)/g,    // em/en dash
    /,(?=\s)/g,         // comma
    /\s/g,              // whitespace (word boundary)
  ];

  for (const pat of breakPatterns) {
    let lastIdx = -1;
    for (const m of text.matchAll(pat)) {
      const endIdx = m.index + m[0].length;
      if (endIdx > maxLen) break;
      if (endIdx >= minLen) lastIdx = endIdx;
    }
    if (lastIdx > 0) {
      let candidate = text.slice(0, lastIdx).trim();
      // Drop dangling trailing conjunction/article
      const danglers = /\s+(and|or|but|so|that|which|whose|whom|who|as|a|an|the|of|to|for|with|in|on|at|by|from)$/i;
      while (danglers.test(candidate)) {
        candidate = candidate.replace(danglers, '').trim();
      }
      // Drop trailing comma after dangler removal
      candidate = candidate.replace(/[,;:—–]+$/, '').trim();
      if (candidate.length >= minLen && candidate.length <= maxLen) {
        return candidate;
      }
    }
  }
  return null;
}

// Stats
let kept = 0, truncated = 0, fellBack = 0, missing = 0;

// Find every MCQ unit file for the subject
const mcqDir = path.join('public', 'data', subject, 'mcq');
const unitFiles = fs.readdirSync(mcqDir).filter(f => f.endsWith('.json'));

for (const uf of unitFiles) {
  const fp = path.join(mcqDir, uf);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let dirty = false;
  for (const q of data.questions || []) {
    const rw = rewrites.get(q.id);
    if (!rw) continue;
    const payload = payloads.get(q.id);
    if (!payload) { missing++; continue; }
    const correctLen = payload.correct_text.length;
    // acceptable new length: between 60% of correct and correct itself
    const maxLen = correctLen;
    const minLen = Math.max(40, Math.floor(correctLen * 0.6));

    for (const nd of rw.new_distractors || []) {
      const choice = q.choices.find(c => c.id === nd.id);
      if (!choice || choice.is_correct) continue;
      if (!nd.text) continue;

      let finalText;
      if (nd.text.length <= maxLen && nd.text.length >= minLen) {
        finalText = nd.text;
        kept++;
      } else if (nd.text.length > maxLen) {
        const t = smartTruncate(nd.text, maxLen, minLen);
        if (t) {
          finalText = t;
          truncated++;
        } else {
          // fall back to original distractor text — preserve quality, lose bias fix for this one
          finalText = choice.text;
          fellBack++;
        }
      } else {
        // too short — use agent output as-is (better than nothing)
        finalText = nd.text;
        kept++;
      }
      choice.text = finalText;
      dirty = true;
    }
  }
  if (dirty) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
    console.log(`  wrote ${uf}`);
  }
}

console.log(`\nDistractors:`);
console.log(`  Kept as-is:   ${kept}`);
console.log(`  Truncated:    ${truncated}`);
console.log(`  Fell back:    ${fellBack} (kept original distractor text — no quality truncation available)`);
console.log(`  Missing:      ${missing}`);
