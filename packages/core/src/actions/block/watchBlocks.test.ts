import { describe, expect, test } from 'vitest'

import type { WatchBlocksResponse } from './watchBlocks'
import { watchBlocks } from './watchBlocks'
import { mine } from '../test/mine'
import { publicClient, testClient } from '../../../test'
import { wait } from '../../utils/wait'
import { celo, localhost } from '../../chains'
import { createPublicClient, http } from '../../clients'

test('watches for new blocks', async () => {
  const blocks: WatchBlocksResponse[] = []
  const prevBlocks: WatchBlocksResponse[] = []
  const unwatch = watchBlocks(publicClient, (block, prevBlock) => {
    blocks.push(block)
    prevBlock && block !== prevBlock && prevBlocks.push(prevBlock)
  })
  await wait(5000)
  unwatch()
  expect(blocks.length).toBe(4)
  expect(prevBlocks.length).toBe(3)
}, 10_000)

describe('emitMissed', () => {
  test('emits on missed blocks', async () => {
    await testClient.request({ method: 'evm_setIntervalMining', params: [99] })
    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(publicClient, (block) => blocks.push(block), {
      pollingInterval: 500,
      emitMissed: true,
    })
    await mine(testClient, { blocks: 1 })
    await wait(1000)
    await mine(testClient, { blocks: 5 })
    await wait(1000)
    unwatch()
    await testClient.request({ method: 'evm_setIntervalMining', params: [1] })
    expect(blocks.length).toBe(6)
  })
})

describe('emitOnBegin', () => {
  test('watches for new blocks', async () => {
    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(publicClient, (block) => blocks.push(block), {
      emitOnBegin: true,
    })
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(5)
  }, 10_000)
})

describe('pollingInterval on client', () => {
  test('watches for new blocks', async () => {
    const client = createPublicClient({
      chain: localhost,
      transport: http(),
      pollingInterval: 500,
    })

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(client, (block) => blocks.push(block))
    await wait(2000)
    unwatch()
    expect(blocks.length).toBe(2)
  }, 10_000)
})

test('custom chain type', async () => {
  const client = createPublicClient({
    chain: celo,
    transport: http(),
  })

  const blocks: WatchBlocksResponse<typeof celo>[] = []
  const unwatch = watchBlocks(client, (block) => blocks.push(block), {
    emitOnBegin: true,
  })
  await wait(2000)
  unwatch()
  expect(blocks[0].randomness).toBeDefined()
}, 10_000)

describe('behavior', () => {
  test('does not emit when no new incoming blocks', async () => {
    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(publicClient, (block) => blocks.push(block), {
      pollingInterval: 100,
    })
    await wait(1200)
    unwatch()
    expect(blocks.length).toBe(2)
  }, 10_000)

  test('watch > unwatch > watch', async () => {
    let blocks: WatchBlocksResponse[] = []
    let unwatch = watchBlocks(publicClient, (block) => blocks.push(block))
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(2)

    blocks = []
    unwatch = watchBlocks(publicClient, (block) => blocks.push(block))
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(2)
  }, 10_000)

  test('multiple watchers', async () => {
    let blocks: WatchBlocksResponse[] = []

    let unwatch1 = watchBlocks(publicClient, (block) => blocks.push(block))
    let unwatch2 = watchBlocks(publicClient, (block) => blocks.push(block))
    let unwatch3 = watchBlocks(publicClient, (block) => blocks.push(block))
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blocks.length).toBe(6)

    blocks = []

    unwatch1 = watchBlocks(publicClient, (block) => blocks.push(block))
    unwatch2 = watchBlocks(publicClient, (block) => blocks.push(block))
    unwatch3 = watchBlocks(publicClient, (block) => blocks.push(block))
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blocks.length).toBe(6)
  }, 10_000)

  test('immediately unwatch', async () => {
    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(publicClient, (block) => blocks.push(block))
    unwatch()
    await wait(3000)
    expect(blocks.length).toBe(0)
  }, 10_000)
})
