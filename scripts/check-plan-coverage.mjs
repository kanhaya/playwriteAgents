#!/usr/bin/env node
/**
 * Checks alignment between specs/test.plan.md and tests/*.spec.ts
 * Usage: node scripts/check-plan-coverage.mjs [--strict]
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const PLAN_PATH = join(ROOT, 'specs/test.plan.md');
const TESTS_DIR = join(ROOT, 'tests');
const STRICT = process.argv.includes('--strict');

function readPlan() {
  if (!existsSync(PLAN_PATH)) {
    console.error('Missing specs/test.plan.md');
    process.exit(1);
  }
  return readFileSync(PLAN_PATH, 'utf8');
}

function readSpecFiles() {
  return readdirSync(TESTS_DIR)
    .filter((f) => f.endsWith('.spec.ts'))
    .map((f) => ({
      name: f,
      path: join(TESTS_DIR, f),
      content: readFileSync(join(TESTS_DIR, f), 'utf8'),
    }));
}

const plan = readPlan();
const specs = readSpecFiles();
const allSpecContent = specs.map((s) => s.content).join('\n');

// TC IDs from plan (e.g. TC-S1, TC-CHK1)
const planTcIds = [...new Set(plan.match(/TC-[A-Z0-9]+/g) || [])];

// TC IDs referenced in test files
const specTcIds = new Set(allSpecContent.match(/TC-[A-Z0-9]+/g) || []);

// Spec files referenced in plan
const planFiles = [...new Set(
  (plan.match(/tests\/[a-z0-9-]+\.spec\.ts/g) || [])
)];

const missingFiles = planFiles.filter((f) => !existsSync(join(ROOT, f)));

// Spec files without traceability header
const missingHeaders = specs
  .filter((s) => s.name !== 'seed.spec.ts' && !s.content.includes('generated-by:'))
  .map((s) => s.name);

// Plan files that have no corresponding spec file on disk (already checked)
// Warn on TC IDs in plan not referenced in any spec (informational in non-strict mode)
const uncoveredTcIds = planTcIds.filter((id) => !specTcIds.has(id));

let failed = false;

console.log('Plan coverage check\n');

if (missingFiles.length) {
  failed = true;
  console.error('Missing spec files referenced in plan:');
  missingFiles.forEach((f) => console.error(`  - ${f}`));
}

if (missingHeaders.length) {
  failed = true;
  console.error('Spec files missing generated-by header:');
  missingHeaders.forEach((f) => console.error(`  - tests/${f}`));
}

if (uncoveredTcIds.length) {
  console.warn(`TC IDs in plan not referenced in specs (${uncoveredTcIds.length}):`);
  uncoveredTcIds.slice(0, 10).forEach((id) => console.warn(`  - ${id}`));
  if (uncoveredTcIds.length > 10) {
    console.warn(`  ... and ${uncoveredTcIds.length - 10} more`);
  }
  if (STRICT && uncoveredTcIds.length > planTcIds.length * 0.5) {
    failed = true;
    console.error('Strict mode: too many uncovered TC IDs');
  }
}

console.log(`\nPlan TC IDs: ${planTcIds.length}`);
console.log(`Referenced in specs: ${specTcIds.size}`);
console.log(`Plan spec files: ${planFiles.length}`);
console.log(`Spec files on disk: ${specs.length}`);

if (failed) {
  console.error('\nPlan coverage check FAILED');
  process.exit(1);
}

console.log('\nPlan coverage check PASSED');
process.exit(0);
