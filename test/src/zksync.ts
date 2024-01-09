import { vi } from 'vitest'
import { zkSyncSepoliaTestnet } from '~viem/chains/index.js'
import { eip712Actions } from '~viem/chains/zksync/index.js'
import { createClient } from '~viem/clients/createClient.js'
import {
  type EIP1193RequestFn,
  type PublicRpcSchema,
  type WalletRpcSchema,
  createTransport,
} from '~viem/index.js'

export const transportRequestMock = vi.fn(async (request) => {
  if (request.method === 'eth_chainId') {
    return zkSyncSepoliaTestnet.id
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

export const zkSyncMockClient = createClient({
  chain: zkSyncSepoliaTestnet,
  transport: mockTransport,
}).extend(eip712Actions)
