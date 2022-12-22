import { describe, expect, test, vi } from 'vitest'

import type { OnBlockResponse } from './watchBlocks'
import * as fetchBlock from './fetchBlock'
import { watchBlocks } from './watchBlocks'
import { mine } from '../test/mine'
import { publicClient, testClient } from '../../../test'
import { wait } from '../../utils/wait'
import { celo, localhost } from '../../chains'
import { createPublicClient, http } from '../../clients'
import { setIntervalMining } from '../test'

test('watches for new blocks', async () => {
  const blocks: OnBlockResponse[] = []
  const prevBlocks: OnBlockResponse[] = []
  const unwatch = watchBlocks(publicClient, {
    onBlock: (block, prevBlock) => {
      blocks.push(block)
      prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
    },
  })
  await wait(5000)
  unwatch()
  expect(blocks.length).toBe(4)
  expect(prevBlocks.length).toBe(3)
})

describe('emitMissed', () => {
  test('emits on missed blocks', async () => {
    await setIntervalMining(testClient, { interval: 0 })
    const blocks: OnBlockResponse[] = []
    const unwatch = watchBlocks(publicClient, {
      emitMissed: true,
      onBlock: (block) => blocks.push(block),
      pollingInterval: 500,
    })
    await mine(testClient, { blocks: 1 })
    await wait(1000)
    await mine(testClient, { blocks: 5 })
    await wait(1000)
    unwatch()
    expect(blocks.length).toBe(6)
    await setIntervalMining(testClient, { interval: 1 })
  })
})

describe('emitOnBegin', () => {
  test('watches for new blocks', async () => {
    const blocks: OnBlockResponse[] = []
    const unwatch = watchBlocks(publicClient, {
      emitOnBegin: true,
      onBlock: (block) => blocks.push(block),
    })
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(5)
  })
})

describe('pollingInterval on client', () => {
  test('watches for new blocks', async () => {
    const client = createPublicClient({
      chain: localhost,
      transport: http(),
      pollingInterval: 500,
    })

    const blocks: OnBlockResponse[] = []
    const unwatch = watchBlocks(client, {
      onBlock: (block) => blocks.push(block),
    })
    await wait(2000)
    unwatch()
    expect(blocks.length).toBe(2)
  })
})

test('custom chain type', async () => {
  const client = createPublicClient({
    chain: celo,
    transport: http(),
  })

  const blocks: OnBlockResponse<typeof celo>[] = []
  const unwatch = watchBlocks(client, {
    emitOnBegin: true,
    onBlock: (block) => blocks.push(block),
  })
  await wait(2000)
  unwatch()
  expect(blocks[0].randomness).toBeDefined()
})

describe('behavior', () => {
  test('does not emit when no new incoming blocks', async () => {
    const blocks: OnBlockResponse[] = []
    const unwatch = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
      pollingInterval: 100,
    })
    await wait(1200)
    unwatch()
    expect(blocks.length).toBe(2)
  })

  test('watch > unwatch > watch', async () => {
    let blocks: OnBlockResponse[] = []
    let unwatch = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(2)

    blocks = []
    unwatch = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(2)
  })

  test('multiple watchers', async () => {
    let blocks: OnBlockResponse[] = []

    let unwatch1 = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    let unwatch2 = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    let unwatch3 = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blocks.length).toBe(6)

    blocks = []

    unwatch1 = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    unwatch2 = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    unwatch3 = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blocks.length).toBe(6)
  })

  test('immediately unwatch', async () => {
    const blocks: OnBlockResponse[] = []
    const unwatch = watchBlocks(publicClient, {
      onBlock: (block) => blocks.push(block),
    })
    unwatch()
    await wait(3000)
    expect(blocks.length).toBe(0)
  })
})

describe('errors', () => {
  test('handles error thrown', async () => {
    vi.spyOn(fetchBlock, 'fetchBlock').mockRejectedValue(new Error('foo'))

    let unwatch: () => void = () => null
    const error = await new Promise((resolve) => {
      unwatch = watchBlocks(publicClient, {
        onBlock: () => null,
        onError: resolve,
      })
    })
    expect(error).toMatchInlineSnapshot('[Error: foo]')
    unwatch()
  })
})
