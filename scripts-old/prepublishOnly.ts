import { join } from 'node:path'

const packageJsonPath = join(import.meta.dir, '../package.json')
const packageJson = await Bun.file(packageJsonPath).json()

if (packageJson.type !== 'module')
  throw new Error('Expected `package.json#type` to be `module`.')

if (!packageJson.exports?.['.']?.default?.startsWith('./dist/'))
  throw new Error('Expected package exports to point at `dist` output.')
