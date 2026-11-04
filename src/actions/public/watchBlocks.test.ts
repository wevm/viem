import { Instance, Pool } from 'prool'
import { describe, expect, onTestFinished, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { createRpcProxy } from '~test/utils.js'
import { foundry, localhost } from '../../chains/index.js'
import { type Client, createClient } from '../../clients/createClient.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { createTestClient } from '../../clients/createTestClient.js'
import { fallback } from '../../clients/transports/fallback.js'
import { http } from '../../clients/transports/http.js'
import { webSocket } from '../../clients/transports/webSocket.js'
import type { Block } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import * as getBlock from './getBlock.js'
import { type OnBlockParameter, watchBlocks } from './watchBlocks.js'

const client = anvilMainnet.getClient()
const httpClient = createClient({
  ...anvilMainnet.clientConfig,
  transport: http(),
})
const webSocketClient = createClient({
  ...anvilMainnet.clientConfig,
  transport: webSocket(),
})

describe('poll', () => {
  test('watches for new blocks', async () => {
    const blocks: OnBlockParameter[] = []
    const prevBlocks: OnBlockParameter[] = []
    const unwatch = watchBlocks(client, {
      onBlock: (block, prevBlock) => {
        blocks.push(block)
        prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
      },
      poll: true,
      pollingInterval: 100,
    })
    onTestFinished(unwatch)
    await expect.poll(() => blocks.length).toBe(1)
    for (let i = 1; i <= 4; i++) {
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(i + 1)
    }
    unwatch()
    expect(blocks.length).toBe(5)
    expect(prevBlocks.length).toBe(4)
    expect(typeof blocks[0].number).toBe('bigint')
  })

  test('args: includeTransactions', async () => {
    const blocks: OnBlockParameter<Chain, true>[] = []
    const unwatch = watchBlocks(client, {
      onBlock: (block) => blocks.push(block),
      includeTransactions: true,
      poll: true,
    })

    await sendTransaction(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
    await mine(client, { blocks: 1 })
    await wait(200)

    unwatch()
    expect(
      typeof blocks[blocks.length - 1].transactions[0] === 'object',
    ).toBeTruthy()
  })

  describe('emitMissed', () => {
    test('emits on missed blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client, {
        emitMissed: true,
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      blocks.length = 0
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(1)
      await mine(client, { blocks: 5 })
      await expect.poll(() => blocks.length).toBe(6)
      unwatch()
      expect(blocks.length).toBe(6)
    })

    test('emits missed blocks in order across batches', async () => {
      const blocks: [OnBlockParameter, OnBlockParameter | undefined][] = []
      const unwatch = watchBlocks(client, {
        emitMissed: true,
        emitOnBegin: true,
        onBlock: (block, prevBlock) => blocks.push([block, prevBlock]),
        poll: true,
        pollingInterval: 4_000,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      const start = blocks[0]![0].number

      // Mine between two polls, so the next poll sees all the new blocks.
      await mine(client, { blocks: 12 })
      await expect.poll(() => blocks.length, { timeout: 10_000 }).toBe(13)

      expect(
        blocks
          .slice(1)
          .map(([block, prevBlock]) => [
            Number(block.number - start),
            Number(prevBlock!.number - start),
          ]),
      ).toEqual(Array.from({ length: 12 }, (_, i) => [i + 1, i]))
    })

    test('defaults to true when polling less than twice per block', async () => {
      const fastClient = createClient({
        ...anvilMainnet.clientConfig,
        chain: { ...anvilMainnet.chain, blockTime: 4_000 },
      })
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(fastClient, {
        emitOnBegin: true,
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 4_000,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      const start = blocks[0]!.number

      // Mine between two polls, so the next poll sees all the new blocks.
      await mine(client, { blocks: 5 })
      await expect.poll(() => blocks.length, { timeout: 10_000 }).toBe(6)

      expect(blocks.map((block) => Number(block.number - start))).toEqual([
        0, 1, 2, 3, 4, 5,
      ])
    })

    test('defaults to false when polling at least twice per block', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client, {
        emitOnBegin: true,
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 4_000,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      const start = blocks[0]!.number

      // Mine between two polls, so the next poll sees all the new blocks.
      await mine(client, { blocks: 5 })
      await expect
        .poll(() => blocks.at(-1)!.number, { timeout: 10_000 })
        .toBe(start + 5n)

      expect(blocks.length).toBeLessThan(6)
    })

    test('caps default catch-up without limiting explicit emitMissed', async () => {
      // Mining 102 blocks on the shared fork can exceed a minute, so mine
      // them on a fresh local node.
      const pool = Pool.define({ instance: Instance.anvil({ noMining: true }) })
      onTestFinished(() => pool.destroyAll())
      const node = await pool.start(1)
      let mining = Promise.resolve()
      const url = await createRpcProxy(node.url, async () => {
        await mining
        return undefined
      })
      const miningClient = createTestClient({
        chain: foundry,
        mode: 'anvil',
        transport: http(node.url, { retryCount: 0 }),
      })
      const fastClient = createClient({
        chain: { ...foundry, blockTime: 4_000 },
        transport: http(url),
      })
      const defaultBlocks: OnBlockParameter[] = []
      const blocks: OnBlockParameter[] = []
      const unwatchDefault = watchBlocks(fastClient, {
        emitOnBegin: true,
        onBlock: (block) => defaultBlocks.push(block),
        poll: true,
        pollingInterval: 4_000,
      })
      onTestFinished(unwatchDefault)
      const unwatch = watchBlocks(fastClient, {
        emitMissed: true,
        emitOnBegin: true,
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 4_000,
      })
      onTestFinished(unwatch)
      await expect
        .poll(() => [defaultBlocks.length, blocks.length])
        .toEqual([1, 1])
      const start = blocks[0]!.number

      // Hold RPC reads until the entire batch is mined, even if it spans a poll.
      // Mining is not retried: a timed-out request may already have mined blocks.
      mining = mine(miningClient, { blocks: 102 })
      await mining
      await expect.poll(() => blocks.length, { timeout: 10_000 }).toBe(103)
      await expect
        .poll(() => defaultBlocks.at(-1)!.number, { timeout: 10_000 })
        .toBe(start + 102n)

      expect(
        defaultBlocks.map((block) => Number(block.number - start)),
      ).toEqual([0, 102])
      expect(blocks.map((block) => Number(block.number - start))).toEqual(
        Array.from({ length: 103 }, (_, i) => i),
      )
    })

    test.each(['safe', 'finalized'] as const)(
      'defaults to false for the %s tag',
      async (blockTag) => {
        const fastClient = createClient({
          ...anvilMainnet.clientConfig,
          chain: { ...anvilMainnet.chain, blockTime: 4_000 },
        })
        const blocks: OnBlockParameter<Chain, false, typeof blockTag>[] = []
        const unwatch = watchBlocks(fastClient, {
          blockTag,
          emitOnBegin: true,
          onBlock: (block) => blocks.push(block),
          poll: true,
          pollingInterval: 4_000,
        })
        onTestFinished(unwatch)
        await expect.poll(() => blocks.length).toBe(1)
        const start = blocks[0]!.number

        // Mine between two polls, so the next poll sees all the new blocks.
        await mine(client, { blocks: 5 })
        await expect
          .poll(() => blocks.at(-1)!.number, { timeout: 10_000 })
          .toBe(start + 5n)

        expect(blocks.length).toBeLessThan(6)
      },
    )
  })

  describe('emitOnBegin', () => {
    test('watches for new blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client, {
        emitOnBegin: true,
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(5)
    })
  })

  describe('pollingInterval on client', () => {
    test('watches for new blocks', async () => {
      const client_2 = createPublicClient({
        chain: localhost,
        transport: http(anvilMainnet.rpcUrl.http),
        pollingInterval: 100,
      })
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client_2, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      blocks.length = 0
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(1)
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(2)
      unwatch()
      expect(blocks.length).toBe(2)
    })
  })

  describe('transports', () => {
    test('http transport', async () => {
      const blocks: OnBlockParameter[] = []
      const prevBlocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(httpClient, {
        onBlock: (block, prevBlock) => {
          blocks.push(block)
          prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
        },
        pollingInterval: 100,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      for (let i = 1; i <= 4; i++) {
        await mine(client, { blocks: 1 })
        await expect.poll(() => blocks.length).toBe(i + 1)
      }
      unwatch()
      expect(blocks.length).toBe(5)
      expect(prevBlocks.length).toBe(4)
    })

    test('fallback transport', async () => {
      const client_2 = createClient({
        chain: anvilMainnet.chain,
        transport: fallback([http(), webSocket()]),
        pollingInterval: 200,
      })

      const blocks: OnBlockParameter[] = []
      const prevBlocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client_2, {
        onBlock: (block, prevBlock) => {
          blocks.push(block)
          prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
        },
      })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBeGreaterThanOrEqual(5)
      expect(prevBlocks.length).toBeGreaterThanOrEqual(4)
      expect(typeof blocks[0].number).toBe('bigint')
    })
  })

  describe('behavior', () => {
    test('does not emit when no new incoming blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      blocks.length = 0
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(1)
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(2)
      await wait(300)
      unwatch()
      expect(blocks.length).toBe(2)
    })

    test('watch > unwatch > watch', async () => {
      let blocks: OnBlockParameter[] = []
      let unwatch = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      blocks.length = 0
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(1)
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(2)
      unwatch()
      expect(blocks.length).toBe(2)

      blocks = []
      unwatch = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch)
      await expect.poll(() => blocks.length).toBe(1)
      blocks.length = 0
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(1)
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(2)
      unwatch()
      expect(blocks.length).toBe(2)
    })

    test('multiple watchers', async () => {
      let blocks: OnBlockParameter[] = []

      let unwatch1 = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch1)
      let unwatch2 = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch2)
      let unwatch3 = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch3)
      await expect.poll(() => blocks.length).toBe(3)
      blocks.length = 0
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(3)
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(6)
      unwatch1()
      unwatch2()
      unwatch3()
      expect(blocks.length).toBe(6)

      blocks = []

      unwatch1 = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch1)
      unwatch2 = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch2)
      unwatch3 = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      onTestFinished(unwatch3)
      await expect.poll(() => blocks.length).toBe(3)
      blocks.length = 0
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(3)
      await mine(client, { blocks: 1 })
      await expect.poll(() => blocks.length).toBe(6)
      unwatch1()
      unwatch2()
      unwatch3()
      expect(blocks.length).toBe(6)
    })

    test('immediately unwatch', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      unwatch()
      await mine(client, { blocks: 1 })
      await wait(200)
      expect(blocks.length).toBe(0)
    })

    test('out of order blocks', async () => {
      vi.spyOn(getBlock, 'getBlock')
        .mockResolvedValueOnce({ number: 420n } as Block)
        .mockResolvedValueOnce({ number: 421n } as Block)
        .mockResolvedValueOnce({ number: 419n } as Block)
        .mockResolvedValueOnce({ number: 424n } as Block)
        .mockResolvedValueOnce({ number: 424n } as Block)
        .mockResolvedValueOnce({ number: 426n } as Block)
        .mockResolvedValueOnce({ number: 423n } as Block)
        .mockResolvedValueOnce({ number: 424n } as Block)
        .mockResolvedValueOnce({ number: 429n } as Block)
        .mockResolvedValueOnce({ number: 430n } as Block)

      const blocks: [OnBlockParameter, OnBlockParameter | undefined][] = []
      const unwatch = watchBlocks(client, {
        pollingInterval: 100,
        poll: true,
        onBlock: (block, prevBlock) => blocks.push([block, prevBlock]),
      })
      await wait(1000)
      unwatch()
      expect(blocks).toMatchInlineSnapshot(`
        [
          [
            {
              "number": 420n,
            },
            undefined,
          ],
          [
            {
              "number": 421n,
            },
            {
              "number": 420n,
            },
          ],
          [
            {
              "number": 424n,
            },
            {
              "number": 421n,
            },
          ],
          [
            {
              "number": 426n,
            },
            {
              "number": 424n,
            },
          ],
          [
            {
              "number": 429n,
            },
            {
              "number": 426n,
            },
          ],
        ]
      `)
    })

    test('out of order blocks (emitMissed)', async () => {
      vi.spyOn(getBlock, 'getBlock')
        .mockResolvedValueOnce({ number: 420n } as Block)
        .mockResolvedValueOnce({ number: 421n } as Block)
        .mockResolvedValueOnce({ number: 419n } as Block)
        .mockResolvedValueOnce({ number: 424n } as Block)
        .mockResolvedValueOnce({ number: 422n } as Block)
        .mockResolvedValueOnce({ number: 423n } as Block)
        .mockResolvedValueOnce({ number: 424n } as Block)
        .mockResolvedValueOnce({ number: 426n } as Block)
        .mockResolvedValueOnce({ number: 425n } as Block)
        .mockResolvedValueOnce({ number: 423n } as Block)
        .mockResolvedValueOnce({ number: 424n } as Block)
        .mockResolvedValueOnce({ number: 429n } as Block)
        .mockResolvedValueOnce({ number: 427n } as Block)
        .mockResolvedValueOnce({ number: 428n } as Block)
        .mockResolvedValueOnce({ number: 429n } as Block)

      const blocks: [OnBlockParameter, OnBlockParameter | undefined][] = []
      const unwatch = watchBlocks(client, {
        emitMissed: true,
        pollingInterval: 100,
        poll: true,
        onBlock: (block, prevBlock) => blocks.push([block, prevBlock]),
      })
      await wait(1000)
      unwatch()
      expect(blocks).toMatchInlineSnapshot(`
        [
          [
            {
              "number": 420n,
            },
            undefined,
          ],
          [
            {
              "number": 421n,
            },
            {
              "number": 420n,
            },
          ],
          [
            {
              "number": 422n,
            },
            {
              "number": 421n,
            },
          ],
          [
            {
              "number": 423n,
            },
            {
              "number": 422n,
            },
          ],
          [
            {
              "number": 424n,
            },
            {
              "number": 423n,
            },
          ],
          [
            {
              "number": 425n,
            },
            {
              "number": 424n,
            },
          ],
          [
            {
              "number": 426n,
            },
            {
              "number": 425n,
            },
          ],
          [
            {
              "number": 427n,
            },
            {
              "number": 426n,
            },
          ],
          [
            {
              "number": 428n,
            },
            {
              "number": 427n,
            },
          ],
          [
            {
              "number": 429n,
            },
            {
              "number": 428n,
            },
          ],
        ]
      `)
    })

    test('pending blocks (no number)', async () => {
      vi.spyOn(getBlock, 'getBlock')
        .mockResolvedValueOnce({ number: 420n } as Block)
        .mockResolvedValueOnce({ number: 424n } as Block)
        .mockResolvedValueOnce({ number: 428n } as Block)
        .mockResolvedValueOnce({ number: 431n } as Block)
        .mockResolvedValueOnce({ number: null } as Block)
        .mockResolvedValueOnce({ number: 433n } as Block)
        .mockResolvedValueOnce({ number: null } as Block)
        .mockResolvedValueOnce({ number: null } as Block)
        .mockResolvedValueOnce({ number: null } as Block)
        .mockResolvedValueOnce({ number: null } as Block)
        .mockResolvedValueOnce({ number: null } as Block)
        .mockResolvedValueOnce({ number: null } as Block)

      const blocks: [
        OnBlockParameter<Chain, boolean, 'pending'>,
        OnBlockParameter<Chain, boolean, 'pending'> | undefined,
      ][] = []
      const unwatch = watchBlocks(client, {
        pollingInterval: 100,
        poll: true,
        blockTag: 'pending',
        onBlock: (block, prevBlock) => blocks.push([block, prevBlock]),
      })
      await wait(1000)
      unwatch()
      expect(blocks).toMatchInlineSnapshot(`
        [
          [
            {
              "number": 420n,
            },
            undefined,
          ],
          [
            {
              "number": 424n,
            },
            {
              "number": 420n,
            },
          ],
          [
            {
              "number": 428n,
            },
            {
              "number": 424n,
            },
          ],
          [
            {
              "number": 431n,
            },
            {
              "number": 428n,
            },
          ],
          [
            {
              "number": null,
            },
            {
              "number": 431n,
            },
          ],
          [
            {
              "number": 433n,
            },
            {
              "number": null,
            },
          ],
          [
            {
              "number": null,
            },
            {
              "number": 433n,
            },
          ],
          [
            {
              "number": null,
            },
            {
              "number": null,
            },
          ],
          [
            {
              "number": null,
            },
            {
              "number": null,
            },
          ],
        ]
      `)
    })
  })

  describe('errors', () => {
    test('handles error thrown', async () => {
      vi.spyOn(getBlock, 'getBlock').mockRejectedValue(new Error('foo'))

      let unwatch: () => void = () => null
      const error = await new Promise((resolve) => {
        unwatch = watchBlocks(client, {
          onBlock: () => null,
          onError: resolve,
          poll: true,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: foo]')
      unwatch()

      vi.restoreAllMocks()
    })
  })
})

describe('subscribe', () => {
  test('watches for new blocks', async () => {
    const blocks: OnBlockParameter[] = []
    const prevBlocks: OnBlockParameter[] = []
    const unwatch = watchBlocks(webSocketClient, {
      onBlock: (block, prevBlock) => {
        blocks.push(block)
        prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
      },
    })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    unwatch()
    expect(blocks.length).toBe(5)
    expect(prevBlocks.length).toBe(4)
    expect(typeof blocks[0].number).toBe('bigint')
  })

  describe('emitOnBegin', () => {
    test('watches for new blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(webSocketClient, {
        emitOnBegin: true,
        onBlock: (block) => blocks.push(block),
      })
      await wait(800)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(5)
    })
  })

  describe('behavior', () => {
    test('does not emit when no new incoming blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(1)
    })

    test('watch > unwatch > watch', async () => {
      let blocks: OnBlockParameter[] = []
      let unwatch = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(3)

      blocks = []
      unwatch = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(3)
    })

    test('multiple watchers', async () => {
      let blocks: OnBlockParameter[] = []

      const unwatch1 = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      const unwatch2 = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      const unwatch3 = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      await wait(500)
      await mine(client, { blocks: 1 })
      await wait(500)
      await mine(client, { blocks: 1 })
      await wait(500)
      await mine(client, { blocks: 1 })
      await wait(500)
      unwatch1()
      unwatch2()
      unwatch3()
      expect(blocks.length).toBe(9)

      await mine(client, { blocks: 1 })
      await wait(500)
      expect(blocks.length).toBe(9)

      blocks = []

      const unwatch4 = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      const unwatch5 = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      const unwatch6 = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      await mine(client, { blocks: 1 })
      await wait(200)
      unwatch4()
      unwatch5()
      unwatch6()
      expect(blocks.length).toBe(9)
    })

    test('immediately unwatch', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      unwatch()
      await mine(client, { blocks: 1 })
      await wait(1000)
      expect(blocks.length).toBe(0)
    })
  })

  test('fallback transport', async () => {
    const client_2 = createClient({
      chain: anvilMainnet.chain,
      transport: fallback([webSocket(), http()]),
      pollingInterval: 200,
    })

    const blocks: OnBlockParameter[] = []
    const prevBlocks: OnBlockParameter[] = []
    const unwatch = watchBlocks(client_2, {
      onBlock: (block, prevBlock) => {
        blocks.push(block)
        prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
      },
    })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    unwatch()
    expect(blocks.length).toBe(5)
    expect(prevBlocks.length).toBe(4)
    expect(typeof blocks[0].number).toBe('bigint')
  })

  test('fallback transport (poll: false)', async () => {
    const client_2 = createClient({
      chain: anvilMainnet.chain,
      transport: fallback([http(), webSocket()]),
      pollingInterval: 200,
    })

    const blocks: OnBlockParameter[] = []
    const prevBlocks: OnBlockParameter[] = []
    const unwatch = watchBlocks(client_2, {
      poll: false,
      onBlock: (block, prevBlock) => {
        blocks.push(block)
        prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
      },
    })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    await mine(client, { blocks: 1 })
    await wait(200)
    unwatch()
    expect(blocks.length).toBe(5)
    expect(prevBlocks.length).toBe(4)
    expect(typeof blocks[0].number).toBe('bigint')
  })

  describe('errors', () => {
    test('handles error thrown on init', async () => {
      const client = {
        ...webSocketClient,
        transport: {
          ...webSocketClient.transport,
          subscribe() {
            throw new Error('error')
          },
        },
      }

      let unwatch: () => void = () => null
      const error = await new Promise((resolve) => {
        unwatch = watchBlocks(client, {
          onBlock: () => null,
          onError: resolve,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: error]')
      unwatch()
    })

    test('handles error thrown on event', async () => {
      const client = {
        ...webSocketClient,
        transport: {
          ...webSocketClient.transport,
          subscribe({ onError }: any) {
            onError(new Error('error'))
          },
        },
      }

      let unwatch: () => void = () => null
      const error = await new Promise((resolve) => {
        unwatch = watchBlocks(client as Client, {
          onBlock: () => null,
          onError: resolve,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: error]')
      unwatch()
    })
  })
})
