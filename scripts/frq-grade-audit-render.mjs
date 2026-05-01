#!/usr/bin/env node
// Renders an HTML report from audit cases + subagent verdicts.
//
// Usage:
//   node scripts/frq-grade-audit-render.mjs \
//     --cases tmp/frq-audit-cases.json \
//     --verdicts tmp/frq-audit-verdicts.json \
//     --out tmp/frq-audit-report.html
//
// The verdicts JSON is what the Sonnet subagent produces — an array of:
//   { submission_id, part_letter, independent_score, verdict, error_type, notes }

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    cases: 'tmp/frq-audit-cases.json',
    verdicts: 'tmp/frq-audit-verdicts.json',
    out: 'tmp/frq-audit-report.html',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--cases') args.cases = argv[++i];
    else if (a === '--verdicts') args.verdicts = argv[++i];
    else if (a === '--out') args.out = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv);

const casesDoc = JSON.parse(fs.readFileSync(args.cases, 'utf8'));
const verdictsDoc = JSON.parse(fs.readFileSync(args.verdicts, 'utf8'));
const verdicts = Array.isArray(verdictsDoc) ? verdictsDoc : (verdictsDoc.verdicts ?? []);
const verdictKey = v => `${v.submission_id}::${v.part_letter}`;
const verdictMap = new Map(verdicts.map(v => [verdictKey(v), v]));

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pre(s) {
  return `<pre>${esc(s)}</pre>`;
}

const VERDICTS = ['agrees-with-adi', 'adi-too-harsh', 'adi-too-lenient', 'unclear'];
const VERDICT_COLORS = {
  'agrees-with-adi': '#10b981',
  'adi-too-harsh': '#ef4444',
  'adi-too-lenient': '#f59e0b',
  'unclear': '#6b7280',
};

// ─── Aggregate ───────────────────────────────────────────────────────────
const totals = { count: casesDoc.cases.length, withVerdict: 0 };
const verdictCounts = Object.fromEntries(VERDICTS.map(v => [v, 0]));
const errorTypeCounts = {};
const bySubject = {};
const adiPointsTotal = { earned: 0, max: 0 };
const sonnetPointsTotal = { earned: 0, max: 0 };
const flippedToEarn = []; // cases where Sonnet awarded points Adi denied

for (const c of casesDoc.cases) {
  const v = verdictMap.get(verdictKey(c));
  bySubject[c.subject] = bySubject[c.subject] ?? { n: 0, harsh: 0, lenient: 0, agree: 0 };
  bySubject[c.subject].n++;
  adiPointsTotal.earned += c.part_earned;
  adiPointsTotal.max += c.part_max;
  if (v) {
    totals.withVerdict++;
    verdictCounts[v.verdict] = (verdictCounts[v.verdict] ?? 0) + 1;
    if (v.error_type) errorTypeCounts[v.error_type] = (errorTypeCounts[v.error_type] ?? 0) + 1;
    if (typeof v.independent_score === 'number') sonnetPointsTotal.earned += v.independent_score;
    sonnetPointsTotal.max += c.part_max;
    if (v.verdict === 'adi-too-harsh') bySubject[c.subject].harsh++;
    else if (v.verdict === 'adi-too-lenient') bySubject[c.subject].lenient++;
    else if (v.verdict === 'agrees-with-adi') bySubject[c.subject].agree++;
    if (typeof v.independent_score === 'number' && v.independent_score > c.part_earned) {
      flippedToEarn.push({ case: c, verdict: v });
    }
  }
}

const adiAcc = adiPointsTotal.max > 0 ? (adiPointsTotal.earned / adiPointsTotal.max * 100).toFixed(1) : '—';
const sonnetAcc = sonnetPointsTotal.max > 0 ? (sonnetPointsTotal.earned / sonnetPointsTotal.max * 100).toFixed(1) : '—';

// ─── Render ──────────────────────────────────────────────────────────────
const head = `<!doctype html>
<html><head><meta charset="utf-8"><title>FRQ Grader Audit</title>
<style>
  body { font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 1200px; margin: 0 auto; padding: 24px; color: #111; background: #fafafa; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 17px; margin-top: 32px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  h3 { font-size: 15px; margin-top: 18px; margin-bottom: 6px; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0; }
  .stat { background: white; border: 1px solid #e5e5e5; border-radius: 6px; padding: 10px 14px; }
  .stat .num { font-size: 22px; font-weight: 600; }
  .stat .lbl { font-size: 12px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; background: white; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { background: #f5f5f5; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
  .case { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 14px; }
  .case-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .case-meta { font-size: 12px; color: #666; }
  .verdict-pill { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; color: white; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
  .panel { background: #f7f7f7; border-radius: 6px; padding: 10px 12px; font-size: 13px; }
  .panel h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #666; margin: 0 0 6px; }
  pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; background: #f0f0f0; padding: 8px; border-radius: 4px; margin: 4px 0; max-height: 200px; overflow-y: auto; }
  .point { background: white; border: 1px solid #e5e5e5; border-radius: 4px; padding: 6px 10px; margin: 4px 0; font-size: 12px; }
  .point .pid { font-weight: 600; }
  .earned-0 { color: #ef4444; }
  .earned-pos { color: #10b981; }
  .badge { display: inline-block; padding: 1px 6px; background: #fef3c7; border-radius: 3px; font-size: 11px; }
  details { margin-top: 6px; }
  summary { cursor: pointer; font-size: 12px; color: #666; }
</style>
</head><body>`;

const summary = `
<h1>FRQ Grader Audit</h1>
<div class="case-meta">Generated ${esc(casesDoc.generated_at)} · ${casesDoc.cases.length} cases · args: ${esc(JSON.stringify(casesDoc.args))}</div>
<div class="summary">
  <div class="stat"><div class="num">${totals.count}</div><div class="lbl">Cases</div></div>
  <div class="stat"><div class="num">${totals.withVerdict}</div><div class="lbl">Verdicts received</div></div>
  <div class="stat"><div class="num">${adiAcc}%</div><div class="lbl">Adi accuracy on sample</div></div>
  <div class="stat"><div class="num">${sonnetAcc}%</div><div class="lbl">Independent accuracy on sample</div></div>
  <div class="stat"><div class="num">${flippedToEarn.length}</div><div class="lbl">Cases independent grader awarded points Adi denied</div></div>
</div>

<h2>Verdict mix</h2>
<table>
  <tr><th>Verdict</th><th>Count</th><th>%</th></tr>
  ${VERDICTS.map(v => {
    const c = verdictCounts[v] ?? 0;
    const pct = totals.withVerdict ? (c / totals.withVerdict * 100).toFixed(1) : '—';
    return `<tr><td><span class="verdict-pill" style="background:${VERDICT_COLORS[v]}">${v}</span></td><td>${c}</td><td>${pct}%</td></tr>`;
  }).join('')}
</table>

<h2>Error types (when disagreeing with Adi)</h2>
<table>
  <tr><th>Error type</th><th>Count</th></tr>
  ${Object.entries(errorTypeCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
    `<tr><td>${esc(k)}</td><td>${v}</td></tr>`
  ).join('') || '<tr><td colspan="2" style="color:#888">no error type data yet</td></tr>'}
</table>

<h2>By subject</h2>
<table>
  <tr><th>Subject</th><th>n</th><th>agree</th><th>too harsh</th><th>too lenient</th></tr>
  ${Object.entries(bySubject).sort((a, b) => b[1].n - a[1].n).map(([s, x]) =>
    `<tr><td>${esc(s)}</td><td>${x.n}</td><td>${x.agree}</td><td>${x.harsh}</td><td>${x.lenient}</td></tr>`
  ).join('')}
</table>

<h2>Cases</h2>
`;

const caseBlocks = casesDoc.cases.map(c => {
  const v = verdictMap.get(verdictKey(c));
  const verdictHtml = v
    ? `<span class="verdict-pill" style="background:${VERDICT_COLORS[v.verdict] ?? '#6b7280'}">${esc(v.verdict)}</span>${v.error_type ? ` <span class="badge">${esc(v.error_type)}</span>` : ''}`
    : '<span class="case-meta"><i>no verdict</i></span>';

  const points = (c.adi_part_breakdown ?? []).map(pr => {
    const earnedClass = pr.earned > 0 ? 'earned-pos' : 'earned-0';
    const subResults = (pr.sub_results ?? []).map(sr =>
      `<div class="case-meta">• ${esc(sr.element ?? '')} <b>${sr.met ? '✓' : '✗'}</b> — quote: <i>${esc(sr.student_evidence_quote ?? '')}</i></div>`
    ).join('');
    return `<div class="point">
      <div><span class="pid">${esc(pr.point_id)}</span> · <span class="${earnedClass}">${pr.earned}/${pr.max}</span> · conf ${pr.confidence ?? '—'}</div>
      <div class="case-meta">${esc(pr.description ?? '')}</div>
      <div>${esc(pr.reasoning ?? '')}</div>
      ${pr.suggestion ? `<div class="case-meta"><b>Suggestion:</b> ${esc(pr.suggestion)}</div>` : ''}
      ${subResults}
    </div>`;
  }).join('');

  return `<div class="case">
    <div class="case-head">
      <div>
        <b>${esc(c.subject)}</b> · ${esc(c.question_id)} · part (${esc(c.part_letter)}) · <b>${c.part_earned}/${c.part_max}</b> · ${esc(c.strictness)}
        <div class="case-meta">${esc(c.frq_type)} · ${esc(c.user_email)} · ${esc(c.submission_id.slice(0, 8))}</div>
      </div>
      <div>${verdictHtml}</div>
    </div>
    <div class="grid2">
      <div class="panel">
        <h4>Prompt</h4>
        <div>${esc(c.part_prompt)}</div>
      </div>
      <div class="panel">
        <h4>Student response</h4>
        ${pre(c.student_response_text)}
      </div>
    </div>
    <div class="grid2">
      <div class="panel">
        <h4>Adi's per-point breakdown</h4>
        ${points || '<i class="case-meta">no per-point data</i>'}
        <details><summary>feedback / missed</summary>
          <div><b>Feedback:</b> ${esc(c.adi_part_feedback)}</div>
          <div><b>Missed:</b> ${esc(c.adi_part_missed ?? '—')}</div>
        </details>
      </div>
      <div class="panel">
        <h4>Independent verdict</h4>
        ${v ? `
          <div><b>Independent score:</b> ${v.independent_score ?? '—'}/${c.part_max}</div>
          <div><b>Verdict:</b> ${esc(v.verdict)}${v.error_type ? ` (${esc(v.error_type)})` : ''}</div>
          <div style="margin-top:6px">${esc(v.notes ?? '')}</div>
        ` : '<i class="case-meta">no verdict yet</i>'}
        <details><summary>rubric scoring points</summary>
          ${pre(JSON.stringify(c.rubric_scoring_points ?? c.rubric_criteria, null, 2))}
        </details>
      </div>
    </div>
  </div>`;
}).join('');

const html = head + summary + caseBlocks + '</body></html>';
fs.mkdirSync(path.dirname(args.out), { recursive: true });
fs.writeFileSync(args.out, html);
console.error(`Wrote ${args.out}`);
