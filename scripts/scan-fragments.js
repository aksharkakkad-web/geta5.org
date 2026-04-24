#!/usr/bin/env node
// Scans for truncation-induced fragments: distractors where the CURRENT
// applied text is shorter than the agent's original output AND shows
// grammar problems (unbalanced dashes, mid-list, dangling words).

const fs = require('fs');
const path = require('path');

const SUBJECTS = ['ap-world-history', 'ap-government', 'ap-chemistry', 'ap-psychology', 'ap-csp'];

function fragmentIssues(text) {
  const t = text.trim();
  const issues = [];

  // Unbalanced em/en dashes
  const dashes = (t.match(/[—–]/g) || []).length;
  if (dashes % 2 === 1) issues.push('unbalanced-dash');

  // Dangling word at end
  if (/\s+(and|or|but|so|yet|that|which|whose|whom|who|as|a|an|the|of|to|for|with|in|on|at|by|from|through|across|within|into|onto|upon|over|under|despite|although|because|since|while|when|where|how|why|than)$/i.test(t)) {
    issues.push('dangling-word');
  }

  // Mid-list: ends with comma + one short word (< 15 chars)
  if (/,\s+\w{1,15}$/.test(t) && !/[.!?]$/.test(t)) issues.push('mid-list');

  // Dangling determiner + adjective/participle (no noun): "any legitimate", "the continuous"
  if (/\s+(any|some|no|the|a|an|every|all|most|few|several|various|both|either|neither)\s+\w+(ous|ive|ing|ed|al|able|ible|ary|ory|ial|ical|ful|less)$/i.test(t)) {
    issues.push('dangling-adjective');
  }

  // Open parenthesis not closed
  if ((t.match(/\(/g) || []).length !== (t.match(/\)/g) || []).length) issues.push('unbalanced-parens');

  return issues.length ? issues.join(',') : null;
}

// Load batch rewrites (agent's pre-truncation output)
const batchMap = new Map();
for (const subject of SUBJECTS) {
  const rewriteDir = path.join('.planning', 'distractor-rewrites');
  if (!fs.existsSync(rewriteDir)) continue;
  const files = fs.readdirSync(rewriteDir).filter(f => f.startsWith(`${subject}-batch-`) && f.endsWith('.json'));
  for (const f of files) {
    const arr = JSON.parse(fs.readFileSync(path.join(rewriteDir, f), 'utf8'));
    for (const r of arr) {
      for (const d of r.new_distractors || []) {
        batchMap.set(`${r.question_id}::${d.id}`, { subject, question_id: r.question_id, choice_id: d.id, agent_text: d.text });
      }
    }
  }
}

const problems = [];
for (const subject of SUBJECTS) {
  const mcqDir = path.join('public', 'data', subject, 'mcq');
  if (!fs.existsSync(mcqDir)) continue;
  const units = fs.readdirSync(mcqDir).filter(f => f.endsWith('.json'));
  for (const uf of units) {
    const d = JSON.parse(fs.readFileSync(path.join(mcqDir, uf), 'utf8'));
    for (const q of d.questions || []) {
      for (const c of q.choices || []) {
        if (c.is_correct) continue;
        const batchEntry = batchMap.get(`${q.id}::${c.id}`);
        // Only check distractors we touched
        if (!batchEntry) continue;
        const current = c.text;
        const agent = batchEntry.agent_text;
        // Only check if truncation happened (current shorter than agent)
        if (current.length >= agent.length - 1) continue;
        const issues = fragmentIssues(current);
        if (issues) {
          const correct = q.choices.find(x => x.is_correct).text;
          problems.push({
            subject,
            question_id: q.id,
            choice_id: c.id,
            issue: issues,
            current_text: current,
            current_len: current.length,
            correct_len: correct.length,
            agent_text: agent,
            agent_len: agent.length,
            explanation: c.explanation,
          });
        }
      }
    }
  }
}

const counts = {};
for (const p of problems) counts[p.subject] = (counts[p.subject] || 0) + 1;
console.log('Truncation fragment scan:');
console.table(counts);
console.log(`Total truncation fragments: ${problems.length}`);

const outPath = path.join('.planning', 'distractor-rewrites', 'fragments.jsonl');
fs.writeFileSync(outPath, problems.map(p => JSON.stringify(p)).join('\n') + '\n');
console.log(`Details → ${outPath}`);
