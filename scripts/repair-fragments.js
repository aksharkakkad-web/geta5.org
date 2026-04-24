#!/usr/bin/env node
// Programmatic repair of distractor fragments. Iteratively applies deterministic
// fixes for known fragment patterns until stable.

const fs = require('fs');
const path = require('path');

const SUBJECTS = ['ap-world-history', 'ap-government', 'ap-chemistry', 'ap-psychology', 'ap-csp'];

// Words that are almost certainly not a natural end of a sentence/phrase
const CLOSED_CLASS = '(and|or|but|so|yet|nor|for|that|which|whose|whom|who|as|a|an|the|of|to|with|in|on|at|by|from|through|across|within|into|onto|upon|over|under|despite|although|because|since|while|when|where|how|why|than|against|between|among|about|toward|towards|before|after|during|every|all|any|no|some|most|few|several|various|both|either|neither)';
// Adjective/participle-ish suffixes (no noun following = likely fragment)
const ADJ_SUFFIX_RE = /(ous|ive|ing|ed|al|able|ible|ary|ory|ial|ical|ful|less|ant|ent|ic|ate)$/i;

function fragmentIssues(text) {
  const t = text.trim();
  const issues = [];
  const dashes = (t.match(/[—–]/g) || []).length;
  if (dashes % 2 === 1) issues.push('unbalanced-dash');
  const open = (t.match(/\(/g) || []).length;
  const close = (t.match(/\)/g) || []).length;
  if (open !== close) issues.push('unbalanced-parens');
  if (new RegExp('\\s+' + CLOSED_CLASS + '$', 'i').test(t)) issues.push('dangling-closed-class');
  if (new RegExp('\\s+' + CLOSED_CLASS + '\\s+\\w+$', 'i').test(t) && !/[.!?]$/.test(t)) {
    // ends with "preposition/conj + one word" — and it's not closed with punctuation
    const lastWord = t.match(/\w+$/)?.[0] || '';
    if (ADJ_SUFFIX_RE.test(lastWord) || lastWord.length <= 12) issues.push('preposition-plus-word');
  }
  if (/,\s+\w{1,25}$/.test(t) && !/[.!?]$/.test(t)) issues.push('mid-list');
  return issues.length ? issues : null;
}

function repairFragment(text) {
  let t = text.trim();
  const original = t;

  for (let iter = 0; iter < 15; iter++) {
    const before = t;

    // Unbalanced em-dash
    const dashes = (t.match(/[—–]/g) || []).length;
    if (dashes % 2 === 1) {
      if (dashes === 1) {
        t = t.replace(/\s*[—–]\s*/, ', ');
      } else {
        const lastDash = Math.max(t.lastIndexOf('—'), t.lastIndexOf('–'));
        if (lastDash > 0) t = t.slice(0, lastDash).trim();
      }
    }

    // Unbalanced parens
    const op = (t.match(/\(/g) || []).length;
    const cp = (t.match(/\)/g) || []).length;
    if (op > cp) {
      const lastOpen = t.lastIndexOf('(');
      if (lastOpen > 0) t = t.slice(0, lastOpen).trim();
    } else if (cp > op) {
      const lastClose = t.lastIndexOf(')');
      if (lastClose > 0) t = t.slice(0, lastClose).trim();
    }

    // Dangling closed-class word at very end
    const danglingClosedClass = new RegExp('\\s+' + CLOSED_CLASS + '$', 'i');
    if (danglingClosedClass.test(t)) t = t.replace(danglingClosedClass, '').trim();

    // Preposition/conjunction + trailing word (likely incomplete, esp. if adj-looking)
    // e.g., "and foreign", "suffered continuous", "over which", "any legitimate", "because since"
    // Drop the trailing 2 words if that pattern matches and text doesn't end in sentence punct.
    if (!/[.!?]$/.test(t)) {
      const m = t.match(new RegExp('(.*?)\\s+' + CLOSED_CLASS + '\\s+\\w+$', 'i'));
      if (m) {
        const lastWord = t.match(/\w+$/)?.[0] || '';
        // Only drop if the last word looks adjective/determiner-ish OR is a short function word
        if (ADJ_SUFFIX_RE.test(lastWord) || lastWord.length <= 12) {
          t = m[1].trim();
        }
      }
    }

    // Dangling "determiner + adjective" without noun
    const detAdj = /\s+(any|some|no|the|a|an|every|all|most|few|several|various|both|either|neither)\s+\w+(ous|ive|ing|ed|al|able|ible|ary|ory|ial|ical|ful|less|ant|ent|ic|ate)$/i;
    if (detAdj.test(t)) t = t.replace(detAdj, '').trim();

    // Mid-list
    const midList = t.match(/^(.*),\s+\w{1,25}$/);
    if (midList && !/[.!?]$/.test(t)) t = midList[1].trim();

    // Trailing comma/semicolon/colon
    t = t.replace(/[,;:]+$/, '').trim();

    if (t === before) break;
  }

  if (t.length < 25 || t.length < original.length * 0.3) return null;
  return t;
}

// Scan all subjects' distractors for fragments, including ones we didn't touch
// (safer not to touch original unrewritten distractors, but if they have issues,
//  log them for visibility).
const batchMap = new Map();
for (const subject of SUBJECTS) {
  const rewriteDir = path.join('.planning', 'distractor-rewrites');
  if (!fs.existsSync(rewriteDir)) continue;
  const files = fs.readdirSync(rewriteDir).filter(f => f.startsWith(`${subject}-batch-`) && f.endsWith('.json'));
  for (const f of files) {
    const arr = JSON.parse(fs.readFileSync(path.join(rewriteDir, f), 'utf8'));
    for (const r of arr) {
      for (const d of r.new_distractors || []) batchMap.set(`${r.question_id}::${d.id}`, true);
    }
  }
}

let found = 0, repaired = 0, unrepairable = 0;
const unrepairableList = [];

for (const subject of SUBJECTS) {
  const mcqDir = path.join('public', 'data', subject, 'mcq');
  if (!fs.existsSync(mcqDir)) continue;
  const units = fs.readdirSync(mcqDir).filter(f => f.endsWith('.json'));
  for (const uf of units) {
    const fp = path.join(mcqDir, uf);
    const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
    let dirty = false;
    for (const q of d.questions || []) {
      for (const c of q.choices) {
        if (c.is_correct) continue;
        // Only touch distractors we rewrote this session
        if (!batchMap.has(`${q.id}::${c.id}`)) continue;
        const issues = fragmentIssues(c.text);
        if (!issues) continue;
        found++;
        const fixed = repairFragment(c.text);
        if (fixed && fixed !== c.text && !fragmentIssues(fixed)) {
          c.text = fixed;
          repaired++;
          dirty = true;
        } else if (!fixed) {
          unrepairable++;
          unrepairableList.push(`${q.id}/${c.id}: ${c.text.slice(-60)}`);
        }
      }
    }
    if (dirty) fs.writeFileSync(fp, JSON.stringify(d, null, 2));
  }
}

console.log(`Fragments found: ${found}`);
console.log(`Repaired cleanly: ${repaired}`);
console.log(`Unrepairable: ${unrepairable}`);
if (unrepairableList.length) {
  console.log('\nUnrepairable samples:');
  unrepairableList.slice(0, 10).forEach(u => console.log('  - ' + u));
}
