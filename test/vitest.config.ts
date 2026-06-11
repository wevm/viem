import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: [
      { find: '~contracts', replacement: join(__dirname, '../contracts') },
      { find: '~test', replacement: join(__dirname, './src') },
      { find: /^viem$/, replacement: join(__dirname, '../src/index.ts') },
      { find: /^viem\/(.*)/, replacement: join(__dirname, '../src/$1') },
    ],
    coverage: {
      provider: 'v8',
      reporter: process.env.CI ? ['lcov'] : ['text', 'json', 'html'],
      exclude: [
        '**/account-abstraction/**',
        '**/errors/utils.ts',
        '**/linea/**',
        '**/op-stack/**',
        '**/zksync/**',
        '**/dist/**',
        '**/*.test.ts',
        '**/*.test-d.ts',
        '**/test/**',
      ],
    },
    exclude: ['**/node_modules/**', '**/dist/**'],
    retry: 3,
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          exclude: [
            process.env.TEST_RLP !== 'true'
              ? '**/utils/encoding/toRlp.test.ts'
              : '',
            'src/tempo/**',
            'src/account-abstraction/**',
            'src/linea/**',
            'src/op-stack/**',
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
          hookTimeout: 20_000,
          testTimeout: 10_000,
        },
      },
    ],
  },
})
