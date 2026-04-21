#!/usr/bin/env node
// Copies source PDFs from content-sources/frq-pdfs/ to public/pdfs/frq/<subject>/
// with normalized names, then backfills source_pdf / source_scoring_guideline_pdf
// on every released FRQ JSON. Verifies every populated path resolves at the end.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, 'content-sources', 'frq-pdfs');
const DST_ROOT = path.join(ROOT, 'public', 'pdfs', 'frq');
const DATA_ROOT = path.join(ROOT, 'public', 'data');

// Per-subject source map: (year, set?) -> { frq: <filename>, sg: <filename> }
// All filenames are relative to <SRC_ROOT>/<subject>/{questions|scoring-guidelines}/
const SOURCES = {
  'ap-calculus-ab': {
    prefix: 'calc-ab',
    map: {
      2005: { frq: 'calc 05 frq.pdf', sg: 'calc sg 05.pdf' },
      2006: { frq: 'calc 06 frq.pdf', sg: 'calc sg 06.pdf' },
      2007: { frq: 'calc 07 frq.pdf', sg: 'calc sg 07.pdf' },
      2008: { frq: 'calc 08 frq.pdf', sg: 'calc sg 08.pdf' },
      2009: { frq: 'calc 09 frq.pdf', sg: 'calc sg 09.pdf' },
      2010: { frq: 'calc 2010 frq.pdf', sg: 'calc sg 10.pdf' },
      2011: { frq: 'calc 2011 frq.pdf', sg: 'calc sg 11.pdf' },
      2012: { frq: 'calc 2012 frq.pdf', sg: 'calc sg 12.pdf' },
      2013: { frq: 'calc 2013 frq.pdf', sg: 'calc sg 13.pdf' },
      2014: { frq: 'calc 2014 frq.pdf', sg: 'calc sg 14.pdf' },
      2015: { frq: 'calc 2015 frq.pdf', sg: 'calc sg 15.pdf' },
      2016: { frq: 'calc 2016 frq.pdf', sg: 'calc sg 16.pdf' },
      2017: { frq: 'calc 2017 frq.pdf', sg: 'calc sg 17.pdf' },
      2018: { frq: 'calc ab 2018 frq.pdf', sg: 'calc sg 18.pdf' },
      2019: { frq: 'calc ab 2019 frq.pdf', sg: 'calc sg 19.pdf' },
      2021: { frq: 'Calc AB 2021 frq.pdf', sg: 'calc sg 21.pdf' },
      2022: { frq: 'Calc AB 2022 Frq.pdf', sg: 'calc sg 22.pdf' },
      2023: { frq: 'Calc AB 2023 FRQ.pdf', sg: 'calc sg 23.pdf' },
      2024: { frq: 'Calc AB 2024 FRQ.pdf', sg: 'calc sg 24.pdf' },
      2025: { frq: 'Calc AB 2025 FRQ.pdf', sg: 'calc sg 25.pdf' },
    },
  },
  'ap-chemistry': {
    prefix: 'chem',
    map: Object.fromEntries(
      [2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025].map(
        (y) => [y, { frq: `${y} chem frq.pdf`, sg: `${y} chem sg.pdf` }],
      ),
    ),
  },
  'ap-precalculus': {
    prefix: 'precalc',
    map: {
      2024: { frq: 'precalc frq 24.pdf', sg: 'precalc sg 24.pdf' },
      2025: { frq: 'precalc frq 25.pdf', sg: 'precalc sg 25.pdf' },
    },
  },
  'ap-psychology': {
    prefix: 'psych',
    // Psych SG names mostly follow "YYYY sg psych set N.pdf" but 2025 set 1 is "2025 psych sg set 1.pdf"
    map: (() => {
      const out = {};
      const psychSg = (y, s) => {
        if (y === 2025 && s === 1) return '2025 psych sg set 1.pdf';
        return `${y} sg psych set ${s}.pdf`;
      };
      for (const y of [2021, 2022, 2023, 2024, 2025]) {
        for (const s of [1, 2]) {
          out[`${y}-${s}`] = {
            frq: `${y} psych set ${s} frq.pdf`,
            sg: psychSg(y, s),
          };
        }
      }
      return out;
    })(),
  },
  'ap-world-history': {
    prefix: 'world',
    map: (() => {
      const out = {};
      // 2021 and 2022: no set
      out[2021] = { frq: 'world frq 21.pdf', sg: 'world sg 21.pdf' };
      out[2022] = { frq: 'world frq 22.pdf', sg: 'world sg 22.pdf' };
      // 2023-2025: set 1 and set 2
      for (const y of [2023, 2024, 2025]) {
        for (const s of [1, 2]) {
          const yy = String(y).slice(2);
          out[`${y}-${s}`] = {
            frq: `world frq set ${s} ${yy}.pdf`,
            sg: `world sg set ${s} ${yy}.pdf`,
          };
        }
      }
      return out;
    })(),
  },
  'ap-government': {
    prefix: 'gov',
    map: (() => {
      const out = {};
      out[2019] = { frq: 'gov frq 2019.pdf', sg: 'gov sg 19.pdf' };
      for (const y of [2021, 2022, 2023, 2024, 2025]) {
        for (const s of [1, 2]) {
          const yy = String(y).slice(2);
          out[`${y}-${s}`] = {
            frq: `gov frq set ${s} ${yy}.pdf`,
            sg: `gov sg set ${s} ${yy}.pdf`,
          };
        }
      }
      return out;
    })(),
  },
};

// Subjects with no source PDFs available — leave source_pdf null on these.
const NO_PDF_SUBJECTS = new Set(['ap-calculus-bc', 'ap-csp']);

function normalizedBasename(prefix, year, set, kind) {
  const setPart = set != null ? `-set-${set}` : '';
  return `${prefix}-${year}${setPart}-${kind}.pdf`;
}

function urlPathFor(subject, prefix, year, set, kind) {
  return `/pdfs/frq/${subject}/${normalizedBasename(prefix, year, set, kind)}`;
}

function fsPathFor(subject, prefix, year, set, kind) {
  return path.join(DST_ROOT, subject, normalizedBasename(prefix, year, set, kind));
}

// --- Step 1: copy PDFs ---
function copyAllPdfs() {
  let copied = 0;
  let missing = [];
  for (const [subject, cfg] of Object.entries(SOURCES)) {
    const dstSubjectDir = path.join(DST_ROOT, subject);
    fs.mkdirSync(dstSubjectDir, { recursive: true });
    for (const [key, files] of Object.entries(cfg.map)) {
      // key is either "YYYY" or "YYYY-S"
      const [yearStr, setStr] = key.split('-');
      const year = Number(yearStr);
      const set = setStr ? Number(setStr) : null;

      for (const kind of ['frq', 'sg']) {
        const srcDir = kind === 'frq' ? 'questions' : 'scoring-guidelines';
        const srcPath = path.join(SRC_ROOT, subject, srcDir, files[kind]);
        const dstPath = fsPathFor(subject, cfg.prefix, year, set, kind);
        if (!fs.existsSync(srcPath)) {
          missing.push({ subject, year, set, kind, srcPath });
          continue;
        }
        fs.copyFileSync(srcPath, dstPath);
        copied += 1;
      }
    }
  }
  return { copied, missing };
}

// --- Step 2: parse FRQ id -> { year, set } ---
// Examples handled:
//   calc-ab-2010-frq-1               -> year=2010, set=null
//   chem-2014-frq-1                  -> year=2014, set=null
//   precalc-2024-frq-1               -> year=2024, set=null
//   precalc-gen-a1                   -> generated (return null)
//   psych-2024-set1-frq-1            -> year=2024, set=1
//   psych-gen-a1                     -> generated
//   world-2022-dbq-1                 -> year=2022, set=null
//   world-2023-set1-leq-1            -> year=2023, set=1
//   gov-2019-frq-1                   -> year=2019, set=null
//   gov-2021-set1-frq-1              -> year=2021, set=1
function parseId(id) {
  // Match a 4-digit year and optional -setN-
  const m = id.match(/-(\d{4})(?:-set(\d+))?-/);
  if (!m) return null; // generated or unrecognized
  return { year: Number(m[1]), set: m[2] ? Number(m[2]) : null };
}

// --- Step 3: backfill JSONs ---
function backfillSubject(subject) {
  const cfg = SOURCES[subject];
  const frqDir = path.join(DATA_ROOT, subject, 'frq');
  if (!fs.existsSync(frqDir)) return { updated: 0, skipped: 0, missing: [] };

  const files = fs
    .readdirSync(frqDir)
    .filter((f) => f.endsWith('.json') && f !== 'manifest.json');

  let updated = 0;
  let skippedGenerated = 0;
  const missing = [];

  for (const file of files) {
    const fullPath = path.join(frqDir, file);
    const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    if (json.source !== 'released') {
      // Ensure these are explicitly null so the field exists uniformly.
      const before = JSON.stringify({
        a: json.source_pdf ?? null,
        b: json.source_scoring_guideline_pdf ?? null,
      });
      json.source_pdf = null;
      json.source_scoring_guideline_pdf = null;
      const after = JSON.stringify({ a: null, b: null });
      if (before !== after) {
        fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + '\n');
        skippedGenerated += 1;
      }
      continue;
    }

    if (!cfg) {
      // Subject has no PDFs (e.g. calc-bc) — null both fields.
      json.source_pdf = null;
      json.source_scoring_guideline_pdf = null;
      fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + '\n');
      continue;
    }

    const parsed = parseId(json.id);
    if (!parsed) {
      missing.push({ file, reason: 'unparseable id' });
      continue;
    }
    const { year, set } = parsed;

    // Confirm the year+set is actually in our source map
    const key = set != null ? `${year}-${set}` : String(year);
    if (!(key in cfg.map)) {
      missing.push({ file, reason: `no source for year=${year} set=${set}` });
      continue;
    }

    json.source_pdf = urlPathFor(subject, cfg.prefix, year, set, 'frq');
    json.source_scoring_guideline_pdf = urlPathFor(
      subject,
      cfg.prefix,
      year,
      set,
      'sg',
    );
    fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + '\n');
    updated += 1;
  }

  return { updated, skippedGenerated, missing };
}

function backfillNoPdfSubject(subject) {
  const frqDir = path.join(DATA_ROOT, subject, 'frq');
  if (!fs.existsSync(frqDir)) return { nulled: 0 };
  const files = fs
    .readdirSync(frqDir)
    .filter((f) => f.endsWith('.json') && f !== 'manifest.json');
  let nulled = 0;
  for (const file of files) {
    const fullPath = path.join(frqDir, file);
    const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    json.source_pdf = null;
    json.source_scoring_guideline_pdf = null;
    fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + '\n');
    nulled += 1;
  }
  return { nulled };
}

// --- Step 4: verify every populated path resolves to a file in /public ---
function verifyAllPaths() {
  const subjects = fs
    .readdirSync(DATA_ROOT)
    .filter((d) =>
      fs.statSync(path.join(DATA_ROOT, d)).isDirectory() && d.startsWith('ap-'),
    );

  const broken = [];
  let okCount = 0;
  let nullCount = 0;
  for (const subject of subjects) {
    const frqDir = path.join(DATA_ROOT, subject, 'frq');
    if (!fs.existsSync(frqDir)) continue;
    const files = fs
      .readdirSync(frqDir)
      .filter((f) => f.endsWith('.json') && f !== 'manifest.json');
    for (const file of files) {
      const json = JSON.parse(fs.readFileSync(path.join(frqDir, file), 'utf8'));
      for (const field of ['source_pdf', 'source_scoring_guideline_pdf']) {
        const val = json[field];
        if (val == null) {
          nullCount += 1;
          continue;
        }
        if (!val.startsWith('/pdfs/')) {
          broken.push({ file, field, value: val, reason: 'bad prefix' });
          continue;
        }
        const fsPath = path.join(ROOT, 'public', val.replace(/^\//, ''));
        if (!fs.existsSync(fsPath)) {
          broken.push({ file, field, value: val, reason: 'file missing' });
          continue;
        }
        okCount += 1;
      }
    }
  }
  return { okCount, nullCount, broken };
}

// --- Run ---
console.log('=== Step 1: Copying PDFs ===');
const { copied, missing: copyMissing } = copyAllPdfs();
console.log(`Copied ${copied} PDFs`);
if (copyMissing.length) {
  console.error('MISSING SOURCE PDFs:');
  for (const m of copyMissing) console.error(' -', m);
}

console.log('\n=== Step 2: Backfilling FRQ JSONs ===');
for (const subject of Object.keys(SOURCES)) {
  const { updated, skippedGenerated, missing } = backfillSubject(subject);
  console.log(
    `${subject}: ${updated} released updated, ${skippedGenerated ?? 0} generated nulled, ${missing.length} unmapped`,
  );
  if (missing.length) {
    for (const m of missing) console.error('   !', m);
  }
}
for (const subject of NO_PDF_SUBJECTS) {
  const { nulled } = backfillNoPdfSubject(subject);
  console.log(`${subject}: ${nulled} nulled (no source PDFs)`);
}

console.log('\n=== Step 3: Verifying all paths ===');
const { okCount, nullCount, broken } = verifyAllPaths();
console.log(`OK: ${okCount}, Null: ${nullCount}, Broken: ${broken.length}`);
if (broken.length) {
  console.error('BROKEN PATHS:');
  for (const b of broken) console.error(' -', b);
  process.exit(1);
}

console.log('\nDone.');
