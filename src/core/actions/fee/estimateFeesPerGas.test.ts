import type { Block } from 'ox'
import { Actions, Client, http } from 'viem'
import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'

import { hyperEvm, hyperliquidEvmTestnet, mainnet } from 'viem/chains'

import {
  BaseFeeScalarError,
  internal_estimateFeesPerGas,
} from './estimateFeesPerGas.js'
import { wait } from '../../internal/wait.js'
import { Eip1559FeesNotSupportedError } from './estimateMaxPriorityFeePerGas.js'
const client = anvil.getClient(anvil.mainnet)

const chain = mainnet.extend({
  rpcUrls: { http: anvil.mainnet.rpcUrl.http },
})

test('default: eip1559', async () => {
  const { maxFeePerGas, maxPriorityFeePerGas } =
    await Actions.fee.estimateFeesPerGas(client)
  expect(maxFeePerGas).toBeTypeOf('bigint')
  expect(maxPriorityFeePerGas).toBeTypeOf('bigint')
})

test('type: legacy', async () => {
  const { gasPrice } = await Actions.fee.estimateFeesPerGas(client, {
    type: 'legacy',
  })
  expect(gasPrice).toBeTypeOf('bigint')
})

describe('chain `Actions.fee.estimateFeesPerGas` override', () => {
  test('returns value', async () => {
    expect(
      await Actions.fee.estimateFeesPerGas(client, {
        chain: {
          ...chain,
          fees: {
            estimateFeesPerGas: async () => ({
              maxFeePerGas: 1n,
              maxPriorityFeePerGas: 2n,
            }),
          },
        },
      }),
    ).toEqual({ maxFeePerGas: 1n, maxPriorityFeePerGas: 2n })
  })

  test('null falls back to default estimation', async () => {
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await Actions.fee.estimateFeesPerGas(client, {
        chain: {
          ...chain,
          fees: { estimateFeesPerGas: async () => null },
        },
      })
    expect(maxFeePerGas).toBeTypeOf('bigint')
    expect(maxPriorityFeePerGas).toBeTypeOf('bigint')
  })
})

describe('chain `baseFeeMultiplier` override', () => {
  test('value (integer)', async () => {
    const { maxFeePerGas } = await Actions.fee.estimateFeesPerGas(client, {
      chain: { ...chain, fees: { baseFeeMultiplier: 2 } },
    })
    expect(maxFeePerGas).toBeTypeOf('bigint')
  })

  test('value (decimal precision)', async () => {
    expect(
      await internal_estimateFeesPerGas(client, {
        block: { baseFeePerGas: 100n } as Block.Block,
        chain: { ...chain, fees: { baseFeeMultiplier: 1.09 } },
        request: { maxPriorityFeePerGas: 1n },
      }),
    ).toMatchInlineSnapshot(`
      {
        "maxFeePerGas": 110n,
        "maxPriorityFeePerGas": 1n,
      }
    `)
  })

  test('async fn', async () => {
    const { maxFeePerGas } = await Actions.fee.estimateFeesPerGas(client, {
      chain: { ...chain, fees: { baseFeeMultiplier: async () => 1.5 } },
    })
    expect(maxFeePerGas).toBeTypeOf('bigint')
  })

  test('fn receives request', async () => {
    let received: unknown
    await internal_estimateFeesPerGas(client, {
      chain: {
        ...chain,
        fees: {
          baseFeeMultiplier: ({ request }) => {
            received = request
            return 1.5
          },
        },
      },
      request: { maxFeePerGas: 2n },
    })
    expect(received).toMatchObject({ maxFeePerGas: 2n })
  })

  test('error: value below 1', async () => {
    await expect(() =>
      Actions.fee.estimateFeesPerGas(client, {
        chain: { ...chain, fees: { baseFeeMultiplier: 0.5 } },
      }),
    ).rejects.toThrowError(BaseFeeScalarError)
  })

  test('error: fn returns below 1', async () => {
    await expect(() =>
      Actions.fee.estimateFeesPerGas(client, {
        chain: { ...chain, fees: { baseFeeMultiplier: async () => 0.5 } },
      }),
    ).rejects.toThrowError(BaseFeeScalarError)
  })
})

describe('HyperEVM fee headroom', () => {
  test('default', async () => {
    const fees = await Promise.all(
      [hyperEvm, hyperliquidEvmTestnet].map((chain) =>
        internal_estimateFeesPerGas(client, {
          block: { baseFeePerGas: 1_000_000_000n } as Block.Block,
          chain,
          request: { maxPriorityFeePerGas: 7n },
        }),
      ),
    )

    expect(fees).toMatchInlineSnapshot(`
      [
        {
          "maxFeePerGas": 2000000007n,
          "maxPriorityFeePerGas": 7n,
        },
        {
          "maxFeePerGas": 2000000007n,
          "maxPriorityFeePerGas": 7n,
        },
      ]
    `)
  })

  test('behavior: explicit fee cap', async () => {
    const fees = await Promise.all(
      [hyperEvm, hyperliquidEvmTestnet].map((chain) =>
        internal_estimateFeesPerGas(client, {
          block: { baseFeePerGas: 1_000_000_000n } as Block.Block,
          chain,
          request: {
            maxFeePerGas: 1_500_000_000n,
            maxPriorityFeePerGas: 7n,
          },
        }),
      ),
    )

    expect(fees).toMatchInlineSnapshot(`
      [
        {
          "maxFeePerGas": 1500000000n,
          "maxPriorityFeePerGas": 7n,
        },
        {
          "maxFeePerGas": 1500000000n,
          "maxPriorityFeePerGas": 7n,
        },
      ]
    `)
  })
})

test('error: chain does not support EIP-1559 fees', async () => {
  await expect(() =>
    internal_estimateFeesPerGas(client, {
      block: { baseFeePerGas: undefined } as Block.Block,
    }),
  ).rejects.toThrowError(Eip1559FeesNotSupportedError)
})

describe('behavior: requests', () => {
  // Records, for each method, the methods that were pending when it was sent.
  function getRecordingClient() {
    const pending = new Map<number, string>()
    const requests: Record<string, string[]> = {}
    const recordingClient = Client.create({
      chain: mainnet,
      transport: http(anvil.mainnet.rpcUrl.http, {
        onFetchRequest(_, init) {
          const { id, method } = JSON.parse(init.body as string)
          requests[method] = [...pending.values()].sort()
          pending.set(id, method)
        },
        async onFetchResponse(response) {
          const { id } = await response.clone().json()
          pending.delete(id)
        },
      }),
    })
    return { client: recordingClient, requests }
  }

  test('fetches the block and priority fee concurrently', async () => {
    const { client: recordingClient, requests } = getRecordingClient()

    await Actions.fee.estimateFeesPerGas(recordingClient)

    expect(requests).toMatchInlineSnapshot(`
      {
        "eth_getBlockByNumber": [],
        "eth_maxPriorityFeePerGas": [
          "eth_getBlockByNumber",
        ],
      }
    `)
  })

  test('does not fetch the block for legacy fees', async () => {
    const { client: recordingClient, requests } = getRecordingClient()

    await Actions.fee.estimateFeesPerGas(recordingClient, { type: 'legacy' })

    expect(requests).toMatchInlineSnapshot(`
      {
        "eth_gasPrice": [],
      }
    `)
  })

  test('block error takes precedence over the priority fee error', async () => {
    const url = await Http.createRpcProxy(
      anvil.mainnet.rpcUrl.http,
      async ({ method }) => {
        if (method === 'eth_getBlockByNumber') {
          await wait(100)
          return { error: { code: -32000, message: 'block unavailable' } }
        }
        if (method === 'eth_maxPriorityFeePerGas' || method === 'eth_gasPrice')
          return { error: { code: -32000, message: 'fee unavailable' } }
        return undefined
      },
    )
    const proxyClient = Client.create({
      chain: mainnet,
      transport: http(url, { retryCount: 0 }),
    })

    await expect(
      Actions.fee.estimateFeesPerGas(proxyClient),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: block unavailable]`,
    )
  })
})
