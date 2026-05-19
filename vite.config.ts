import { defineConfig } from 'vp'

const ignores = [
  '**/_cjs/**',
  '**/_esm/**',
  '**/_types/**',
  '**/.cache/**',
  '**/.next/**',
  '**/.svelte-kit/**',
  '**/.vercel/**',
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  '.agents/**',
  '.changeset/**',
  '.github/**',
  'contracts/**',
  'scripts-old/**',
  'site/**',
  'src-old/**',
  'test-old/**',
  'vectors/**',
  'wagmi/**',
  '**/CHANGELOG.md',
  '**/bun.lockb',
  '**/cache/**',
  '**/generated.ts',
  '**/site/dist/**',
]

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test-d.ts',
        'src/**/*.snap-d.ts',
        'src/**/*.browser.test.ts',
      ],
      reporter: ['text', 'json'],
      thresholds: {
        100: true,
        perFile: true,
      },
    },
    exclude: ['**/node_modules/**', '**/dist/**'],
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    typecheck: {
      exclude: ['**/node_modules/**', '**/dist/**', 'test-old/**'],
      include: ['src/**/*.test-d.ts'],
    },
  },
  lint: {
    ignorePatterns: ignores,
    plugins: ['typescript', 'oxc', 'vitest'],
    rules: {
      'import/no-cycle': 'off',
      'no-console': ['error', { allow: ['log'] }],
      'no-explicit-any': 'off',
      'no-non-null-assertion': 'off',
      'no-redeclare': 'off',
    },
  },
  fmt: {
    ignorePatterns: ignores,
    printWidth: 80,
    semi: false,
    singleQuote: true,
    sortImports: false,
    sortPackageJson: false,
    trailingComma: 'all',
  },
})
