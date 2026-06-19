import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Generates `package.json#exports` (+ `typesVersions`) based on the contents of `./src`.
//
// Conventions:
// - `./src/index.ts`             → `.`
// - `./src/<dir>/index.ts`       → `./<dir>`
// - `./src/<dir>/<sub>/index.ts` → `./<dir>/<sub>`
// - explicit file entrypoints (see `fileEntrypoints`), e.g. `./src/chains/utils.ts` → `./chains/utils`
//
// Directories without an `index.ts` (e.g. `clients/`, `constants/`, `errors/`, `types/`)
// are internal and not exported.

/** Non-`index.ts` file entrypoints. */
const fileEntrypoints = ['chains/utils']

const srcDir = join(import.meta.dirname, '../src')
const packageJsonPath = join(import.meta.dirname, '../package.json')

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

console.log(`Updated ${exports.length} exports.`)
