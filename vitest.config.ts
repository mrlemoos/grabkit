import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/grabkit/src/**/*.test.ts', '__tests__/**/*.spec.ts'],
    testTimeout: 30_000,
  },
});
