import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Adds the `./_types/*` subpath to `package.json#exports` (+ `typesVersions`).
//
// This makes every built module addressable so TypeScript can name internal types while
// a consumer emits its own declarations. Without a public specifier for these files,
// exporting an inferred Viem value fails:
//
//   export const client = Client.create({ chain: mainnet, transport: http() })
//   //           ^ TS2742, or TS2883 on TypeScript 7
//
// TypeScript reverse-maps a declaration's file path against `exports` to find a portable
// specifier. Files under `dist/` match nothing today, so it falls back to a relative
// `node_modules` path and refuses to emit. See `environments/tsc/declaration`.
//
// `./_types/*` is not public API and is excluded from semver. Import from the documented
// entrypoints; this exists only so the compiler has a name to write down.
//
// Runs after `zile` rather than inside `exports:update`, because zile requires a `src`
// field on every export entry and expands it as a glob to decide what to build. A
// `./src/*.ts` glob pulls every test file into the package build. Folding this back into
// `exports:update` needs zile to support declaration-only subpaths first.

const packageJsonPath = join(import.meta.dirname, '../package.json')

const key = './_types/*'
const types = './dist/*.d.ts'

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

packageJson.exports = Object.fromEntries(
  [
    ...Object.entries(packageJson.exports).filter(([k]) => k !== key),
    [key, { types, default: './dist/*.js' }] as const,
  ].sort(([a], [b]) => (a === '.' ? -1 : b === '.' ? 1 : a.localeCompare(b))),
)

packageJson.typesVersions = {
  '*': {
    ...packageJson.typesVersions?.['*'],
    [key.replace(/^\.\//, '')]: [types],
  },
}

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

console.log(`Added ${key} export.`)
