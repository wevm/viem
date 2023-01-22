import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    benchmark: {
      outputFile: 'bench/report.json',
      reporters: process.env.CI ? ['json'] : ['verbose'],
    },
    coverage: {
      reporter: process.env.CI ? ['lcov'] : ['text', 'json', 'html'],
      exclude: ['**/dist/**', '**/*.test.ts', '**/test/**'],
    },
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globalSetup: ['./test/globalSetup.ts'],
    testTimeout: 10_000,
  },
})
