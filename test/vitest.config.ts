import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: {
      '~contracts': join(__dirname, '../contracts'),
      '~viem': join(__dirname, '../src'),
      '~test': join(__dirname, '.'),
    },
    benchmark: {
      outputFile: './bench/report.json',
      reporters: process.env.CI ? ['json'] : ['verbose'],
    },
    coverage: {
      all: false,
      provider: 'v8',
      reporter: process.env.CI ? ['lcov'] : ['text', 'json', 'html'],
      exclude: [
        '**/errors/utils.ts',
        '**/zksync/**',
        '**/_cjs/**',
        '**/_esm/**',
        '**/_types/**',
        '**/*.bench.ts',
        '**/*.bench-d.ts',
        '**/*.test.ts',
        '**/*.test-d.ts',
        '**/test/**',
      ],
    },
    environment: 'node',
    include: [
      ...(process.env.TYPES ? ['**/*.bench-d.ts'] : []),
      'src/**/*.test.ts',
    ],
    setupFiles: process.env.TYPES ? [] : [join(__dirname, './setup.ts')],
    globalSetup: process.env.TYPES
      ? [join(__dirname, './benchTypesGlobalSetup.ts')]
      : [join(__dirname, './globalSetup.ts')],
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
})
