import { existsSync } from 'node:fs'
import { join } from 'node:path'

// Writes the current package.json version to v3's internal version module.
const versionFilePath = join(import.meta.dir, '../src/core/internal/version.ts')
const packageJsonPath = join(import.meta.dir, '../package.json')
const packageVersion = (await Bun.file(packageJsonPath).json()).version
Bun.write(versionFilePath, `export const version = '${packageVersion}'\n`)

// Update jsr.json.
const jsrJsonPath = join(import.meta.dir, '../src/jsr.json')
if (existsSync(jsrJsonPath)) {
  const jsrJson = await Bun.file(jsrJsonPath).json()
  jsrJson.version = packageVersion
  Bun.write(jsrJsonPath, JSON.stringify(jsrJson, null, 2))
}
