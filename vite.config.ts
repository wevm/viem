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
      'src-old/**',
      'test-old/**',
    ],
    retry: 3,
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          include: ['src/**/*.test.ts'],
          globalSetup: ['./test/setup.global.ts'],
        },
      },
    ],
  },
})
