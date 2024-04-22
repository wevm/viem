import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/index.js'
import { anvilZkSync } from './anvil.js'
import { accounts } from './constants.js'

export const zkSyncClient = createClient({
  chain: anvilZkSync.chain,
  transport: http(),
})

export const zkSyncClientWithAccount = createClient({
  account: accounts[0].address,
  chain: anvilZkSync.chain,
  transport: http(),
})
