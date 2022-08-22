import { beforeAll, describe, expect, test, vi } from 'vitest'

import { networkProvider } from '../../../test/utils'
import { WatchBlocksResponse, watchBlocks } from './watchBlocks'
import { fetchBlock } from './fetchBlock'
import { wait } from '../../utils/wait'

beforeAll(() => {
  vi.mock('../../utils/block.ts', () => {
    return { blockTime: 1000 }
  })
})

describe('http', () => {
  test('watches for new blocks', async () => {
    const block = await fetchBlock(networkProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(networkProvider, (block) => blocks.push(block))
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(5)
  }, 10_000)

  test('watches for new blocks (out of sync time)', async () => {
    const block = await fetchBlock(networkProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n) + 500)

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(networkProvider, (block) => blocks.push(block))
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(5)
  }, 10_000)

  test('watch > unwatch > watch', async () => {
    const block = await fetchBlock(networkProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    let blocks: WatchBlocksResponse[] = []
    let unwatch = watchBlocks(networkProvider, (block) => blocks.push(block))
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(3)

    blocks = []
    unwatch = watchBlocks(networkProvider, (block) => blocks.push(block))
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(3)
  }, 10_000)

  test('multiple watchers', async () => {
    const block = await fetchBlock(networkProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    let blocks: WatchBlocksResponse[] = []

    let unwatch1 = watchBlocks(networkProvider, (block) => blocks.push(block))
    let unwatch2 = watchBlocks(networkProvider, (block) => blocks.push(block))
    let unwatch3 = watchBlocks(networkProvider, (block) => blocks.push(block))
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blocks.length).toBe(9)

    blocks = []

    unwatch1 = watchBlocks(networkProvider, (block) => blocks.push(block))
    unwatch2 = watchBlocks(networkProvider, (block) => blocks.push(block))
    unwatch3 = watchBlocks(networkProvider, (block) => blocks.push(block))
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blocks.length).toBe(9)
  }, 10_000)

  test('immediately unwatch', async () => {
    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(networkProvider, (block) => blocks.push(block))
    unwatch()
    await wait(3000)
    expect(blocks.length).toBe(0)
  }, 10_000)
})
