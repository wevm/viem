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
      'src/vendor/**',
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
      'src/vendor/**',
      'site/dist/**',
      '**/generated.ts',
    ],
  },
  test: {
    fileParallelism: true,
    maxWorkers: 4,
    pool: 'forks',
    teardownTimeout: 60_000,
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
        '**/*.bench-d.ts',
        '**/*.test.ts',
        '**/*.test-d.ts',
        '**/index.ts',
        'src/vendor/**',
      ],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      ...(process.env.VITE_TEMPO_ZONES === 'true'
        ? []
        : ['src/tempo/actions/zone/integration.test.ts']),
    ],
    retry: 3,
    projects: [
      ...(process.env.TYPES
        ? [
            {
              extends: true,
              test: {
                name: 'type-bench',
                include: ['src/**/*.bench-d.ts'],
                globalSetup: ['./test/setup.bench-types.global.ts'],
                retry: 0,
              },
            },
          ]
        : []),
      {
        extends: true,
        test: {
          name: 'core',
          include: ['src/**/*.test.ts'],
          exclude: ['**/node_modules/**', 'src/tempo/actions/**'],
          globalSetup: ['./test/setup.global.ts'],
          retry: 0,
          setupFiles: ['./test/setup.core.ts'],
          testTimeout: 30_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'tempo',
          include: ['src/tempo/actions/**/*.test.ts'],
          globalSetup: ['./test/setup.tempo.global.ts'],
          setupFiles: ['./test/setup.tempo.ts'],
          retry: 0,
          hookTimeout: 180_000,
          // Concurrent nodes slow receipt ceremonies; CI load pushes
          // single tests past 30s.
          testTimeout: 60_000,
        },
      },
    ],
  },
})
