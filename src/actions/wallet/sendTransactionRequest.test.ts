import { describe, expect, test } from 'vitest'

import { celo, localhost } from '../../chains/index.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { custom } from '../../clients/transports/custom.js'
import type { Hex } from '../../types/misc.js'
import { defineChain } from '../../utils/chain/defineChain.js'
import { sendTransaction } from './sendTransaction.js'
import { sendTransactionSync } from './sendTransactionSync.js'

const sourceAddress = '0x0000000000000000000000000000000000000001'
const targetAddress = '0x0000000000000000000000000000000000000002'
const feeCurrency = '0x0000000000000000000000000000000000000003'
const transactionHash =
  '0x0000000000000000000000000000000000000000000000000000000000000004'

const chain = defineChain({
  ...localhost,
  id: 1,
  formatters: {
    transactionRequest: celo.formatters.transactionRequest,
  },
  serializers: undefined,
})

function receipt() {
  return {
    blockHash:
      '0x0000000000000000000000000000000000000000000000000000000000000005',
    blockNumber: '0x1',
    contractAddress: null,
    cumulativeGasUsed: '0x5208',
    effectiveGasPrice: '0x1',
    from: sourceAddress,
    gasUsed: '0x5208',
    logs: [],
    logsBloom: `0x${'0'.repeat(512)}` as Hex,
    status: '0x1',
    to: targetAddress,
    transactionHash,
    transactionIndex: '0x0',
    type: '0x2',
  }
}

describe('sendTransaction request preparation', () => {
  test('formats JSON-RPC request with action-level chain formatter', async () => {
    const requests: { method: string; params: unknown }[] = []
    const client = createWalletClient({
      transport: custom({
        async request({ method, params }) {
          requests.push({ method, params })
          if (method === 'eth_chainId') return '0x1'
          if (method === 'eth_sendTransaction') return transactionHash
          return null
        },
      }),
    })

    await sendTransaction(client, {
      account: sourceAddress,
      chain,
      feeCurrency,
      to: targetAddress,
      value: 1n,
    })

    expect(requests.map(({ method }) => method)).toEqual([
      'eth_chainId',
      'eth_sendTransaction',
    ])
    expect(requests[1]!.params).toEqual([
      {
        feeCurrency,
        from: sourceAddress,
        to: targetAddress,
        value: '0x1',
      },
    ])
  })

  test('uses client formatter and skips chain id assertion when chain is null', async () => {
    const requests: { method: string; params: unknown }[] = []
    const client = createWalletClient({
      chain,
      transport: custom({
        async request({ method, params }) {
          requests.push({ method, params })
          if (method === 'eth_sendTransaction') return transactionHash
          return null
        },
      }),
    })

    await sendTransaction(client, {
      account: sourceAddress,
      chain: null,
      feeCurrency,
      to: targetAddress,
      value: 1n,
    })

    expect(requests.map(({ method }) => method)).toEqual([
      'eth_sendTransaction',
    ])
    expect(requests[0]!.params).toEqual([
      {
        feeCurrency,
        from: sourceAddress,
        to: targetAddress,
        value: '0x1',
      },
    ])
  })
})

describe('sendTransactionSync request preparation', () => {
  test('formats JSON-RPC request with action-level chain formatter', async () => {
    const requests: { method: string; params: unknown }[] = []
    const client = createWalletClient({
      transport: custom({
        async request({ method, params }) {
          requests.push({ method, params })
          if (method === 'eth_chainId') return '0x1'
          if (method === 'eth_sendTransaction') return transactionHash
          if (method === 'eth_getTransactionReceipt') return receipt()
          return null
        },
      }),
    })

    const result = await sendTransactionSync(client, {
      account: sourceAddress,
      chain,
      feeCurrency,
      pollingInterval: 1,
      to: targetAddress,
      value: 1n,
    })

    expect(result.transactionHash).toBe(transactionHash)
    expect(requests.map(({ method }) => method)).toEqual([
      'eth_chainId',
      'eth_sendTransaction',
      'eth_getTransactionReceipt',
    ])
    expect(requests[1]!.params).toEqual([
      {
        feeCurrency,
        from: sourceAddress,
        to: targetAddress,
        value: '0x1',
      },
    ])
  })

  test('uses client formatter and skips chain id assertion when chain is null', async () => {
    const requests: { method: string; params: unknown }[] = []
    const client = createWalletClient({
      chain,
      transport: custom({
        async request({ method, params }) {
          requests.push({ method, params })
          if (method === 'eth_sendTransaction') return transactionHash
          if (method === 'eth_getTransactionReceipt') return receipt()
          return null
        },
      }),
    })

    const result = await sendTransactionSync(client, {
      account: sourceAddress,
      chain: null,
      feeCurrency,
      pollingInterval: 1,
      to: targetAddress,
      value: 1n,
    })

    expect(result.transactionHash).toBe(transactionHash)
    expect(requests.map(({ method }) => method)).toEqual([
      'eth_sendTransaction',
      'eth_getTransactionReceipt',
    ])
    expect(requests[0]!.params).toEqual([
      {
        feeCurrency,
        from: sourceAddress,
        to: targetAddress,
        value: '0x1',
      },
    ])
  })
})
