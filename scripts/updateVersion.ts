import { existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

// Writes the current package.json version to `./src/errors/version.ts`.
const versionFilePath = join(import.meta.dir, '../src/errors/version.ts')
const packageJsonPath = join(import.meta.dir, '../src/package.json')
const packageVersion = (await Bun.file(packageJsonPath).json()).version

Bun.write(versionFilePath, `export const version = '${packageVersion}'\n`)

const tmpChangelogPath = join(import.meta.dir, '../src/CHANGELOG.md')
if (existsSync(tmpChangelogPath)) {
  const changelogPath = join(import.meta.dir, '../CHANGELOG.md')

  const tmpChangelog = await Bun.file(tmpChangelogPath).text()
  const changelog = await Bun.file(changelogPath).text()

  Bun.write(
    changelogPath,
    `${tmpChangelog}\n${changelog.replace('# viem\n\n', '')}`,
  )
  unlinkSync(tmpChangelogPath)
}
