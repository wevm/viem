import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

// Generates package.json#exports from source entrypoints.
//
// Conventions:
// - ./src/index.ts                 -> .
// - ./src/<dir>/index.ts           -> ./<dir>
// - ./src/<dir>/<nested>/index.ts  -> ./<dir>/<nested>
// - ./src/<PascalCase>.ts          -> ./<PascalCase>
// - ./src/<dir>/<PascalCase>.ts    -> ./<dir>/<PascalCase>
//
// Lowercase implementation files are intentionally not exported. Viem v3 keeps
// public file boundaries explicit while the rest of the migration moves APIs
// behind modules.

const srcPath = join(import.meta.dirname, '../src')
const packageJsonPath = join(import.meta.dirname, '../package.json')

const nestedIndexDirs = new Set([
  'experimental/erc7739',
  'experimental/erc7811',
  'experimental/erc7821',
  'experimental/erc7846',
  'experimental/erc7895',
  'tempo/actions',
  'tempo/zones',
])

function entry(key: string, sourcePath: string) {
  const distPath = sourcePath
    .replace(/^\.\/src\//, './dist/')
    .replace(/\.ts$/, '')
  return [
    key,
    {
      types: `${distPath}.d.ts`,
      src: sourcePath,
      default: `${distPath}.js`,
    },
  ] as const
}

const entries: Array<readonly [string, object | string]> = [
  entry('.', './src/index.ts'),
]

const topLevelDirs = readdirSync(srcPath, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .filter((name) => !name.startsWith('_') && !name.startsWith('.'))
  .sort()

for (const dir of topLevelDirs) {
  const indexPath = join(srcPath, dir, 'index.ts')
  try {
    readFileSync(indexPath)
    entries.push(entry(`./${dir}`, `./src/${dir}/index.ts`))
  } catch {}
}

for (const nestedDir of [...nestedIndexDirs].sort()) {
  const indexPath = join(srcPath, nestedDir, 'index.ts')
  try {
    readFileSync(indexPath)
    entries.push(entry(`./${nestedDir}`, `./src/${nestedDir}/index.ts`))
  } catch {}
}

for (const file of findPascalCaseModules(srcPath))
  entries.push(entry(`./${file.replace(/\.ts$/, '')}`, `./src/${file}`))

entries.push(['./package.json', './package.json'])

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
packageJson.exports = Object.fromEntries(
  entries.sort(([a], [b]) => {
    if (a === '.') return -1
    if (b === '.') return 1
    if (a === './package.json') return 1
    if (b === './package.json') return -1
    return a.localeCompare(b)
  }),
)

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

const displayPath = relative(process.cwd(), packageJsonPath)
console.log(`Updated ${displayPath}#exports with ${entries.length} entries.`)

function findPascalCaseModules(path: string, prefix = '') {
  const files: string[] = []
  for (const dirent of readdirSync(path, { withFileTypes: true })) {
    if (dirent.name.startsWith('_') || dirent.name.startsWith('.')) continue
    const filePath = join(path, dirent.name)
    const fileName = prefix ? `${prefix}/${dirent.name}` : dirent.name
    if (dirent.isDirectory()) {
      files.push(...findPascalCaseModules(filePath, fileName))
      continue
    }
    if (!dirent.name.endsWith('.ts')) continue
    if (dirent.name.endsWith('.test.ts')) continue
    if (dirent.name.endsWith('.test-d.ts')) continue
    if (dirent.name === 'index.ts') continue
    if (!/^[A-Z]/.test(dirent.name)) continue
    if (!statSync(filePath).isFile()) continue
    files.push(fileName)
  }
  return files.sort()
}
