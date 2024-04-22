import { zkSync } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http, type Chain } from '~viem/index.js'
import { anvilZkSync } from './anvil.js'
import { accounts } from './constants.js'

export const zksyncAnvilChain = {
  ...zkSync,
  rpcUrls: {
    default: {
      http: [anvilZkSync.rpcUrl.http],
      webSocket: [anvilZkSync.rpcUrl.ws],
    },
    public: {
      http: [anvilZkSync.rpcUrl.http],
      webSocket: [anvilZkSync.rpcUrl.ws],
    },
  },
} as const satisfies Chain

export const zkSyncClient = createClient({
  chain: zksyncAnvilChain,
  transport: http(),
})

export const zkSyncClientWithAccount = createClient({
  account: accounts[0].address,
  chain: zksyncAnvilChain,
  transport: http(),
})
