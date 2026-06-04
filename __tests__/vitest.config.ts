import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    environment: 'node',
    include: ['**/*.spec.ts'],
    testTimeout: 30_000,
  },
});
