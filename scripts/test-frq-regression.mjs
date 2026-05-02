#!/usr/bin/env node
// FRQ Grader Regression Test Runner
//
// Runs the grading pipeline against curated cases in
// tests/frq-regression-fixture.json and reports pass/fail.
// Skips Supabase + rate limit — calls the LLM directly via the Vercel AI SDK
// using the same prompt builder + post-processors as production.
//
// Cost: ~$0.005-0.01 per case at gpt-4o-mini, ~$0.02-0.05 at gpt-4o.
// 12-case fixture: ~$0.10 per full run. Run before any prompt or
// grader-pipeline change to detect regressions.
//
// Usage:
//   OPENAI_API_KEY=sk-... node scripts/test-frq-regression.mjs
//   OPENAI_API_KEY=sk-... node scripts/test-frq-regression.mjs --case world-2021-saq-1-a-gandhi-bare
//   OPENAI_API_KEY=sk-... node scripts/test-frq-regression.mjs --tag name-parity
//   OPENAI_API_KEY=sk-... node scripts/test-frq-regression.mjs --json > tmp/regression-results.json

import fs from 'node:fs'
import path from 'node:path'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

// Register a TS loader so we can import .ts modules from utils/. Tries tsx
// first (lighter), falls back to ts-node which is already in node_modules.
let registered = false
for (const loader of ['tsx/esm', 'ts-node/esm']) {
  try {
    register(loader, pathToFileURL('./'))
    registered = true
    break
  } catch {
    // try next
  }
}
if (!registered) {
  console.error('This script needs a TypeScript loader. Install one of:')
  console.error('  npm i -D tsx        (preferred — lighter)')
  console.error('  npm i -D ts-node    (fallback)')
  process.exit(1)
}

const ROOT = path.resolve(import.meta.dirname, '..')

// ─── Args ─────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { case: null, tag: null, json: false, strictness: 'moderate' }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--case') args.case = argv[++i]
    else if (a === '--tag') args.tag = argv[++i]
    else if (a === '--json') args.json = true
    else if (a === '--strictness') args.strictness = argv[++i]
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node scripts/test-frq-regression.mjs [--case ID] [--tag TAG] [--strictness moderate|strict|light] [--json]')
      process.exit(0)
    }
  }
  return args
}

// ─── Load fixture ─────────────────────────────────────────────────────────
function loadFixture() {
  const p = path.join(ROOT, 'tests/frq-regression-fixture.json')
  if (!fs.existsSync(p)) {
    console.error(`Fixture not found: ${p}`)
    process.exit(1)
  }
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'))
  return raw.cases ?? []
}

// ─── Load FRQ JSON for a case ─────────────────────────────────────────────
function loadFRQ(subject, questionId) {
  const p = path.join(ROOT, 'public/data', subject, 'frq', `${questionId}.json`)
  if (!fs.existsSync(p)) {
    throw new Error(`FRQ data not found: ${p}`)
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

// ─── Run one case through the grading pipeline ────────────────────────────
async function runCase(testCase, helpers, args) {
  const frq = loadFRQ(testCase.subject, testCase.question_id)
  const { generateText } = helpers.ai
  const { openai } = helpers.openai
  const { buildFRQGradingPrompt } = helpers.prompt
  const { applyMathVerification } = helpers.mathVerifier
  const { sanitizeGrading, enforceDependencies, verifyEvidence, validateFeedbackStrings } = helpers.grading

  const systemPrompt = buildFRQGradingPrompt(frq, testCase.responses, args.strictness)

  // Match production: same model selection, same temperature.
  const model = pickModel(frq.frq_type, openai)

  const result = await generateText({
    model,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Grade this FRQ submission according to the rubric. Respond with the JSON scoring object only.' }],
    maxOutputTokens: 3072,
    temperature: 0,
    maxRetries: 3,
  })

  // Parse + sanitize.
  const stripped = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  let parsed
  try {
    parsed = JSON.parse(stripped)
  } catch {
    const first = stripped.indexOf('{')
    const last = stripped.lastIndexOf('}')
    if (first === -1 || last === -1) throw new Error('Could not parse LLM response as JSON')
    parsed = JSON.parse(stripped.slice(first, last + 1))
  }

  let grading = sanitizeGrading(frq, parsed)
  grading = enforceDependencies(frq, grading)
  grading = verifyEvidence(grading, testCase.responses)
  const mathCheck = applyMathVerification(frq, testCase.responses, grading)
  grading = mathCheck.grading
  grading = validateFeedbackStrings(frq, testCase.responses, grading)

  return { grading, mathDeltas: mathCheck.outcome.deltas }
}

function pickModel(frqType, openai) {
  if (frqType === 'saq' || frqType === 'concept_application') return openai('gpt-4o-mini')
  if (frqType === 'multi_part_text' || frqType === 'quantitative_analysis' || frqType === 'scotus_comparison') {
    return openai('gpt-4o-mini')
  }
  return openai('gpt-4o')
}

// ─── Compare actual vs expected ───────────────────────────────────────────
function compareCase(testCase, grading) {
  const expected = testCase.expected
  const failures = []

  for (const [partLetter, expectedEarned] of Object.entries(expected)) {
    if (partLetter === 'rationale') continue
    if (partLetter === 'essay_total') {
      if (grading.total_score !== expectedEarned) {
        failures.push(`essay_total: expected ${expectedEarned}, got ${grading.total_score}`)
      }
      continue
    }
    if (partLetter === 'essay_total_min') {
      if (grading.total_score < expectedEarned) {
        failures.push(`essay_total_min: expected ≥${expectedEarned}, got ${grading.total_score}`)
      }
      continue
    }
    const actual = grading.parts.find(p => p.letter === partLetter)
    if (!actual) {
      failures.push(`part ${partLetter}: not found in grading output`)
      continue
    }
    if (actual.earned !== expectedEarned) {
      failures.push(`part ${partLetter}: expected ${expectedEarned}, got ${actual.earned}/${actual.max}`)
    }
  }

  return { passed: failures.length === 0, failures }
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv)

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set. Get one from your .env.local and prepend it to this command.')
    process.exit(1)
  }

  const cases = loadFixture()
  const filtered = cases.filter(c => {
    if (args.case && c.id !== args.case) return false
    if (args.tag && !c.tags?.includes(args.tag)) return false
    return true
  })

  if (filtered.length === 0) {
    console.error('No cases matched the filter.')
    process.exit(1)
  }

  // Lazy-load the helpers so the tsx loader has a chance to register.
  const helpers = {
    ai: await import('ai'),
    openai: await import('@ai-sdk/openai'),
    prompt: await import(path.join(ROOT, 'utils/frqGradingPrompt.ts')),
    mathVerifier: await import(path.join(ROOT, 'utils/frqMathVerifier.ts')),
    grading: await import(path.join(ROOT, 'utils/frqGrading.ts')),
  }

  const results = []
  for (const testCase of filtered) {
    process.stderr.write(`Running ${testCase.id} ... `)
    try {
      const { grading, mathDeltas } = await runCase(testCase, helpers, args)
      const cmp = compareCase(testCase, grading)
      results.push({
        id: testCase.id,
        passed: cmp.passed,
        failures: cmp.failures,
        actual: grading.parts.map(p => ({ letter: p.letter, earned: p.earned, max: p.max })),
        actual_total: grading.total_score,
        actual_max: grading.max_score,
        math_deltas: mathDeltas,
        rationale: testCase.expected.rationale,
        tags: testCase.tags ?? [],
      })
      process.stderr.write(cmp.passed ? 'PASS\n' : `FAIL — ${cmp.failures.join('; ')}\n`)
    } catch (err) {
      results.push({
        id: testCase.id,
        passed: false,
        failures: [`error: ${err.message}`],
        rationale: testCase.expected.rationale,
        tags: testCase.tags ?? [],
      })
      process.stderr.write(`ERROR — ${err.message}\n`)
    }
  }

  const passed = results.filter(r => r.passed).length
  const failed = results.length - passed

  if (args.json) {
    console.log(JSON.stringify({ summary: { total: results.length, passed, failed }, results }, null, 2))
  } else {
    console.log('')
    console.log('═══════════════════════════════════════════════════════════════════')
    console.log(`FRQ Regression Test Summary: ${passed}/${results.length} passed`)
    console.log('═══════════════════════════════════════════════════════════════════')
    for (const r of results) {
      const tag = r.passed ? '✓' : '✗'
      console.log(`${tag} ${r.id} ${r.tags.length ? `[${r.tags.join(', ')}]` : ''}`)
      if (!r.passed) {
        for (const f of r.failures) console.log(`    ${f}`)
        console.log(`    rationale: ${r.rationale}`)
      }
    }
    console.log('')
    if (failed > 0) {
      console.log(`${failed} regression(s) detected. Review failures above.`)
      process.exit(1)
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
