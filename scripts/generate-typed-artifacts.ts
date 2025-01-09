import { appendFile, glob, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const out = resolve(import.meta.dirname, '../contracts/generated.ts')
await writeFile(out, '')

const fileNames: string[] = []

for await (const file of glob(
  resolve(import.meta.dirname, '../contracts/out/**/*.json'),
)) {
  if (file.includes('build-info')) continue

  const fileName = file.split('/').pop()?.replace('.json', '')!
  if (fileNames.includes(fileName)) continue

  const { abi, bytecode } = JSON.parse(await readFile(file, 'utf-8'))
  fileNames.push(fileName)

  appendFile(
    out,
    `export const ${fileName} = ${JSON.stringify(
      { abi, bytecode },
      null,
      2,
    )} as const;\n\n`,
  )
}
