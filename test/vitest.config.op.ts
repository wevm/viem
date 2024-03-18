import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: {
      '~viem': join(__dirname, '../src'),
      '~test': join(__dirname, '.'),
    },
    environment: 'node',
    include: ['src/chains/opstack/**/*.test.ts'],
    setupFiles: [join(__dirname, './setup.op.ts')],
    globalSetup: [join(__dirname, './globalSetup.op.ts')],
    hookTimeout: 20_000,
    testTimeout: 20_000,
  },
})
