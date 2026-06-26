import { describe, expect, test } from 'vitest'

import { celo, localhost } from '../../../chains/index.js'
import { createWalletClient } from '../../../clients/createWalletClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { defineChain } from '../../../utils/chain/defineChain.js'
import { prepareSendTransactionRequest } from './prepareSendTransactionRequest.js'

const sourceAddress = '0x0000000000000000000000000000000000000001'
const targetAddress = '0x0000000000000000000000000000000000000002'
const feeCurrency = '0x0000000000000000000000000000000000000003'

const chain = defineChain({
  ...localhost,
  id: 1,
  formatters: {
    transactionRequest: celo.formatters.transactionRequest,
  },
  serializers: undefined,
})

describe('prepareSendTransactionRequest', () => {
  test('formats request with action-level chain formatter', async () => {
    const requests: { method: string; params: unknown }[] = []
    const client = createWalletClient({
      transport: custom({
        async request({ method, params }) {
          requests.push({ method, params })
          if (method === 'eth_chainId') return '0x1'
          return null
        },
      }),
    })

    const { account, request } = await prepareSendTransactionRequest(
      client,
      {
        account: sourceAddress,
        chain,
        feeCurrency,
        to: targetAddress,
        value: 1n,
      },
      { docsPath: '/docs/actions/wallet/sendTransaction' },
    )

    expect(account?.address).toBe(sourceAddress)
    expect(requests.map(({ method }) => method)).toEqual(['eth_chainId'])
    expect(request).toEqual({
      feeCurrency,
      from: sourceAddress,
      to: targetAddress,
      value: '0x1',
    })
  })

  test('allows chain mismatch when assertChainId is false', async () => {
    const client = createWalletClient({
      transport: custom({
        async request({ method }) {
          if (method === 'eth_chainId') return '0x2'
          return null
        },
      }),
    })

    const { request } = await prepareSendTransactionRequest(
      client,
      {
        account: sourceAddress,
        assertChainId: false,
        chain,
        feeCurrency,
        to: targetAddress,
        value: 1n,
      },
      { docsPath: '/docs/actions/wallet/sendTransaction' },
    )

    expect(request).toEqual({
      feeCurrency,
      from: sourceAddress,
      to: targetAddress,
      value: '0x1',
    })
  })

  test('uses client formatter and skips chain id request when chain is null', async () => {
    const requests: { method: string; params: unknown }[] = []
    const client = createWalletClient({
      chain,
      transport: custom({
        async request({ method, params }) {
          requests.push({ method, params })
          return null
        },
      }),
    })

    const { request } = await prepareSendTransactionRequest(
      client,
      {
        account: sourceAddress,
        chain: null,
        feeCurrency,
        to: targetAddress,
        value: 1n,
      },
      { docsPath: '/docs/actions/wallet/sendTransaction' },
    )

    expect(requests).toEqual([])
    expect(request).toEqual({
      feeCurrency,
      from: sourceAddress,
      to: targetAddress,
      value: '0x1',
    })
  })
})
