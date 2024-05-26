import { join } from 'node:path'
import { globby } from 'globby'

const generatedPath = join(import.meta.dir, '../test/contracts/generated.ts')
Bun.write(generatedPath, '')

const generated = Bun.file(generatedPath)
const writer = generated.writer()

const paths = await globby([
  join(import.meta.dir, '../test/contracts/out/**/*.json'),
])

const fileNames = []

for (const path of paths) {
  const fileName = path.split('/').pop()?.replace('.json', '')
  if (fileNames.includes(fileName)) continue

  const { abi, bytecode } = await Bun.file(path, {
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
