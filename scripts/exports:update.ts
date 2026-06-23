import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Generates `package.json#exports` (+ `typesVersions`) based on the contents of `./src`.
//
// Conventions:
// - `./src/index.ts`             → `.`
// - `./src/<dir>/index.ts`       → `./<dir>`
// - `./src/<dir>/<sub>/index.ts` → `./<dir>/<sub>`
// - explicit file entrypoints (see `fileEntrypoints`), e.g. `./src/<dir>/<file>.ts` → `./<dir>/<file>`
//
// Directories without an `index.ts` (e.g. `clients/`, `constants/`, `errors/`, `types/`)
// are internal and not exported.

/** Non-`index.ts` file entrypoints. */
const fileEntrypoints: string[] = []

const srcDir = join(import.meta.dirname, '../src')
const packageJsonPath = join(import.meta.dirname, '../package.json')
const testTsconfigPath = join(import.meta.dirname, '../test/tsconfig.json')

function entry(key: string, srcPath: string) {
  const distPath = srcPath.replace(/^\.\/src\//, './dist/').replace(/\.ts$/, '')
  return [
    key,
    {
      types: `${distPath}.d.ts`,
      src: srcPath,
      default: `${distPath}.js`,
    },
  ] as const
}

const exports: (readonly [string, object | string])[] = [
  entry('.', './src/index.ts'),
]

for (const dir of readdirSync(srcDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  if (dir.name.startsWith('_') || dir.name.startsWith('.')) continue
  if (dir.name === 'node_modules') continue
  // `core/` is internal; its modules are re-exported by `src/index.ts`.
  if (dir.name === 'core') continue

  const dirPath = join(srcDir, dir.name)
  if (existsSync(join(dirPath, 'index.ts')))
    exports.push(entry(`./${dir.name}`, `./src/${dir.name}/index.ts`))

  for (const sub of readdirSync(dirPath, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue
    if (sub.name.startsWith('_') || sub.name.startsWith('.')) continue
    if (existsSync(join(dirPath, sub.name, 'index.ts')))
      exports.push(
        entry(
          `./${dir.name}/${sub.name}`,
          `./src/${dir.name}/${sub.name}/index.ts`,
        ),
      )
  }
}

for (const file of fileEntrypoints)
  if (existsSync(join(srcDir, `${file}.ts`)))
    exports.push(entry(`./${file}`, `./src/${file}.ts`))

// NOTE: no `./package.json` export — zile treats it as an asset and copies the
// (dev) manifest into `dist/`, which breaks publint + ships dev fields.
exports.sort(([a], [b]) =>
  a === '.' ? -1 : b === '.' ? 1 : a.localeCompare(b),
)

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
packageJson.exports = Object.fromEntries(exports)
packageJson.typesVersions = {
  '*': {
    '*': ['./dist/*', './dist/*/index.d.ts'],
  },
}
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

// Keep `test/tsconfig.json` `viem*` paths in lockstep with the exports above so
// tests resolve the same module identity the package ships (drift collapses
// contextual typing and breaks editor completions in test files).
const testTsconfig = JSON.parse(readFileSync(testTsconfigPath, 'utf8'))
const paths = testTsconfig.compilerOptions.paths as Record<string, string[]>
const nonViem = Object.fromEntries(
  Object.entries(paths).filter(([key]) => !/^viem(\/|$)/.test(key)),
)
const viem = Object.fromEntries(
  exports.map(([key, value]) => {
    const subpath = key === '.' ? 'viem' : key.replace(/^\.\//, 'viem/')
    const srcPath = (value as { src: string }).src.replace(/^\.\//, '../')
    return [subpath, [srcPath]] as const
  }),
)
testTsconfig.compilerOptions.paths = { ...nonViem, ...viem }
writeFileSync(testTsconfigPath, `${JSON.stringify(testTsconfig, null, 2)}\n`)

console.log(`Updated ${exports.length} exports.`)
