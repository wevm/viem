import { join } from 'node:path'
import { defineConfig, type TestProjectConfiguration } from 'vitest/config'

export default defineConfig({
  test: {
    alias: [
      { find: '~contracts', replacement: join(__dirname, '../contracts') },
      { find: '~test', replacement: join(__dirname, './src') },
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
    exclude: ['**/node_modules/**', '**/_esm/**', '**/_cjs/**', '**/_types/**'],
    retry: 3,
    projects: [
      ...((process.env.TYPES
        ? [
            {
              extends: true,
              test: {
                name: 'type-bench',
                include: ['src/**/*.bench-d.ts'],
                globalSetup: [join(__dirname, './setup-bench-types.global.ts')],
              },
            },
          ]
        : []) satisfies TestProjectConfiguration[]),
      {
        extends: true,
        test: {
          name: 'core',
          exclude: [
            process.env.TEST_RLP !== 'true'
              ? '**/utils/encoding/toRlp.test.ts'
              : '',
            'src/tempo/**',
          ],
          include: ['src/**/*.test.ts'],
          setupFiles: [join(__dirname, './setup.ts')],
          globalSetup: [join(__dirname, './setup.global.ts')],
          hookTimeout: 60_000,
          testTimeout: 60_000,
          sequence: { groupOrder: 0 },
        },
      },
      {
        extends: true,
        test: {
          name: 'tempo',
          include: ['src/tempo/**/*.test.ts'],
          setupFiles: [join(__dirname, './src/tempo/setup.ts')],
          globalSetup: [join(__dirname, './src/tempo/setup.global.ts')],
          sequence: { groupOrder: 1 },
          testTimeout: 10_000,
        },
      },
    ],
  },
})
