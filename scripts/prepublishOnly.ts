import { join } from 'node:path'

const packageJsonPath = join(import.meta.dir, '../src/package.json')
const packageJson = await Bun.file(packageJsonPath).json()

// NOTE: We explicitly don't want to publish the type field.
// We create a separate package.json for `dist/cjs` and `dist/esm` that has the type field.
delete packageJson.type

Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2))
