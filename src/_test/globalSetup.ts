import { setBlockNumber, testClient } from './utils'
import { setAutomine, setIntervalMining } from '../actions'

export async function setup() {
  if (!process.env.SKIP_GLOBAL_SETUP) {
    await setBlockNumber(BigInt(parseInt(process.env.VITE_ANVIL_BLOCK_NUMBER!)))
    await setAutomine(testClient, false)
    await setIntervalMining(testClient, { interval: 1 })
  }
}
