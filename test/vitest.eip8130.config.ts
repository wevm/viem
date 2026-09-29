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
      'src/eip8130/**/*.test.ts',
      'src/eip8168/**/*.test.ts',
      // Manual / integration demo scripts (most require PRIVATE_KEY + network).
      'scripts/eip8130/**/*.test.ts',
    ],
    testTimeout: 120_000,
  },
})
