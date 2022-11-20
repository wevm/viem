import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      lines: 98,
      branches: 98,
      functions: 98,
      statements: 98,
      exclude: ['**/dist/**', '**/packages/test/**', '**/*.test.ts'],
    },
    environment: 'jsdom',
    globalSetup: './packages/test/src/setup.ts',
  },
})
