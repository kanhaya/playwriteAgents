import { randomBytes } from 'crypto';

/** Suite-level id. Stable for every worker in one Playwright invocation. */
export function createRunId(now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `r-${stamp}-${randomBytes(4).toString('hex')}`;
}

/** Per-test id propagated on browser requests and into the run manifest. */
export function createTraceId(): string {
  return `t-${randomBytes(16).toString('hex')}`;
}
