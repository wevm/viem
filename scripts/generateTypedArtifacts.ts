import { join } from 'node:path'
import { Glob } from 'bun'

const generatedPath = join(import.meta.dir, '../contracts/generated.ts')
Bun.write(generatedPath, '')

const generated = Bun.file(generatedPath)
const writer = generated.writer()

const fileNames = []

const glob = new Glob('contracts/out/**/*.json')
for await (const file of glob.scan('.')) {
  if (file.includes('build-info')) continue

  const fileName = file.split('/').pop()?.replace('.json', '')
  if (fileNames.includes(fileName)) continue

  const { abi, bytecode } = await Bun.file(file, {
    type: 'application/json',
  }).json()
  fileNames.push(fileName)

  writer.write(
    `export const ${fileName} = ${JSON.stringify(
      { abi, bytecode },
      null,
      2,
    )} as const;\n\n`,
  )
}

writer.end()
