import { describe, expect, test, vi } from 'vitest'

import type { WatchBlocksResponse } from './watchBlocks'
import { watchBlocks } from './watchBlocks'
import { fetchBlock } from './fetchBlock'
import { publicClient } from '../../../test'
import { wait } from '../../utils/wait'
import { localhost } from '../../chains'
import { createPublicClient, http } from '../../clients'

const defaultConfig = { pollingInterval: 1_000 }

test('watches for new blocks', async () => {
  const block = await fetchBlock(publicClient)
  vi.setSystemTime(Number(block.timestamp * 1000n))

  const blocks: WatchBlocksResponse[] = []
  const unwatch = watchBlocks(
    publicClient,
    (block) => blocks.push(block),
    defaultConfig,
  )
  await wait(5000)
  unwatch()
  expect(blocks.length).toBe(4)
}, 10_000)

describe('emitOnBegin', () => {
  test('watches for new blocks', async () => {
    const block = await fetchBlock(publicClient)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(publicClient, (block) => blocks.push(block), {
      ...defaultConfig,
      emitOnBegin: true,
    })
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(5)
  }, 10_000)
})

describe('pollingInterval on rpc', () => {
  test('watches for new blocks', async () => {
    const rpc = createPublicClient(
      http({
        chain: localhost,
      }),
      { pollingInterval: 500 },
    )
    const block = await fetchBlock(rpc)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(rpc, (block) => blocks.push(block))
    await wait(2000)
    unwatch()
    expect(blocks.length).toBe(3)
  }, 10_000)
})

describe('behavior', () => {
  test('watch > unwatch > watch', async () => {
    const block = await fetchBlock(publicClient)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    let blocks: WatchBlocksResponse[] = []
    let unwatch = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(2)

    blocks = []
    unwatch = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(2)
  }, 10_000)

  test('multiple watchers', async () => {
    const block = await fetchBlock(publicClient)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    let blocks: WatchBlocksResponse[] = []

    let unwatch1 = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    let unwatch2 = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    let unwatch3 = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blocks.length).toBe(6)

    blocks = []

    unwatch1 = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    unwatch2 = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    unwatch3 = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blocks.length).toBe(6)
  }, 10_000)

  test('immediately unwatch', async () => {
    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(
      publicClient,
      (block) => blocks.push(block),
      defaultConfig,
    )
    unwatch()
    await wait(3000)
    expect(blocks.length).toBe(0)
  }, 10_000)
})
