import { globby } from 'globby'
import { tsImport } from 'tsx/esm/api'

const paths = await globby(['src/**/*.bench-d.ts'])
for (const path of paths) {
  await tsImport(`../${path}`, import.meta.url)
}
