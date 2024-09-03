import { describe, expect, test, vi } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { mainnet } from '../../chains/index.js'

import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import { MethodNotSupportedRpcError } from '../../errors/rpc.js'
import { buildRequest } from '../../utils/buildRequest.js'
import {
  estimateMaxPriorityFeePerGas,
  internal_estimateMaxPriorityFeePerGas,
} from './estimateMaxPriorityFeePerGas.js'
import * as getBlock from './getBlock.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  expect(await estimateMaxPriorityFeePerGas(client)).toBeDefined()
})

test('fallback', async () => {
  const client_1 = client
  client_1.request = buildRequest(({ method, params }) => {
    if (method === 'eth_maxPriorityFeePerGas')
      throw new MethodNotSupportedRpcError(new Error('unsupported'))

    return client.transport.request({ method, params })
  })

  expect(await estimateMaxPriorityFeePerGas(client_1)).toBeDefined()
})

test('args: chain `priorityFee` override', async () => {
  // value
  const client_1 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  expect(
    await estimateMaxPriorityFeePerGas(client_1, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          maxPriorityFeePerGas: 69420n,
        },
      },
    }),
  ).toBe(69420n)

  // sync fn
  const client_2 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  expect(
    await estimateMaxPriorityFeePerGas(client_2, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          maxPriorityFeePerGas: () => 69420n,
        },
      },
    }),
  ).toBe(69420n)

  // async fn
  const client_3 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  expect(
    await estimateMaxPriorityFeePerGas(client_3, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          maxPriorityFeePerGas: async () => 69420n,
        },
      },
    }),
  ).toBe(69420n)

  // zero base fee
  const client_4 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  expect(
    await estimateMaxPriorityFeePerGas(client_4, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          maxPriorityFeePerGas: 0n,
        },
      },
    }),
  ).toBe(0n)

  // async zero base fee
  const client_5 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  expect(
    await estimateMaxPriorityFeePerGas(client_5, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          maxPriorityFeePerGas: async () => 0n,
        },
      },
    }),
  ).toBe(0n)

  // fallback
  const client_6 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  expect(
    await estimateMaxPriorityFeePerGas(client_6, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          maxPriorityFeePerGas: async () => null,
        },
      },
    }),
  ).toBeDefined()

  // deprecated `defaultPriorityFee`
  const client_7 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  expect(
    await estimateMaxPriorityFeePerGas(client_7, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: async () => 69420n,
        },
      },
    }),
  ).toBe(69420n)
})

test('client: chain `priorityFee` override', async () => {
  // value
  const client_1 = createPublicClient({
    chain: {
      ...anvilMainnet.chain,
      fees: {
        maxPriorityFeePerGas: 69420n,
      },
    },
    transport: http(),
  })
  expect(await estimateMaxPriorityFeePerGas(client_1)).toBe(69420n)

  // sync fn
  const client_2 = createPublicClient({
    chain: {
      ...anvilMainnet.chain,
      fees: {
        maxPriorityFeePerGas: () => 69420n,
      },
    },
    transport: http(),
  })
  expect(await estimateMaxPriorityFeePerGas(client_2)).toBe(69420n)

  // async fn
  const client_3 = createPublicClient({
    chain: {
      ...anvilMainnet.chain,
      fees: {
        maxPriorityFeePerGas: async () => 69420n,
      },
    },
    transport: http(),
  })
  expect(await estimateMaxPriorityFeePerGas(client_3)).toBe(69420n)

  // zero base fee
  const client_4 = createPublicClient({
    chain: {
      ...anvilMainnet.chain,
      fees: {
        maxPriorityFeePerGas: 0n,
      },
    },
    transport: http(),
  })
  expect(await estimateMaxPriorityFeePerGas(client_4)).toBe(0n)

  // async zero base fee
  const client_5 = createPublicClient({
    chain: {
      ...anvilMainnet.chain,
      fees: {
        maxPriorityFeePerGas: async () => 0n,
      },
    },
    transport: http(),
  })
  expect(await estimateMaxPriorityFeePerGas(client_5)).toBe(0n)
})

test('chain does not support eip1559', async () => {
  vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
    baseFeePerGas: undefined,
  } as any)

  await expect(() =>
    estimateMaxPriorityFeePerGas(client),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Eip1559FeesNotSupportedError: Chain does not support EIP-1559 fees.

    Version: viem@x.y.z]
  `)
})

test('maxPriorityFeePerGas < 0', async () => {
  vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
    baseFeePerGas: 999999999999999999999n,
  } as any)

  expect(await estimateMaxPriorityFeePerGas(client)).toBe(0n)
})

describe('mainnet smoke', () => {
  test('default', async () => {
    const mainnetClient = createPublicClient({
      chain: mainnet,
      transport: http(process.env.VITE_ANVIL_FORK_URL),
    })
    expect(await estimateMaxPriorityFeePerGas(mainnetClient)).toBeDefined()
  })

  test.skip('fallback', async () => {
    const mainnetClient = createPublicClient({
      chain: mainnet,
      // cloudflare doesn't support eth_maxPriorityFeePerGas
      transport: http('https://cloudflare-eth.com'),
    })
    expect(await estimateMaxPriorityFeePerGas(mainnetClient)).toBeDefined()
  })
})

describe('internal_estimateMaxPriorityFeePerGas', () => {
  test('args: block', async () => {
    const block = await getBlock.getBlock(client)
    const maxPriorityFeePerGas = await internal_estimateMaxPriorityFeePerGas(
      client,
      {
        block,
      },
    )
    expect(maxPriorityFeePerGas).toBeDefined()
  })
})
