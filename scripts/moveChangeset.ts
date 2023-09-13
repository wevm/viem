import { existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

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
