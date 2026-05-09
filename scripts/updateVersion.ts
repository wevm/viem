import { join } from 'node:path'

// Writes the current package.json version to `./src/errors/version.ts`.
const versionFilePath = join(import.meta.dir, '../src/errors/version.ts')
const packageJsonPath = join(import.meta.dir, '../src/package.json')
const packageVersion = (await Bun.file(packageJsonPath).json()).version
Bun.write(versionFilePath, `export const version = '${packageVersion}'\n`)

// Update jsr.json.
const jsrJsonPath = join(import.meta.dir, '../src/jsr.json')
const jsrJson = await Bun.file(jsrJsonPath).json()
jsrJson.version = packageVersion
Bun.write(jsrJsonPath, JSON.stringify(jsrJson, null, 2))
