import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      lines: 100,
      branches: 100,
      functions: 100,
      statements: 100,
    },
    environment: 'jsdom',
  },
})
