import { describe, expect, test, vi } from 'vitest'

import { publicClient } from '~test/src/utils.js'
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

test('default', async () => {
  expect(await estimateMaxPriorityFeePerGas(publicClient)).toBeDefined()
})

test('fallback', async () => {
  const client = publicClient
  client.request = buildRequest(({ method, params }) => {
    if (method === 'eth_maxPriorityFeePerGas')
      throw new MethodNotSupportedRpcError(new Error('unsupported'))

    return client.transport.request({ method, params })
  })

  expect(await estimateMaxPriorityFeePerGas(client)).toBeDefined()
})

test('args: chain `defaultPriorityFee` override', async () => {
  // value
  const client_1 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  expect(
    await estimateMaxPriorityFeePerGas(client_1, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: 69420n,
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
          defaultPriorityFee: () => 69420n,
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
          defaultPriorityFee: async () => 69420n,
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
          defaultPriorityFee: 0n,
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
          defaultPriorityFee: async () => 0n,
        },
      },
    }),
  ).toBe(0n)
})

test('client: chain `defaultPriorityFee` override', async () => {
  // value
  const client_1 = createPublicClient({
    chain: {
      ...anvilMainnet.chain,
      fees: {
        defaultPriorityFee: 69420n,
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
        defaultPriorityFee: () => 69420n,
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
        defaultPriorityFee: async () => 69420n,
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
        defaultPriorityFee: 0n,
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
        defaultPriorityFee: async () => 0n,
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
    estimateMaxPriorityFeePerGas(publicClient),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Eip1559FeesNotSupportedError: Chain does not support EIP-1559 fees.

    Version: viem@1.0.2]
  `)
})

test('maxPriorityFeePerGas < 0', async () => {
  vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
    baseFeePerGas: 999999999999999999999n,
  } as any)

  expect(await estimateMaxPriorityFeePerGas(publicClient)).toBe(0n)
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
    const block = await getBlock.getBlock(publicClient)
    const maxPriorityFeePerGas = await internal_estimateMaxPriorityFeePerGas(
      publicClient,
      {
        block,
      },
    )
    expect(maxPriorityFeePerGas).toBeDefined()
  })
})
