import { glob } from 'glob'
import { tsImport } from 'tsx/esm/api'

const paths = await glob('src/**/*.bench-d.ts')
for (const path of paths) {
  await tsImport(`../../${path}`, import.meta.url)
}
