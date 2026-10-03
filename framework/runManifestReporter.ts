import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import { buildManifest } from './manifest';
import { readRunMeta, RESULTS_DIR, RUN_MANIFEST_PATH } from './runMeta';
import type { ManifestTest, TestAttemptStatus, TestOutcome } from './types';

function annotation(result: TestResult | undefined, type: string): string | null {
  return result?.annotations.find((item) => item.type === type)?.description ?? null;
}

function artifact(result: TestResult | undefined, name: string): string | null {
  const filePath = result?.attachments.find((item) => item.name === name)?.path;
  if (!filePath) return null;
  return path.relative(process.cwd(), filePath);
}

function errorLine(result: TestResult | undefined): string | null {
  const message = result?.error?.message?.split('\n')[0]?.trim();
  if (!message) return null;
  return message.slice(0, 500);
}

function toManifestTest(test: TestCase): ManifestTest {
  const results = test.results;
  const finalResult = results[results.length - 1];
  const traceId = annotation(finalResult, 'traceId');

  return {
    id: test.id,
    title: test.titlePath().filter(Boolean).join(' > '),
    file: path.relative(process.cwd(), test.location.file),
    line: test.location.line,
    project: test.parent.project()?.name ?? null,
    outcome: test.outcome() as TestOutcome,
    status: (finalResult?.status as TestAttemptStatus | undefined) ?? null,
    retries: Math.max(0, results.length - 1),
    durationMs: results.reduce((total, result) => total + result.duration, 0),
    runId: annotation(finalResult, 'runId'),
    traceId,
    traceSource: traceId ? 'fixture' : 'missing',
    error: errorLine(finalResult),
    artifacts: {
      screenshot: artifact(finalResult, 'screenshot'),
      trace: artifact(finalResult, 'trace'),
      video: artifact(finalResult, 'video'),
    },
  };
}

export default class RunManifestReporter implements Reporter {
  private config!: FullConfig;
  private suite!: Suite;

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.suite = suite;
  }

  onEnd(result: FullResult): void {
    const manifest = buildManifest({
      meta: readRunMeta(),
      finishedAt: new Date().toISOString(),
      status: result.status,
      durationMs: result.duration,
      shard: this.config.shard
        ? { current: this.config.shard.current, total: this.config.shard.total }
        : null,
      tests: this.suite.allTests().map(toManifestTest),
    });

    mkdirSync(RESULTS_DIR, { recursive: true });
    writeFileSync(RUN_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  printsToStdio(): boolean {
    return false;
  }
}
