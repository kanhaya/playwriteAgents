import { test as base, expect } from '@playwright/test';
import { createTraceId } from './ids';
import { readRunMeta } from './runMeta';

export type TestContext = {
  runId: string;
  traceId: string;
  env: string;
};

type Fixtures = {
  testContext: TestContext;
};

export const test = base.extend<Fixtures>({
  testContext: [
    async ({}, use, testInfo) => {
      const meta = readRunMeta();
      const testContext: TestContext = {
        runId: meta.runId,
        traceId: createTraceId(),
        env: meta.env,
      };
      testInfo.annotations.push({ type: 'runId', description: testContext.runId });
      testInfo.annotations.push({ type: 'traceId', description: testContext.traceId });
      await use(testContext);
    },
    { auto: true },
  ],

  context: async ({ context, testContext }, use) => {
    await context.setExtraHTTPHeaders({
      'x-run-id': testContext.runId,
      'x-trace-id': testContext.traceId,
    });
    await use(context);
  },
});

export { expect };
