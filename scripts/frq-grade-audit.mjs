#!/usr/bin/env node
// FRQ Grader Audit — joins production Supabase dumps with rubric files on
// disk, samples graded submissions, and writes audit cases for a Sonnet
// subagent to re-grade. The subagent's verdicts feed back through the
// companion script (frq-grade-audit-render.mjs) into an HTML report.
//
// Usage:
//   node scripts/frq-grade-audit.mjs \
//     --submissions ~/Downloads/frq_submissions_rows.sql \
//     --results ~/Downloads/frq_results_rows.sql \
//     --by-part ~/Downloads/frq_user_breakdown_by_part_rows.sql \
//     --subject ap-government \
//     --zero-only \
//     --min-chars 100 \
//     --n 50 \
//     --out tmp/frq-audit-cases.json
//
// All flags optional; defaults below.

import fs from 'node:fs';
import path from 'node:path';

// ─── Args ──────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {
    submissions: 'C:/Users/kakka/Downloads/frq_submissions_rows.sql',
    results: 'C:/Users/kakka/Downloads/frq_results_rows.sql',
    byPart: 'C:/Users/kakka/Downloads/frq_user_breakdown_by_part_rows.sql',
    subject: null,
    zeroOnly: false,
    partialOnly: false,
    minChars: 50,
    n: 30,
    out: 'tmp/frq-audit-cases.json',
    seed: 42,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--submissions') args.submissions = next();
    else if (a === '--results') args.results = next();
    else if (a === '--by-part') args.byPart = next();
    else if (a === '--subject') args.subject = next();
    else if (a === '--zero-only') args.zeroOnly = true;
    else if (a === '--partial-only') args.partialOnly = true;
    else if (a === '--min-chars') args.minChars = Number(next());
    else if (a === '--n') args.n = Number(next());
    else if (a === '--out') args.out = next();
    else if (a === '--seed') args.seed = Number(next());
    else if (a === '--help' || a === '-h') {
      console.log(`Usage:
  --submissions <path>   Supabase frq_submissions dump (default: Downloads)
  --results <path>       Supabase frq_results dump
  --by-part <path>       Supabase frq_user_breakdown_by_part dump
  --subject <slug>       Filter to a single subject (e.g. ap-government)
  --zero-only            Sample only parts where part_earned = 0
  --partial-only         Sample only parts where 0 < part_earned < part_max
  --min-chars N          Minimum student_response_text length (default 50)
  --n N                  Number of cases to sample (default 30)
  --out <path>           Output JSON path (default tmp/frq-audit-cases.json)
  --seed N               Random seed for reproducibility (default 42)
`);
      process.exit(0);
    }
  }
  return args;
}

const args = parseArgs(process.argv);

// ─── SQL VALUES tuple parser ───────────────────────────────────────────────
// Reads `('...', '...', ..., '...')` rows. Handles single-quoted strings
// with `''` escapes, NULL, numbers, parens inside string literals, and JSONB
// stored as quoted strings.
function* parseTuples(content) {
  const valuesIdx = content.indexOf('VALUES');
  if (valuesIdx === -1) throw new Error('No VALUES keyword');
  let i = content.indexOf('(', valuesIdx);
  if (i === -1) throw new Error('No opening paren');
  const N = content.length;

  while (i < N) {
    while (i < N && /[\s,;]/.test(content[i])) i++;
    if (i >= N || content[i] !== '(') break;
    i++;
    const fields = [];
    let buf = '';
    let wasQuoted = false;
    let started = false;
    let inString = false;
    while (i < N) {
      const c = content[i];
      if (inString) {
        if (c === "'") {
          if (i + 1 < N && content[i + 1] === "'") { buf += "'"; i += 2; continue; }
          inString = false; i++; continue;
        }
        buf += c; i++; continue;
      }
      if (c === "'") { inString = true; wasQuoted = true; started = true; i++; continue; }
      if (c === ',') {
        fields.push({ value: buf, quoted: wasQuoted });
        buf = ''; wasQuoted = false; started = false; i++;
        while (i < N && /[ \t]/.test(content[i])) i++;
        continue;
      }
      if (c === ')') {
        if (started || buf.length > 0 || fields.length > 0) fields.push({ value: buf, quoted: wasQuoted });
        i++; break;
      }
      if (c === ' ' || c === '\t') { i++; continue; }
      buf += c; started = true; i++;
    }
    yield fields.map(f => {
      if (f.quoted) return f.value;
      const t = f.value.trim();
      if (t.toLowerCase() === 'null') return null;
      if (t === 'true') return true;
      if (t === 'false') return false;
      if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
      return t;
    });
  }
}

function rowsToObjects(rows, cols) {
  const out = [];
  for (const r of rows) {
    if (r.length !== cols.length) continue;
    const o = {};
    for (let i = 0; i < cols.length; i++) o[cols[i]] = r[i];
    out.push(o);
  }
  return out;
}

function tryJson(s) {
  if (s == null) return null;
  if (typeof s !== 'string') return s;
  try { return JSON.parse(s); } catch { return null; }
}

// ─── Seeded RNG (Mulberry32) for reproducible sampling ─────────────────────
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function sample(arr, n, seed) {
  const r = rng(seed);
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// ─── Rubric loader ─────────────────────────────────────────────────────────
function loadRubric(subject, questionId) {
  const file = path.join('public', 'data', subject, 'frq', `${questionId}.json`);
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function rubricForPart(rubric, partLetter) {
  if (!rubric?.parts) return null;
  return rubric.parts.find(p => p.letter === partLetter) || null;
}

// ─── Build cases ──────────────────────────────────────────────────────────
console.error('Parsing SQL dumps…');

const submissionsCols = ['id', 'user_id', 'question_id', 'subject', 'responses', 'grading_status', 'created_at', 'strictness'];
const resultsCols = ['id', 'submission_id', 'total_score', 'max_score', 'part_breakdown', 'adi_takeaway', 'graded_at'];
const byPartCols = ['submission_id', 'email', 'subject', 'question_id', 'part_letter', 'part_earned', 'part_max', 'student_response_text', 'adi_part_feedback', 'adi_part_missed', 'adi_takeaway', 'submitted_at'];

const submissions = rowsToObjects([...parseTuples(fs.readFileSync(args.submissions, 'utf8'))], submissionsCols);
console.error(`  submissions: ${submissions.length}`);
const results = rowsToObjects([...parseTuples(fs.readFileSync(args.results, 'utf8'))], resultsCols);
console.error(`  results:     ${results.length}`);
const byPart = rowsToObjects([...parseTuples(fs.readFileSync(args.byPart, 'utf8'))], byPartCols);
console.error(`  byPart:      ${byPart.length}`);

const submissionById = new Map(submissions.map(s => [s.id, s]));
const resultBySubmission = new Map(results.map(r => [r.submission_id, r]));

console.error('Filtering and joining…');
const candidates = [];
for (const part of byPart) {
  if (args.subject && part.subject !== args.subject) continue;
  const text = part.student_response_text;
  if (!text || typeof text !== 'string') continue;
  if (text.trim().length < args.minChars) continue;

  const earned = Number(part.part_earned);
  const max = Number(part.part_max);
  if (!Number.isFinite(earned) || !Number.isFinite(max) || max <= 0) continue;

  if (args.zeroOnly && earned !== 0) continue;
  if (args.partialOnly && (earned <= 0 || earned >= max)) continue;

  const submission = submissionById.get(part.submission_id);
  const result = resultBySubmission.get(part.submission_id);
  if (!result) continue;

  const rubric = loadRubric(part.subject, part.question_id);
  if (!rubric) continue;
  const rubricPart = rubricForPart(rubric, part.part_letter);
  if (!rubricPart) continue;

  const partBreakdown = tryJson(result.part_breakdown);
  const adiPart = Array.isArray(partBreakdown) ? partBreakdown.find(p => p.letter === part.part_letter) : null;

  candidates.push({
    submission_id: part.submission_id,
    user_email: part.email,
    subject: part.subject,
    question_id: part.question_id,
    question_title: rubric.title,
    frq_type: rubric.frq_type,
    strictness: submission?.strictness ?? 'unknown',
    part_letter: part.part_letter,
    part_earned: earned,
    part_max: max,
    part_prompt: rubricPart.prompt,
    rubric_scoring_points: rubricPart.scoring_points ?? null,
    rubric_criteria: rubricPart.rubric_criteria ?? null,
    rubric_scoring_notes: rubricPart.scoring_notes ?? null,
    student_response_text: text,
    adi_part_feedback: part.adi_part_feedback,
    adi_part_missed: part.adi_part_missed,
    adi_part_breakdown: adiPart?.point_results ?? null,
    submitted_at: part.submitted_at,
  });
}

console.error(`  candidates after filter: ${candidates.length}`);

const sampled = sample(candidates, Math.min(args.n, candidates.length), args.seed);
console.error(`  sampled: ${sampled.length}`);

// ─── Distribution summary ─────────────────────────────────────────────────
const bySubject = {};
const byType = {};
for (const c of sampled) {
  bySubject[c.subject] = (bySubject[c.subject] ?? 0) + 1;
  byType[c.frq_type] = (byType[c.frq_type] ?? 0) + 1;
}
console.error('  by subject:', bySubject);
console.error('  by frq_type:', byType);

// ─── Write ────────────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(args.out), { recursive: true });
const payload = {
  generated_at: new Date().toISOString(),
  args: {
    subject: args.subject,
    zero_only: args.zeroOnly,
    partial_only: args.partialOnly,
    min_chars: args.minChars,
    n: args.n,
    seed: args.seed,
  },
  total_candidates: candidates.length,
  sampled_count: sampled.length,
  cases: sampled,
};
fs.writeFileSync(args.out, JSON.stringify(payload, null, 2));
console.error(`Wrote ${args.out}`);
