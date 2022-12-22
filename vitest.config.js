import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: process.env.CI ? ['lcov'] : ['text', 'json', 'html'],
      lines: 98,
      branches: 98,
      functions: 98,
      statements: 98,
      exclude: ['**/dist/**', '**/*.test.ts'],
    },
    environment: 'jsdom',
    globalSetup: ['./packages/core/test/setup.ts'],
    testTimeout: 10_000,
  },
})
