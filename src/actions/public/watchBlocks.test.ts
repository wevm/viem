import { describe, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import {
  anvilChain,
  httpClient,
  publicClient,
  testClient,
  walletClient,
  webSocketClient,
} from '~test/src/utils.js'
import { celo, localhost } from '../../chains/index.js'
import {
  type PublicClient,
  createPublicClient,
} from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { Block } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { createClient } from '../../clients/createClient.js'
import { fallback } from '../../clients/transports/fallback.js'
import { webSocket } from '../../clients/transports/webSocket.js'
import * as getBlock from './getBlock.js'
import { type OnBlockParameter, watchBlocks } from './watchBlocks.js'

describe('poll', () => {
  test('watches for new blocks', async () => {
    const blocks: OnBlockParameter[] = []
    const prevBlocks: OnBlockParameter[] = []
    const unwatch = watchBlocks(publicClient, {
      onBlock: (block, prevBlock) => {
        blocks.push(block)
        prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
      },
      poll: true,
      pollingInterval: 100,
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()
    expect(blocks.length).toBe(4)
    expect(prevBlocks.length).toBe(3)
    expect(typeof blocks[0].number).toBe('bigint')
  })

  test('args: includeTransactions', async () => {
    const blocks: OnBlockParameter<Chain, true>[] = []
    const unwatch = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
      includeTransactions: true,
      poll: true,
    })

    await sendTransaction(walletClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
    await mine(testClient, { blocks: 1 })
    await wait(200)

    unwatch()
    expect(
      typeof blocks[blocks.length - 1].transactions[0] === 'object',
    ).toBeTruthy()
  })

  describe('emitMissed', () => {
    test('emits on missed blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(publicClient, {
        emitMissed: true,
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 5 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(6)
    })
  })

  describe('emitOnBegin', () => {
    test('watches for new blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(publicClient, {
        emitOnBegin: true,
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(5)
    })
  })

  describe('pollingInterval on client', () => {
    test('watches for new blocks', async () => {
      const client = createPublicClient({
        chain: localhost,
        transport: http(anvilMainnet.rpcUrl.http),
        pollingInterval: 100,
      })
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(2)
    })
  })

  test('custom chain type', async () => {
    const client = createPublicClient({
      chain: celo,
      transport: http(),
    })

    let unwatch = () => {}
    const block = await new Promise<OnBlockParameter<typeof celo>>(
      (resolve) => {
        unwatch = watchBlocks(client, {
          emitOnBegin: true,
          onBlock: (block) => resolve(block),
          poll: true,
          pollingInterval: 100,
        })
      },
    )

    unwatch()
    expect(block.randomness).toBeDefined()
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
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(4)
      expect(prevBlocks.length).toBe(3)
    })

    test('fallback transport', async () => {
      const client = createClient({
        chain: anvilChain,
        transport: fallback([http(), webSocket()]),
        pollingInterval: 200,
      })

      const blocks: OnBlockParameter[] = []
      const prevBlocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(client, {
        onBlock: (block, prevBlock) => {
          blocks.push(block)
          prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
        },
      })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(5)
      expect(prevBlocks.length).toBe(4)
      expect(typeof blocks[0].number).toBe('bigint')
    })
  })

  describe('behavior', () => {
    test('does not emit when no new incoming blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(2)
    })

    test('watch > unwatch > watch', async () => {
      let blocks: OnBlockParameter[] = []
      let unwatch = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(2)

      blocks = []
      unwatch = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(2)
    })

    test('multiple watchers', async () => {
      let blocks: OnBlockParameter[] = []

      let unwatch1 = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      let unwatch2 = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      let unwatch3 = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch1()
      unwatch2()
      unwatch3()
      expect(blocks.length).toBe(6)

      blocks = []

      unwatch1 = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      unwatch2 = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      unwatch3 = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch1()
      unwatch2()
      unwatch3()
      expect(blocks.length).toBe(6)
    })

    test('immediately unwatch', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(publicClient, {
        onBlock: (block) => blocks.push(block),
        poll: true,
        pollingInterval: 100,
      })
      unwatch()
      await mine(testClient, { blocks: 1 })
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
      const unwatch = watchBlocks(publicClient, {
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
      const unwatch = watchBlocks(publicClient, {
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
      const unwatch = watchBlocks(publicClient, {
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
        unwatch = watchBlocks(publicClient, {
          onBlock: () => null,
          onError: resolve,
          poll: true,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: foo]')
      unwatch()
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
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()
    expect(blocks.length).toBe(5)
    expect(prevBlocks.length).toBe(4)
    expect(typeof blocks[0].number).toBe('bigint')
  })

  describe('behavior', () => {
    test('does not emit when no new incoming blocks', async () => {
      const blocks: OnBlockParameter[] = []
      const unwatch = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      await wait(200)
      await mine(testClient, { blocks: 1 })
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
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      unwatch()
      expect(blocks.length).toBe(3)

      blocks = []
      unwatch = watchBlocks(webSocketClient, {
        onBlock: (block) => blocks.push(block),
      })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
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
      await mine(testClient, { blocks: 1 })
      await wait(500)
      await mine(testClient, { blocks: 1 })
      await wait(500)
      await mine(testClient, { blocks: 1 })
      await wait(500)
      unwatch1()
      unwatch2()
      unwatch3()
      expect(blocks.length).toBe(9)

      await mine(testClient, { blocks: 1 })
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
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
      await wait(200)
      await mine(testClient, { blocks: 1 })
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
      await mine(testClient, { blocks: 1 })
      await wait(1000)
      expect(blocks.length).toBe(0)
    })
  })

  test('fallback transport', async () => {
    const client = createClient({
      chain: anvilChain,
      transport: fallback([webSocket(), http()]),
      pollingInterval: 200,
    })

    const blocks: OnBlockParameter[] = []
    const prevBlocks: OnBlockParameter[] = []
    const unwatch = watchBlocks(client, {
      onBlock: (block, prevBlock) => {
        blocks.push(block)
        prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
      },
    })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    unwatch()
    expect(blocks.length).toBe(5)
    expect(prevBlocks.length).toBe(4)
    expect(typeof blocks[0].number).toBe('bigint')
  })

  test('fallback transport (poll: false)', async () => {
    const client = createClient({
      chain: anvilChain,
      transport: fallback([http(), webSocket()]),
      pollingInterval: 200,
    })

    const blocks: OnBlockParameter[] = []
    const prevBlocks: OnBlockParameter[] = []
    const unwatch = watchBlocks(client, {
      poll: false,
      onBlock: (block, prevBlock) => {
        blocks.push(block)
        prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
      },
    })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
    await wait(200)
    await mine(testClient, { blocks: 1 })
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
        unwatch = watchBlocks(client as PublicClient, {
          onBlock: () => null,
          onError: resolve,
        })
      })
      expect(error).toMatchInlineSnapshot('[Error: error]')
      unwatch()
    })
  })
})
