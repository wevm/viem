import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    benchmark: {
      outputFile: 'bench/report.json',
      reporters: process.env.CI ? ['json'] : ['verbose'],
    },
    coverage: {
      reporter: process.env.CI ? ['lcov'] : ['text', 'json', 'html'],
      lines: 98,
      branches: 98,
      functions: 98,
      statements: 98,
      exclude: ['**/dist/**', '**/*.test.ts', '**/core/test/**'],
    },
    environment: 'jsdom',
    setupFiles: ['./packages/core/test/setup.ts'],
    globalSetup: ['./packages/core/test/globalSetup.ts'],
    testTimeout: 10_000,
  },
})
