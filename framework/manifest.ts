import type { ManifestTest, RunManifest, RunMeta, RunStatus } from './types';

export function buildManifest(input: {
  meta: RunMeta;
  finishedAt: string;
  status: RunStatus;
  durationMs: number;
  shard: { current: number; total: number } | null;
  tests: ManifestTest[];
}): RunManifest {
  const tests = [...input.tests].sort((a, b) =>
    a.file === b.file ? a.title.localeCompare(b.title) : a.file.localeCompare(b.file),
  );

  const summary = {
    total: tests.length,
    passed: tests.filter((t) => t.outcome === 'expected').length,
    failed: tests.filter((t) => t.outcome === 'unexpected').length,
    skipped: tests.filter((t) => t.outcome === 'skipped').length,
    flaky: tests.filter((t) => t.outcome === 'flaky').length,
    durationMs: input.durationMs,
  };

  return {
    version: 1,
    runId: input.meta.runId,
    env: input.meta.env,
    commit: input.meta.commit,
    startedAt: input.meta.startedAt,
    finishedAt: input.finishedAt,
    status: input.status,
    shard: input.shard,
    summary,
    tests,
  };
}
