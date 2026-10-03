export type TestOutcome = 'expected' | 'unexpected' | 'flaky' | 'skipped';

export type TestAttemptStatus = 'passed' | 'failed' | 'timedout' | 'skipped' | 'interrupted';

export type RunStatus = 'passed' | 'failed' | 'timedout' | 'interrupted';

export type TraceSource = 'fixture' | 'missing';

export type RunMeta = {
  runId: string;
  startedAt: string;
  env: string;
  commit: string | null;
};

export type ManifestTest = {
  id: string;
  title: string;
  file: string;
  line: number;
  project: string | null;
  outcome: TestOutcome;
  status: TestAttemptStatus | null;
  retries: number;
  durationMs: number;
  runId: string | null;
  traceId: string | null;
  traceSource: TraceSource;
  error: string | null;
  artifacts: {
    screenshot: string | null;
    trace: string | null;
    video: string | null;
  };
};

export type RunManifest = {
  version: 1;
  runId: string;
  env: string;
  commit: string | null;
  startedAt: string;
  finishedAt: string;
  status: RunStatus;
  shard: { current: number; total: number } | null;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    durationMs: number;
  };
  tests: ManifestTest[];
};
