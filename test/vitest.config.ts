import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: [
      { find: '~contracts', replacement: join(__dirname, '../contracts') },
      { find: '~test', replacement: join(__dirname, '.') },
      { find: /^viem$/, replacement: join(__dirname, '../src/index.ts') },
      { find: /^viem\/(.*)/, replacement: join(__dirname, '../src/$1') },
    ],
    benchmark: {
      outputFile: './bench/report.json',
      reporters: process.env.CI ? ['default'] : ['verbose'],
    },
    coverage: {
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
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          benchmark: {
            outputFile: './bench/report.json',
            reporters: process.env.CI ? ['default'] : ['verbose'],
          },
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '.idea',
            '.git',
            '.cache',
            process.env.TEST_RLP !== 'true'
              ? '**/utils/encoding/toRlp.test.ts'
              : '',
          ],
          include: [
            ...(process.env.TYPES ? ['**/*.bench-d.ts'] : []),
            'src/**/*.test.ts',
          ],
          setupFiles: process.env.TYPES ? [] : [join(__dirname, './setup.ts')],
          globalSetup: process.env.TYPES
            ? [join(__dirname, './setup-bench-types.global.ts')]
            : [join(__dirname, './setup.global.ts')],
          hookTimeout: 60_000,
          testTimeout: 60_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'tempo',
          include: ['src/tempo/**/*.test.ts'],
          setupFiles: [join(__dirname, './src/tempo/setup.ts')],
          globalSetup: [join(__dirname, './src/tempo/setup.global.ts')],
        },
      },
    ],
  },
})
