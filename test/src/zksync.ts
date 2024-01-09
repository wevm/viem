import { vi } from 'vitest'
import { type Chain, zkSyncSepoliaTestnet } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
// import { http } from '~viem/clients/transports/http.js'
import {
  type EIP1193RequestFn,
  type PublicRpcSchema,
  type WalletRpcSchema,
  createTransport,
} from '~viem/index.js'
import { warn } from './constants.js'

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
  forkBlockNumberZkSync = 25734n
  warn(
    `\`VITE_ANVIL_BLOCK_NUMBER_ZKSYNC\` not found. Falling back to \`${forkBlockNumberZkSync}\`.`,
  )
}

export let forkUrlZkSync: string
if (process.env.VITE_ANVIL_FORK_URL_ZKSYNC) {
  forkUrlZkSync = process.env.VITE_ANVIL_FORK_URL_ZKSYNC
} else {
  forkUrlZkSync = 'https://sepolia.era.zksync.dev'
  warn(
    `\`VITE_ANVIL_FORK_URL_ZKSYNC\` not found. Falling back to \`${forkUrlZkSync}\`.`,
  )
}

export const poolId = Number(process.env.VITEST_POOL_ID ?? 1)
export const localHttpUrlZkSync = `http://127.0.0.1:${anvilPortZkSync}/${poolId}`
export const localWsUrlZkSync = `ws://127.0.0.1:${anvilPortZkSync}/${poolId}`

export const zksyncAnvilChain = {
  ...zkSyncSepoliaTestnet,
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

export const transportRequestMock = vi.fn(async (request) => {
  if (request.method === 'eth_chainId') {
    return zksyncAnvilChain.id
  }

  if (request.method === 'eth_getBlockByNumber') {
    return {
      baseFeePerGas: '0x12a05f200',
    }
  }

  if (request.method === 'eth_maxPriorityFeePerGas') {
    return 1n
  }

  if (request.method === 'eth_estimateGas') {
    return 1n
  }

  if (request.method === 'eth_getTransactionCount') {
    return 600
  }

  if (request.method === 'eth_sendRawTransaction') {
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  }
  return null
}) as EIP1193RequestFn<WalletRpcSchema & PublicRpcSchema>

const mockTransport = () =>
  createTransport({
    key: 'mock',
    name: 'Mock Transport',
    request: transportRequestMock,
    type: 'mock',
  })

export const baseZkSyncTestClient = createClient({
  chain: zksyncAnvilChain,
  transport: mockTransport,
})
