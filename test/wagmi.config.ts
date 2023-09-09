import { join } from 'node:path'
import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'

export default defineConfig({
  out: join(__dirname, './generated.ts'),
  contracts: [],
  plugins: [
    foundry({
      project: 'test/contracts/',
    }),
  ],
})
