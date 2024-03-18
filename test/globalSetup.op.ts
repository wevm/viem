import { startProxy } from '@viem/anvil'

import fs from 'node:fs/promises'
import { join } from 'node:path'
import { execaCommand } from 'execa'
import { forkBlockNumber, forkUrl } from './src/constants.js'
import { forkBlockNumberOptimism, forkUrlOptimism } from './src/opStack.js'
import { forkBlockNumberZkSync, forkUrlZkSync } from './src/zksync.js'

const OPTIMISM_DIR = join(__dirname, '..', '.optimism')

const setup = async () => {
  if (await fs.exists(OPTIMISM_DIR)) return
  console.log(`cloning optimism repo to ${OPTIMISM_DIR}`)
  // from context of root
  await execaCommand(
    `git clone git@github.com:ethereum-optimism/optimism.git ${OPTIMISM_DIR}`,
  )
}

const start = async () => {
  console.log('starting optimism devnet...')
  // from context of optimism dir
  await execaCommand(`yarn --cwd ${OPTIMISM_DIR} start`)
}

export default async function () {
  if (process.env.SKIP_GLOBAL_SETUP) return
  await setup()
  await start()
  const shutdownMainnet = await startProxy({
    port: Number(process.env.VITE_ANVIL_PORT || '8545'),
    options: {
      forkUrl,
      forkBlockNumber,
      noMining: true,
      startTimeout: 20_000,
    },
  })
  const shutdownOptimism = await startProxy({
    port: Number(process.env.VITE_ANVIL_PORT_OPTIMISM || '8645'),
    options: {
      forkUrl: forkUrlOptimism,
      forkBlockNumber: forkBlockNumberOptimism,
      startTimeout: 20_000,
    },
  })
  const shutdownZkSync = await startProxy({
    port: Number(process.env.VITE_ANVIL_PORT_ZKSYNC || '8745'),
    options: {
      forkUrl: forkUrlZkSync,
      forkBlockNumber: forkBlockNumberZkSync,
      startTimeout: 20_000,
    },
  })
  return () => {
    shutdownMainnet()
    shutdownOptimism()
    shutdownZkSync()
  }
}
