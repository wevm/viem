import { type Chain, optimism } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/clients/transports/http.js'
import { accounts, getEnvVar } from './constants.js'

export const anvilPortOptimism: number = Number(
  getEnvVar('VITE_ANVIL_PORT_OPTIMISM', '8645'),
)
export const forkBlockNumberOptimism: bigint = BigInt(
  getEnvVar('VITE_ANVIL_BLOCK_NUMBER_OPTIMISM', '113624777'),
)
export const forkUrlOptimism: string = getEnvVar(
  'VITE_ANVIL_FORK_URL_OPTIMISM',
  'https://mainnet.optimism.io',
)
export const poolId = Number(getEnvVar('VITEST_POOL_ID', '1'))
export const localHttpUrlOptimism = `http://127.0.0.1:${anvilPortOptimism}/${poolId}`
export const localWsUrlOptimism = `ws://127.0.0.1:${anvilPortOptimism}/${poolId}`

export const optimismAnvilChain = {
  ...optimism,
  rpcUrls: {
    default: {
      http: [localHttpUrlOptimism],
      webSocket: [localWsUrlOptimism],
    },
  },
} as const satisfies Chain

export const optimismClient = createClient({
  chain: optimismAnvilChain,
  transport: http(),
}).extend(() => ({ mode: 'anvil' }))

export const optimismClientWithAccount = createClient({
  account: accounts[0].address,
  chain: optimismAnvilChain,
  transport: http(),
})

export const optimismClientWithoutChain = createClient({
  transport: http(localHttpUrlOptimism),
})
