import { zkSync } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http, type Chain } from '~viem/index.js'
import { accounts, getEnvVar } from './constants.js'

export const anvilPortZkSync: number = Number(
  getEnvVar('VITE_ANVIL_PORT_ZKSYNC', ' 8745'),
)
export const forkBlockNumberZkSync: bigint = BigInt(
  getEnvVar('VITE_ANVIL_BLOCK_NUMBER_ZKSYNC', ' 24739066'),
)
export const forkUrlZkSync: string = getEnvVar(
  'VITE_ANVIL_FORK_URL_ZKSYNC',
  'https://mainnet.era.zksync.io',
)
export const poolId = Number(getEnvVar('VITEST_POOL_ID', '1'))
export const localHttpUrlZkSync = `http://127.0.0.1:${anvilPortZkSync}/${poolId}`
export const localWsUrlZkSync = `ws://127.0.0.1:${anvilPortZkSync}/${poolId}`

export const zksyncAnvilChain = {
  ...zkSync,
  rpcUrls: {
    default: {
      http: [localHttpUrlZkSync],
      webSocket: [localWsUrlZkSync],
    },
    public: {
      http: [localHttpUrlZkSync],
      webSocket: [localWsUrlZkSync],
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
