import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { createRunId } from './ids';
import type { RunMeta } from './types';

export const RESULTS_DIR = path.join(process.cwd(), 'results');
export const RUN_META_PATH = path.join(RESULTS_DIR, 'run-meta.json');
export const RUN_MANIFEST_PATH = path.join(RESULTS_DIR, 'run-manifest.json');

export function writeRunMeta(): RunMeta {
  mkdirSync(RESULTS_DIR, { recursive: true });
  const meta: RunMeta = {
    runId: process.env.TEST_RUN_ID || createRunId(),
    startedAt: new Date().toISOString(),
    env: process.env.TEST_ENV || 'dev',
    commit: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || null,
  };
  writeFileSync(RUN_META_PATH, JSON.stringify(meta, null, 2));
  return meta;
}

export function readRunMeta(): RunMeta {
  const raw = readFileSync(RUN_META_PATH, 'utf8');
  const meta = JSON.parse(raw) as RunMeta;
  if (!meta.runId || !meta.startedAt) {
    throw new Error(`Invalid run metadata at ${RUN_META_PATH}`);
  }
  return meta;
}
