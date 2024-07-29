import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

// biome-ignore lint/suspicious/noConsoleLog:
console.log('Setting up packages for development.')

const packagePath = resolve(import.meta.dirname, '../src/package.json')
const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))

// biome-ignore lint/suspicious/noConsoleLog:
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

  let entries: any
  if (typeof exports === 'string')
    entries = [
      ['default', exports],
      ['types', exports.replace('.js', '.d.ts')],
    ]
  else entries = Object.entries(exports as {})

  // Link exports to dist locations
  for (const [, value] of entries as [
    type: 'types' | 'default',
    value: string,
  ][]) {
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

// biome-ignore lint/suspicious/noConsoleLog:
console.log('Done.')
