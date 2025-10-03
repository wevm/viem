import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('Setting up packages for development.')

const __dirname = dirname(fileURLToPath(import.meta.url))
const packagePath = resolve(__dirname, '../src/package.json')
const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))

console.log(`${packageJson.name} — ${dirname(packagePath)}`)

const dir = resolve(dirname(packagePath))

// Empty dist directories
for (const dirName of ['_cjs', '_esm', '_types']) {
  const dist = resolve(dir, dirName)
  let files: string[] = []
  try {
    files = readdirSync(dist)
  } catch {
    mkdirSync(dist)
  }

  for (const file of files)
    rmSync(join(dist, file), { recursive: true, force: true })
}

// Link exports to dist locations
for (const [key, exports] of Object.entries(packageJson.exports)) {
  // Skip `package.json` exports
  if (/package\.json$/.test(key)) continue

  let entries: [string, string][]
  if (typeof exports === 'string')
    entries = [
      ['default', exports],
      ['types', exports.replace('.js', '.d.ts')],
    ]
  else entries = Object.entries(exports as Record<string, string>)

  // Link exports to dist locations
  for (const [, value] of entries) {
    const srcDir = resolve(dir, dirname(value).replace(/_types|_esm|_cjs/, ''))
    const srcFilePath = resolve(srcDir, 'index.ts')

    const distDir = resolve(dir, dirname(value))
    const distFileName = basename(value)
    const distFilePath = resolve(distDir, distFileName)

    mkdirSync(distDir, { recursive: true })

    // Symlink src to dist file
    try {
      symlinkSync(srcFilePath, distFilePath, 'file')
    } catch {}
  }
}

console.log('Done.')
