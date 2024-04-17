import { describe, expect, test, vi } from 'vitest'

import { anvilChain, publicClient } from '~test/src/utils.js'
import { mainnet } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'

import { localHttpUrl } from '~test/src/constants.js'
import { createTestClient } from '~viem/index.js'
import {
  estimateFeesPerGas,
  internal_estimateFeesPerGas,
} from './estimateFeesPerGas.js'
import * as getBlock from './getBlock.js'
import { getGasPrice } from './getGasPrice.js'

test('default', async () => {
  const block = await getBlock.getBlock(publicClient)
  const { maxFeePerGas, maxPriorityFeePerGas } =
    await estimateFeesPerGas(publicClient)
  expect(maxFeePerGas).toBe(
    (block.baseFeePerGas! * 120n) / 100n + maxPriorityFeePerGas,
  )
  expect(maxPriorityFeePerGas).toBeDefined()
})

test('legacy', async () => {
  const [{ gasPrice }, gasPrice_] = await Promise.all([
    estimateFeesPerGas(publicClient, { type: 'legacy' }),
    getGasPrice(publicClient),
  ])
  expect(gasPrice).toBe((gasPrice_! * 120n) / 100n)
})

test('args: chain `estimateFeesPerGas` override (when null returned)', async () => {
  const client = createTestClient({
    transport: http(localHttpUrl),
    mode: 'anvil',
  })

  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    client,
    {
      chain: {
        ...anvilChain,
        fees: {
          estimateFeesPerGas: async () => null,
        },
      },
    },
  )

  expect(maxFeePerGas).toBeTypeOf('bigint')
  expect(maxPriorityFeePerGas).toBeTypeOf('bigint')
})

test('args: chain `estimateFeesPerGas` override', async () => {
  const client = createPublicClient({
    transport: http(localHttpUrl),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    client,
    {
      chain: {
        ...anvilChain,
        fees: {
          async estimateFeesPerGas() {
            return { maxFeePerGas: 2n, maxPriorityFeePerGas: 1n }
          },
        },
      },
    },
  )
  expect(maxFeePerGas).toBe(2n)
  expect(maxPriorityFeePerGas).toBe(1n)
})

test('args: chain `baseFeeMultiplier` override (value)', async () => {
  const block = await getBlock.getBlock(publicClient)

  const client = createPublicClient({
    transport: http(localHttpUrl),
  })
  const feesPerGas_1 = await estimateFeesPerGas(client, {
    chain: {
      ...anvilChain,
      fees: {
        baseFeeMultiplier: 1.5,
      },
    },
  })
  expect(feesPerGas_1.maxFeePerGas).toBe(
    (block.baseFeePerGas! * 150n) / 100n + feesPerGas_1.maxPriorityFeePerGas,
  )
  expect(feesPerGas_1.maxPriorityFeePerGas).toBeDefined()

  const feesPerGas_2 = await estimateFeesPerGas(client, {
    chain: {
      ...anvilChain,
      fees: {
        baseFeeMultiplier: 2,
      },
    },
  })
  expect(feesPerGas_2.maxFeePerGas).toBe(
    block.baseFeePerGas! * 2n + feesPerGas_2.maxPriorityFeePerGas,
  )
  expect(feesPerGas_2.maxPriorityFeePerGas).toBeDefined()

  const feesPerGas_3 = await estimateFeesPerGas(client, {
    chain: {
      ...anvilChain,
      fees: {
        baseFeeMultiplier: 2.01,
      },
    },
  })
  expect(feesPerGas_3.maxFeePerGas).toBe(
    (block.baseFeePerGas! * 201n) / 100n + feesPerGas_3.maxPriorityFeePerGas,
  )
  expect(feesPerGas_3.maxPriorityFeePerGas).toBeDefined()
})

test('args: chain `baseFeeMultiplier` override (sync fn)', async () => {
  const block = await getBlock.getBlock(publicClient)

  const client = createPublicClient({
    transport: http(localHttpUrl),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    client,
    {
      chain: {
        ...anvilChain,
        fees: {
          baseFeeMultiplier() {
            return 1.5
          },
        },
      },
    },
  )
  expect(maxFeePerGas).toBe(
    (block.baseFeePerGas! * 150n) / 100n + maxPriorityFeePerGas,
  )
  expect(maxPriorityFeePerGas).toBeDefined()
})

test('args: chain `baseFeeMultiplier` override (async fn)', async () => {
  const block = await getBlock.getBlock(publicClient)

  const client = createPublicClient({
    transport: http(localHttpUrl),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    client,
    {
      chain: {
        ...anvilChain,
        fees: {
          async baseFeeMultiplier() {
            return 1.5
          },
        },
      },
    },
  )
  expect(maxFeePerGas).toBe(
    (block.baseFeePerGas! * 150n) / 100n + maxPriorityFeePerGas,
  )
  expect(maxPriorityFeePerGas).toBeDefined()
})

test('args: chain `baseFeeMultiplier` override < 1', async () => {
  const client = createPublicClient({
    transport: http(localHttpUrl),
  })
  await expect(() =>
    estimateFeesPerGas(client, {
      chain: {
        ...anvilChain,
        fees: {
          baseFeeMultiplier: 0.8,
        },
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseFeeScalarError: \`baseFeeMultiplier\` must be greater than 1.

    Version: viem@1.0.2]
  `)
})

test('client: chain `estimateFeesPerGas` override', async () => {
  const client = createPublicClient({
    chain: {
      ...anvilChain,
      fees: {
        async estimateFeesPerGas() {
          return { maxFeePerGas: 2n, maxPriorityFeePerGas: 1n }
        },
      },
    },
    transport: http(),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } =
    await estimateFeesPerGas(client)
  expect(maxFeePerGas).toBe(2n)
  expect(maxPriorityFeePerGas).toBe(1n)
})

test('client: chain `baseFeeMultiplier` override', async () => {
  const block = await getBlock.getBlock(publicClient)

  const client = createPublicClient({
    chain: {
      ...anvilChain,
      fees: {
        baseFeeMultiplier: 1.5,
      },
    },
    transport: http(),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } =
    await estimateFeesPerGas(client)
  expect(maxFeePerGas).toBe(
    (block.baseFeePerGas! * 150n) / 100n + maxPriorityFeePerGas,
  )
  expect(maxPriorityFeePerGas).toBeDefined()
})

test('chain does not support eip1559', async () => {
  vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
    baseFeePerGas: undefined,
  } as any)

  await expect(() =>
    estimateFeesPerGas(publicClient),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Eip1559FeesNotSupportedError: Chain does not support EIP-1559 fees.

    Version: viem@1.0.2]
  `)
})

describe('mainnet smoke', () => {
  const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: http(process.env.VITE_ANVIL_FORK_URL),
  })

  test('default', async () => {
    const block = await getBlock.getBlock(mainnetClient)
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await estimateFeesPerGas(mainnetClient)
    expect(maxFeePerGas).toBe(
      (block.baseFeePerGas! * 120n) / 100n + maxPriorityFeePerGas,
    )
  })
})

describe('internal_estimateFeesPerGas', () => {
  test('maxPriorityFeePerGas request/block args', async () => {
    const baseFeePerGas = 420n
    const maxPriorityFeePerGas = 69n
    const { maxFeePerGas } = await internal_estimateFeesPerGas(publicClient, {
      block: { baseFeePerGas } as any,
      request: { maxPriorityFeePerGas } as any,
    })
    expect(maxFeePerGas).toBe(
      (baseFeePerGas * 120n) / 100n + maxPriorityFeePerGas,
    )
  })

  test('maxFeePerGas request args', async () => {
    const maxFeePerGas_ = 69n
    const { maxFeePerGas } = await internal_estimateFeesPerGas(publicClient, {
      request: { maxFeePerGas: maxFeePerGas_ } as any,
    })
    expect(maxFeePerGas).toBe(maxFeePerGas_)
  })

  test('gasPrice request args', async () => {
    const gasPrice_ = 69n
    const { gasPrice } = await internal_estimateFeesPerGas(publicClient, {
      request: { gasPrice: gasPrice_ } as any,
      type: 'legacy',
    })
    expect(gasPrice).toBe(gasPrice_)
  })
})
