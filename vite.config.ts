import { join } from 'node:path'
import { defineConfig } from 'vp'

const root = import.meta.dirname

export default defineConfig({
  fmt: {
    singleQuote: true,
    semi: false,
    trailingComma: 'all',
    printWidth: 80,
    ignorePatterns: [
      'contracts/**',
      'test/kzg/**',
      'test/tempo/**',
      'vectors/**',
      'site/dist/**',
      'site/pages/**',
      '**/CHANGELOG.md',
      '**/generated.ts',
      '**/tsconfig.json',
      '**/tsconfig.*.json',
      '**/package.json',
      '**/*.md',
      '**/*.mdx',
      '**/*.css',
      '**/*.yml',
      '**/*.yaml',
    ],
  },
  lint: {
    plugins: ['eslint', 'typescript', 'unicorn'],
    rules: {
      'no-console': ['error', { allow: ['log', 'warn', 'error'] }],
      // Mapped from the previous biome config (rules intentionally off):
      'typescript/no-explicit-any': 'off',
      'typescript/no-non-null-assertion': 'off',
      'typescript/no-empty-object-type': 'off',
      'typescript/no-namespace': 'off',
    },
    // NOTE(v3 A5): first pass runs without ox's jsdoc/tsdoc plugins and with
    // type-aware linting off — both phase in with the B/C module migrations
    // (JSDoc-on-every-public-export is enforced per migrated module).
    options: {
      typeAware: false,
    },
    ignorePatterns: [
      'contracts/**',
      'test/kzg/**',
      'test/tempo/**',
      'vectors/**',
      'site/dist/**',
      '**/generated.ts',
    ],
  },
  test: {
    alias: [
      { find: '~contracts', replacement: join(root, './contracts') },
      { find: '~test', replacement: join(root, './test/src') },
      { find: /^viem$/, replacement: join(root, './src/index.ts') },
      { find: /^viem\/(.*)/, replacement: join(root, './src/$1') },
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
          setupFiles: [join(root, './test/setup.ts')],
          globalSetup: [join(root, './test/setup.global.ts')],
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
          setupFiles: [join(root, './test/src/tempo/setup.ts')],
          globalSetup: [join(root, './test/src/tempo/setup.global.ts')],
          sequence: { groupOrder: 1 },
          hookTimeout: 20_000,
          testTimeout: 10_000,
        },
      },
    ],
  },
})
