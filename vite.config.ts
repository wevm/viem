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
      'contracts-old/**',
      'site-old/**',
      'src-old/**',
      'src/vendor/**',
      'test-old/**',
      'test/tempo/**',
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
    options: {
      typeAware: false,
    },
    ignorePatterns: [
      'contracts/**',
      'contracts-old/**',
      'site-old/**',
      'src-old/**',
      'src/vendor/**',
      'test-old/**',
      'test/tempo/**',
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
        '**/dist/**',
        '**/*.test.ts',
        '**/*.test-d.ts',
        '**/index.ts',
        'src/vendor/**',
      ],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'contracts-old/**',
      'site-old/**',
      'src-old/**',
      'test-old/**',
      ...(process.env.VITE_TEMPO_ZONES === 'true'
        ? []
        : ['src/tempo/actions/zone/integration.test.ts']),
    ],
    retry: 3,
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          include: ['src/**/*.test.ts'],
          exclude: ['**/node_modules/**', 'src/tempo/actions/**'],
          globalSetup: ['./test/setup.global.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'tempo',
          include: ['src/tempo/actions/**/*.test.ts'],
          globalSetup: ['./test/setup.tempo.global.ts'],
          setupFiles: ['./test/setup.tempo.ts'],
          // Per-file container boot + liquidity mints run in beforeAll; the
          // first (cold) boot plus parallel-worker contention can take ~60s.
          hookTimeout: 120_000,
          // Parallel per-worker containers slow receipt ceremonies.
          testTimeout: 30_000,
        },
      },
    ],
  },
})
