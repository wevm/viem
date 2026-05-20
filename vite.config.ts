import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vp'

const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('./package.json', import.meta.url)),
    'utf8',
  ),
) as { exports: Record<string, { src?: string }> }

const aliases: { find: RegExp; replacement: string }[] = []
for (const [subpath, entry] of Object.entries(pkg.exports)) {
  if (!entry.src) continue
  const specifier =
    subpath === '.' ? 'viem' : `viem/${subpath.replace(/^\.\//, '')}`
  aliases.push({
    find: new RegExp(`^${specifier.replace(/\//g, '\\/')}$`),
    replacement: fileURLToPath(new URL(entry.src, import.meta.url)),
  })
}

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
  resolve: {
    alias: aliases,
  },
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
    globalSetup: ['./test/setup.global.ts'],
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
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
    embeddedLanguageFormatting: 'off',
    ignorePatterns: ignores,
    printWidth: 80,
    semi: false,
    singleQuote: true,
    sortImports: false,
    sortPackageJson: false,
    trailingComma: 'all',
  },
})
