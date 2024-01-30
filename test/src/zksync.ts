import { zkSync } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http, type Chain } from '~viem/index.js'
import { accounts, warn } from './constants.js'

export let anvilPortZkSync: number
if (process.env.VITE_ANVIL_PORT_ZKSYNC) {
  anvilPortZkSync = Number(process.env.VITE_ANVIL_PORT_ZKSYNC)
} else {
  anvilPortZkSync = 8745
  warn(
    `\`VITE_ANVIL_PORT_ZKSYNC\` not found. Falling back to \`${anvilPortZkSync}\`.`,
  )
}

export let forkBlockNumberZkSync: bigint
if (process.env.VITE_ANVIL_BLOCK_NUMBER_ZKSYNC) {
  forkBlockNumberZkSync = BigInt(
    Number(process.env.VITE_ANVIL_BLOCK_NUMBER_ZKSYNC),
  )
} else {
  forkBlockNumberZkSync = 24739066n
  warn(
    `\`VITE_ANVIL_BLOCK_NUMBER_ZKSYNC\` not found. Falling back to \`${forkBlockNumberZkSync}\`.`,
  )
}

export let forkUrlZkSync: string
if (process.env.VITE_ANVIL_FORK_URL_ZKSYNC) {
  forkUrlZkSync = process.env.VITE_ANVIL_FORK_URL_ZKSYNC
} else {
  forkUrlZkSync = 'https://mainnet.era.zksync.io'
  warn(
    `\`VITE_ANVIL_FORK_URL_ZKSYNC\` not found. Falling back to \`${forkUrlZkSync}\`.`,
  )
}

export const poolId = Number(process.env.VITEST_POOL_ID ?? 1)
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
