import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const { version } = require('typescript/package.json')
const tscPath = require.resolve('typescript/lib/tsc')

const args = process.argv.slice(2)
const majorVersion = Number.parseInt(version.split('.')[0] ?? '0', 10)

// TypeScript 6 deprecates `moduleResolution=node`/`node10`, but viem's
// CommonJS build still relies on that resolution mode for now.
if (
  majorVersion >= 6 &&
  !args.includes('--ignoreDeprecations') &&
  (args.includes('--moduleResolution') ||
    args.some((arg) => arg.startsWith('--moduleResolution=')))
) {
  const moduleResolutionIndex = args.indexOf('--moduleResolution')
  const moduleResolution =
    moduleResolutionIndex >= 0
      ? args[moduleResolutionIndex + 1]
      : args.find((arg) => arg.startsWith('--moduleResolution='))?.split('=')[1]

  if (moduleResolution === 'node' || moduleResolution === 'node10')
    args.push('--ignoreDeprecations', '6.0')
}

const result = spawnSync(process.execPath, [tscPath, ...args], {
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
