import { join } from 'node:path'
import { Glob } from 'bun'

const generatedPath = join(import.meta.dir, '../contracts/generated.ts')

const artifacts: { name: string; content: string }[] = []
const fileNames: string[] = []

const glob = new Glob('contracts/out/**/*.json')
for await (const file of glob.scan('.')) {
  if (file.includes('build-info')) continue

  const fileName = file.split('/').pop()?.replace('.json', '')
  if (!fileName) continue
  if (fileNames.includes(fileName)) continue

  const { abi, bytecode, metadata } = await Bun.file(file, {
    type: 'application/json',
  }).json()

  // Only emit contracts authored under `contracts/test/`, not dependencies.
  const targets = Object.keys(metadata?.settings?.compilationTarget ?? {})
  if (!targets.some((target) => target.startsWith('test/'))) continue

  fileNames.push(fileName)
  artifacts.push({
    name: fileName,
    content: `export const ${fileName} = ${JSON.stringify(
      { abi, bytecode },
      null,
      2,
    )} as const;\n\n`,
  })
}

artifacts.sort((a, b) => a.name.localeCompare(b.name))

Bun.write(generatedPath, artifacts.map(({ content }) => content).join(''))
