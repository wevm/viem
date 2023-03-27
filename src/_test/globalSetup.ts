import { testClient } from './utils.js'
import { reset, setAutomine, setIntervalMining } from '../actions/index.js'

export async function setup() {
  if (!process.env.SKIP_GLOBAL_SETUP) {
    await reset(testClient, {
      blockNumber: BigInt(parseInt(process.env.VITE_ANVIL_BLOCK_NUMBER!)),
      jsonRpcUrl: process.env.VITE_ANVIL_FORK_URL,
    })
    await setAutomine(testClient, false)
    await setIntervalMining(testClient, { interval: 1 })
  }
}
