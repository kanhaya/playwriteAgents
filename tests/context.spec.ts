// spec: specs/test.plan.md
// seed: tests/seed.spec.ts
// generated-by: manual
// generated-at: 2026-10-03

import { test, expect } from '../framework/test';
import { buildManifest } from '../framework/manifest';
import type { ManifestTest, RunMeta } from '../framework/types';

test('assigns a suite run id and a per-test trace id', async ({ testContext }, testInfo) => {
  expect(testContext.runId).toMatch(/^r-\d{8}T\d{6}Z-[0-9a-f]{8}$/);
  expect(testContext.traceId).toMatch(/^t-[0-9a-f]{32}$/);
  expect(testContext.env).toBeTruthy();
  expect(testInfo.annotations).toEqual(
    expect.arrayContaining([
      { type: 'runId', description: testContext.runId },
      { type: 'traceId', description: testContext.traceId },
    ]),
  );
});

test('run manifest groups tests by outcome', () => {
  const meta: RunMeta = {
    runId: 'r-20261003T000000Z-abcdef01',
    startedAt: '2026-10-03T00:00:00.000Z',
    env: 'dev',
    commit: 'abc',
  };
  const tests: ManifestTest[] = [
    manifestTest('expected', 'passed'),
    manifestTest('unexpected', 'failed'),
    manifestTest('flaky', 'passed'),
    manifestTest('skipped', 'skipped'),
  ];

  const manifest = buildManifest({
    meta,
    finishedAt: '2026-10-03T00:01:00.000Z',
    status: 'failed',
    durationMs: 1500,
    shard: null,
    tests,
  });

  expect(manifest.version).toBe(1);
  expect(manifest.runId).toBe(meta.runId);
  expect(manifest.summary).toEqual({
    total: 4,
    passed: 1,
    failed: 1,
    skipped: 1,
    flaky: 1,
    durationMs: 1500,
  });
});

function manifestTest(
  outcome: ManifestTest['outcome'],
  status: NonNullable<ManifestTest['status']>,
): ManifestTest {
  return {
    id: `${outcome}-id`,
    title: outcome,
    file: 'tests/context.spec.ts',
    line: 1,
    project: 'chromium',
    outcome,
    status,
    retries: 0,
    durationMs: 10,
    runId: 'r-20261003T000000Z-abcdef01',
    traceId: 't-0123456789abcdef0123456789abcdef',
    traceSource: 'fixture',
    error: outcome === 'unexpected' ? 'expected visible' : null,
    artifacts: { screenshot: null, trace: null, video: null },
  };
}
