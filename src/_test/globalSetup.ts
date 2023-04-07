import { setBlockNumber, testClient } from './utils.js'
import { setAutomine, setIntervalMining } from '../actions/index.js'

export async function setup() {
  if (!process.env.SKIP_GLOBAL_SETUP) {
    await setBlockNumber(BigInt(parseInt(process.env.VITE_ANVIL_BLOCK_NUMBER!)))
    await setAutomine(testClient, false)
    await setIntervalMining(testClient, { interval: 1 })
  }
}
