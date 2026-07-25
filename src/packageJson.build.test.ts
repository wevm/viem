import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

test('build:types emits _types/package.json module marker', () => {
  const packageJson = JSON.parse(
    readFileSync(resolve(rootDir, 'package.json'), 'utf-8'),
  ) as { scripts: { 'build:types': string } }

  // Consumers under `moduleResolution: nodenext` treat `_types/*.d.ts` as CJS
  // unless the folder has an explicit `{"type":"module"}` package.json
  // (mirroring `_esm/` / `_cjs/`). See #4843.
  expect(packageJson.scripts['build:types']).toContain(
    './src/_types/package.json',
  )
  expect(packageJson.scripts['build:types']).toContain('"type":"module"')
})
