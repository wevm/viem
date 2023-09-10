import path from 'node:path'
import { globby } from 'globby'

const generatedPath = path.join(
  import.meta.dir,
  '../test/contracts/generated.ts',
)
Bun.write(generatedPath, '')

globby([path.join(import.meta.dir, '../test/contracts/out/**/*.json')]).then(
  (paths) => {
    const generated = Bun.file(generatedPath)
    const writer = generated.writer()

    paths.forEach(async (path) => {
      const fileName = path.split('/').pop()?.replace('.json', '')
      const json = await Bun.file(path, { type: 'application/json' }).json()
      writer.write(
        `export const ${fileName} = ${JSON.stringify(
          json,
          null,
          2,
        )} as const;\n\n`,
      )
    })
  },
)
