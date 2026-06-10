import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    disableConsoleIntercept: true,
    alias: [
      { find: '~contracts', replacement: join(__dirname, '../contracts') },
      { find: '~test', replacement: join(__dirname, './src') },
      { find: /^viem$/, replacement: join(__dirname, '../src/index.ts') },
      { find: /^viem\/(.*)/, replacement: join(__dirname, '../src/$1') },
    ],
    include: [
      'src/experimental/eip813*/**/*.test.ts',
      'src/experimental/eip8168/**/*.test.ts',
      'scripts/setup8130Account.test.ts',
      'scripts/authorizeSessionKey.test.ts',
      'scripts/bundlerCreateAndExecute.test.ts',
      'scripts/bundlerProbeDeployed.test.ts',
      'scripts/selfBundleCreate.test.ts',
      'scripts/selfBundleRotateP256.test.ts',
    ],
    testTimeout: 120_000,
  },
})
