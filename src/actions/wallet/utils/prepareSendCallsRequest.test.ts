import { describe, expect, test } from 'vitest'

import { mainnet } from '../../../chains/index.js'
import { createWalletClient } from '../../../clients/createWalletClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { prepareSendCallsRequest } from './prepareSendCallsRequest.js'

const sourceAddress = '0x0000000000000000000000000000000000000001'
const targetAddress = '0x0000000000000000000000000000000000000002'

describe('prepareSendCallsRequest', () => {
  test('builds wallet_sendCalls request', () => {
    const client = createWalletClient({
      transport: custom({
        async request() {
          return null
        },
      }),
    })

    const { account, request } = prepareSendCallsRequest(client, {
      account: sourceAddress,
      calls: [
        {
          data: '0x1234',
          dataSuffix: '0xabcd',
          to: targetAddress,
          value: 1n,
        },
      ],
      chain: mainnet,
      forceAtomic: true,
      id: '0x1',
      version: '2.0.0',
    })

    expect(account?.address).toBe(sourceAddress)
    expect(request).toEqual({
      atomicRequired: true,
      calls: [
        {
          data: '0x1234abcd',
          to: targetAddress,
          value: '0x1',
        },
      ],
      capabilities: undefined,
      chainId: '0x1',
      from: sourceAddress,
      id: '0x1',
      version: '2.0.0',
    })
  })

  test('applies client dataSuffix as optional capability', () => {
    const client = createWalletClient({
      dataSuffix: '0x1234',
      transport: custom({
        async request() {
          return null
        },
      }),
    })

    const { request } = prepareSendCallsRequest(client, {
      account: sourceAddress,
      calls: [{ to: targetAddress }],
      chain: mainnet,
    })

    expect(request.capabilities).toEqual({
      dataSuffix: {
        optional: true,
        value: '0x1234',
      },
    })
  })

  test('requires a chain before sending an RPC request', () => {
    let requested = false
    const client = createWalletClient({
      transport: custom({
        async request() {
          requested = true
          return null
        },
      }),
    })

    expect(() =>
      prepareSendCallsRequest(client, {
        account: sourceAddress,
        calls: [{ to: targetAddress }],
      } as never),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ChainNotFoundError: No chain was provided to the request.
      Please provide a chain with the \`chain\` argument on the Action, or by supplying a \`chain\` to WalletClient.

      Version: viem@x.y.z]
    `)
    expect(requested).toBe(false)
  })
})
