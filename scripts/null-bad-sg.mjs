#!/usr/bin/env node
// Null out source_scoring_guideline_pdf for FRQs whose SG PDF is a duplicate
// of the question PDF (source PDFs were mis-downloaded).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, 'public', 'data');
const PDF_ROOT = path.join(ROOT, 'public', 'pdfs', 'frq');

// (subject, year, set?) tuples where the SG file is actually the question PDF.
// Verified by md5 comparison.
const BAD_SG = [
  ['ap-psychology', 2021, 2],
  ['ap-world-history', 2021, null],
  ['ap-world-history', 2022, null],
  ['ap-world-history', 2023, 1],
  ['ap-world-history', 2023, 2],
];

function matchesYearSet(json, year, set) {
  // Re-derive from id since 'set' field isn't always populated
  const m = json.id.match(/-(\d{4})(?:-set(\d+))?-/);
  if (!m) return false;
  const y = Number(m[1]);
  const s = m[2] ? Number(m[2]) : null;
  return y === year && s === set;
}

let nulledFields = 0;
let deletedFiles = 0;

for (const [subject, year, set] of BAD_SG) {
  // 1) Null the SG field on every matching JSON in this subject
  const frqDir = path.join(DATA_ROOT, subject, 'frq');
  const files = fs.readdirSync(frqDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json');
  for (const file of files) {
    const fullPath = path.join(frqDir, file);
    const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    if (matchesYearSet(json, year, set) && json.source_scoring_guideline_pdf != null) {
      json.source_scoring_guideline_pdf = null;
      fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + '\n');
      nulledFields += 1;
    }
  }

  // 2) Delete the bad SG PDF file itself
  const setPart = set != null ? `-set-${set}` : '';
  const prefix = subject === 'ap-psychology' ? 'psych' : 'world';
  const sgFile = path.join(PDF_ROOT, subject, `${prefix}-${year}${setPart}-sg.pdf`);
  if (fs.existsSync(sgFile)) {
    fs.unlinkSync(sgFile);
    deletedFiles += 1;
    console.log(`Deleted bad SG: ${path.relative(ROOT, sgFile)}`);
  }
}

console.log(`\nNulled ${nulledFields} source_scoring_guideline_pdf fields`);
console.log(`Deleted ${deletedFiles} bad SG PDFs`);
