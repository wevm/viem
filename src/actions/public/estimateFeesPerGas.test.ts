import { type Chain, defineChain } from 'viem'
import { describe, expect, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { createRpcProxy } from '~test/utils.js'
import { hyperEvm, hyperliquidEvmTestnet, mainnet } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import { createTestClient } from '../../index.js'
import type { Block } from '../../types/block.js'
import { wait } from '../../utils/wait.js'
import {
  estimateFeesPerGas,
  internal_estimateFeesPerGas,
} from './estimateFeesPerGas.js'
import * as getBlock from './getBlock.js'
import { getGasPrice } from './getGasPrice.js'

const client = anvilMainnet.getClient()

test.each([hyperEvm, hyperliquidEvmTestnet])(
  'HyperEVM fee headroom: $name',
  async (chain) => {
    const client = createPublicClient({ chain, transport: http() })

    const fees = await internal_estimateFeesPerGas(client, {
      block: { baseFeePerGas: 1_000_000_000n } as Block,
      request: { maxPriorityFeePerGas: 7n },
    })

    expect(fees).toEqual({
      maxFeePerGas: 2_000_000_007n,
      maxPriorityFeePerGas: 7n,
    })
  },
)

test.each([hyperEvm, hyperliquidEvmTestnet])(
  'HyperEVM explicit fee cap: $name',
  async (chain) => {
    const client = createPublicClient({ chain, transport: http() })

    const fees = await internal_estimateFeesPerGas(client, {
      block: { baseFeePerGas: 1_000_000_000n } as Block,
      request: {
        maxFeePerGas: 1_500_000_000n,
        maxPriorityFeePerGas: 7n,
      },
    })

    expect(fees).toEqual({
      maxFeePerGas: 1_500_000_000n,
      maxPriorityFeePerGas: 7n,
    })
  },
)

test('default', async () => {
  const block = await getBlock.getBlock(client)
  const { maxFeePerGas, maxPriorityFeePerGas } =
    await estimateFeesPerGas(client)
  expect(maxFeePerGas).toBe(
    (block.baseFeePerGas! * 120n) / 100n + maxPriorityFeePerGas,
  )
  expect(maxPriorityFeePerGas).toBeDefined()
})

test('legacy', async () => {
  const [{ gasPrice }, gasPrice_] = await Promise.all([
    estimateFeesPerGas(client, { type: 'legacy' }),
    getGasPrice(client),
  ])
  expect(gasPrice).toBe((gasPrice_! * 120n) / 100n)
})

test('args: chain `estimateFeesPerGas` override (when null returned)', async () => {
  const client = createTestClient({
    transport: http(anvilMainnet.rpcUrl.http),
    mode: 'anvil',
  })

  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    client,
    {
      chain: {
        ...anvilMainnet.chain,
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
    transport: http(anvilMainnet.rpcUrl.http),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    client,
    {
      chain: {
        ...anvilMainnet.chain,
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
  const block = await getBlock.getBlock(client)

  const client_2 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  const feesPerGas_1 = await estimateFeesPerGas(client_2, {
    chain: {
      ...anvilMainnet.chain,
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
      ...anvilMainnet.chain,
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
      ...anvilMainnet.chain,
      fees: {
        baseFeeMultiplier: 2.01,
      },
    },
  })
  expect(feesPerGas_3.maxFeePerGas).toBe(
    (block.baseFeePerGas! * 201n) / 100n + feesPerGas_3.maxPriorityFeePerGas,
  )
  expect(feesPerGas_3.maxPriorityFeePerGas).toBeDefined()

  // `1.09 * 100` is `109.00000000000001` in floating point, so the multiplier
  // must be rounded (not ceiled) to recover the intended integer numerator.
  const feesPerGas_4 = await estimateFeesPerGas(client, {
    chain: {
      ...anvilMainnet.chain,
      fees: {
        baseFeeMultiplier: 1.09,
      },
    },
  })
  expect(feesPerGas_4.maxFeePerGas).toBe(
    (block.baseFeePerGas! * 109n) / 100n + feesPerGas_4.maxPriorityFeePerGas,
  )
  expect(feesPerGas_4.maxPriorityFeePerGas).toBeDefined()
})

test('args: chain `baseFeeMultiplier` override (sync fn)', async () => {
  const block = await getBlock.getBlock(client)

  const client_2 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    client_2,
    {
      chain: {
        ...anvilMainnet.chain,
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
  const block = await getBlock.getBlock(client)

  const client_2 = createPublicClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    client_2,
    {
      chain: {
        ...anvilMainnet.chain,
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
    transport: http(anvilMainnet.rpcUrl.http),
  })
  await expect(() =>
    estimateFeesPerGas(client, {
      chain: {
        ...anvilMainnet.chain,
        fees: {
          baseFeeMultiplier: 0.8,
        },
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseFeeScalarError: \`baseFeeMultiplier\` must be greater than 1.

    Version: viem@x.y.z]
  `)
})

test('client: chain `estimateFeesPerGas` override', async () => {
  const client = createPublicClient({
    chain: {
      ...anvilMainnet.chain,
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
  const block = await getBlock.getBlock(client)

  const client_2 = createPublicClient({
    chain: {
      ...anvilMainnet.chain,
      fees: {
        baseFeeMultiplier: 1.5,
      },
    },
    transport: http(),
  })
  const { maxFeePerGas, maxPriorityFeePerGas } =
    await estimateFeesPerGas(client_2)
  expect(maxFeePerGas).toBe(
    (block.baseFeePerGas! * 150n) / 100n + maxPriorityFeePerGas,
  )
  expect(maxPriorityFeePerGas).toBeDefined()
})

describe('behavior: chain fee hooks receive the latest block', () => {
  async function createUrl() {
    return createRpcProxy(anvilMainnet.rpcUrl.http, ({ method }) => {
      if (method === 'eth_getBlockByNumber')
        return {
          result: {
            baseFeePerGas: '0x64',
            number: '0x2a',
            timestamp: '0x1',
            transactions: [],
          },
        }
      if (method === 'eth_maxPriorityFeePerGas') return { result: '0x1' }
      return undefined
    })
  }

  test('estimateFeesPerGas', async () => {
    const url = await createUrl()
    const client = createPublicClient({
      chain: defineChain({
        ...anvilMainnet.chain,
        fees: {
          async estimateFeesPerGas({ block }) {
            return { maxFeePerGas: block.number!, maxPriorityFeePerGas: 0n }
          },
        },
      }),
      transport: http(url),
    })

    const fees = await estimateFeesPerGas(client)

    expect(fees).toMatchInlineSnapshot(`
      {
        "maxFeePerGas": 42n,
        "maxPriorityFeePerGas": 0n,
      }
    `)
  })

  test('baseFeeMultiplier', async () => {
    const url = await createUrl()
    const client = createPublicClient({
      chain: defineChain({
        ...anvilMainnet.chain,
        fees: {
          baseFeeMultiplier: ({ block }) => (block.number === 42n ? 2 : 1),
        },
      }),
      transport: http(url),
    })

    const fees = await estimateFeesPerGas(client)

    expect(fees).toMatchInlineSnapshot(`
      {
        "maxFeePerGas": 201n,
        "maxPriorityFeePerGas": 1n,
      }
    `)
  })
})

test('chain does not support eip1559', async () => {
  vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
    baseFeePerGas: undefined,
  } as any)

  await expect(() =>
    estimateFeesPerGas(client),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Eip1559FeesNotSupportedError: Chain does not support EIP-1559 fees.

    Version: viem@x.y.z]
  `)
})

describe('concurrency', () => {
  // Records, for each request, the requests that were pending when it was sent.
  function createRecordingClient(chain: Chain = anvilMainnet.chain) {
    const pending = new Map<number, string>()
    const requests: Record<string, string[]> = {}
    const recordingClient = createPublicClient({
      chain,
      transport: http(anvilMainnet.rpcUrl.http, {
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

  test('behavior: fetches block and priority fee concurrently', async () => {
    const { client, requests } = createRecordingClient()

    await estimateFeesPerGas(client)

    expect(requests).toMatchInlineSnapshot(`
      {
        "eth_getBlockByNumber": [],
        "eth_maxPriorityFeePerGas": [
          "eth_getBlockByNumber",
        ],
      }
    `)
  })

  test('behavior: skips the block for legacy fees', async () => {
    const { client, requests } = createRecordingClient()

    await estimateFeesPerGas(client, { type: 'legacy' })

    expect(requests).toMatchInlineSnapshot(`
      {
        "eth_gasPrice": [],
      }
    `)
  })

  test('behavior: fetches block and priority fee in sequence with chain fee hooks', async () => {
    const chain = defineChain({
      ...anvilMainnet.chain,
      fees: { baseFeeMultiplier: () => 1.2 },
    })
    const eip1559 = createRecordingClient(chain)
    const legacy = createRecordingClient(chain)

    await estimateFeesPerGas(eip1559.client)
    await estimateFeesPerGas(legacy.client, { type: 'legacy' })

    expect({
      eip1559: eip1559.requests,
      legacy: legacy.requests,
    }).toMatchInlineSnapshot(`
      {
        "eip1559": {
          "eth_getBlockByNumber": [],
          "eth_maxPriorityFeePerGas": [],
        },
        "legacy": {
          "eth_gasPrice": [],
          "eth_getBlockByNumber": [],
        },
      }
    `)
  })

  test('behavior: stops estimating the priority fee once the network lacks EIP-1559 fees', async () => {
    const methods: string[] = []
    const url = await createRpcProxy(
      anvilMainnet.rpcUrl.http,
      async ({ method }) => {
        methods.push(method)
        // A legacy network's block has no base fee. It arrives late, so the
        // requests made alongside it are recorded with its call.
        if (method === 'eth_getBlockByNumber') {
          await wait(50)
          return {
            result: { number: '0x1', timestamp: '0x1', transactions: [] },
          }
        }
        return undefined
      },
    )
    const client = createPublicClient({
      chain: anvilMainnet.chain,
      transport: http(url),
    })

    await expect(estimateFeesPerGas(client)).rejects.toThrowError(
      'Chain does not support EIP-1559 fees.',
    )
    const first = methods.splice(0).sort()
    await expect(estimateFeesPerGas(client)).rejects.toThrowError(
      'Chain does not support EIP-1559 fees.',
    )

    expect({ first, second: methods }).toMatchInlineSnapshot(`
      {
        "first": [
          "eth_getBlockByNumber",
          "eth_maxPriorityFeePerGas",
        ],
        "second": [
          "eth_getBlockByNumber",
        ],
      }
    `)
  })

  test('behavior: block error takes precedence over priority fee error', async () => {
    const url = await createRpcProxy(
      anvilMainnet.rpcUrl.http,
      async ({ method }) => {
        if (method === 'eth_getBlockByNumber') {
          await wait(100)
          return { error: { code: -32000, message: 'block unavailable' } }
        }
        if (method === 'eth_maxPriorityFeePerGas')
          return { error: { code: -32000, message: 'fee unavailable' } }
        if (method === 'eth_gasPrice')
          return { error: { code: -32000, message: 'gas price unavailable' } }
        return undefined
      },
    )
    const client = createPublicClient({
      chain: anvilMainnet.chain,
      transport: http(url, { retryCount: 0 }),
    })

    const error = await estimateFeesPerGas(client).catch((error) => error)

    expect(error.details).toMatchInlineSnapshot(`"block unavailable"`)
  })
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
    const { maxFeePerGas } = await internal_estimateFeesPerGas(client, {
      block: { baseFeePerGas } as any,
      request: { maxPriorityFeePerGas } as any,
    })
    expect(maxFeePerGas).toBe(
      (baseFeePerGas * 120n) / 100n + maxPriorityFeePerGas,
    )
  })

  test('maxFeePerGas request args', async () => {
    const maxFeePerGas_ = 69n
    const { maxFeePerGas } = await internal_estimateFeesPerGas(client, {
      request: { maxFeePerGas: maxFeePerGas_ } as any,
    })
    expect(maxFeePerGas).toBe(maxFeePerGas_)
  })

  test('gasPrice request args', async () => {
    const gasPrice_ = 69n
    const { gasPrice } = await internal_estimateFeesPerGas(client, {
      request: { gasPrice: gasPrice_ } as any,
      type: 'legacy',
    })
    expect(gasPrice).toBe(gasPrice_)
  })
})
