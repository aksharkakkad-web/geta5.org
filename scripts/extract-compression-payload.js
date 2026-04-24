#!/usr/bin/env node
// Builds a compact payload for a compression agent: for each flagged
// truncation fragment, include the agent's original long text + target
// length + explanation so the agent can write a clean short version.

const fs = require('fs');
const path = require('path');

const inputPath = path.join('.planning', 'distractor-rewrites', 'fragments.jsonl');
const lines = fs.readFileSync(inputPath, 'utf8').split('\n').filter(l => l);
const items = lines.map(l => JSON.parse(l));

const out = items.map(p => ({
  id: `${p.question_id}::${p.choice_id}`,
  long_text: p.agent_text,
  target_len: p.correct_len,
  explanation: p.explanation,
}));

const outPath = path.join('.planning', 'distractor-rewrites', 'compression-input.jsonl');
fs.writeFileSync(outPath, out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log(`Wrote ${out.length} items to ${outPath} (${(fs.statSync(outPath).size/1024).toFixed(1)} KB)`);
