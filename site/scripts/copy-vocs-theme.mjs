import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const require = createRequire(import.meta.url)
const vocsConfigEntry = require.resolve('vocs/config')
const vocsRoot = resolve(dirname(vocsConfigEntry), '..')
const themePath = resolve(vocsRoot, 'src/styles/theme.css')
const outputPath = resolve(root, 'pages/_vocs.generated.css')

const content = readFileSync(themePath, 'utf-8')
  .split('\n')
  .filter((line) => !line.match(/--color-\*:\s*initial;/))
  .join('\n')

const output = `/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */
/* Source: node_modules/vocs/src/styles/theme.css */
${content}`

writeFileSync(outputPath, output)
console.log('Generated pages/_vocs.generated.css')
