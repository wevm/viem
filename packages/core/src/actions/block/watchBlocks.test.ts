import { describe, expect, test, vi } from 'vitest'

import { WatchBlocksResponse, watchBlocks } from './watchBlocks'
import { fetchBlock } from './fetchBlock'
import { networkProvider, walletProvider } from '../../../../test/src/utils'
import { wait } from '../../utils/wait'
import { local } from '../../chains'
import { httpProvider } from '../../providers/network'

const defaultConfig = { pollingInterval: 1_000 }

test('watches for new blocks', async () => {
  const block = await fetchBlock(networkProvider)
  vi.setSystemTime(Number(block.timestamp * 1000n))

  const blocks: WatchBlocksResponse[] = []
  const unwatch = watchBlocks(
    networkProvider,
    (block) => blocks.push(block),
    defaultConfig,
  )
  await wait(5000)
  unwatch()
  expect(blocks.length).toBe(4)
}, 10_000)

describe('walletProvider', () => {
  test('watches for new blocks', async () => {
    const block = await fetchBlock(walletProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(
      walletProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(4)
  }, 10_000)
})

describe('emitOnBegin', () => {
  test('watches for new blocks', async () => {
    const block = await fetchBlock(networkProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(
      networkProvider,
      (block) => blocks.push(block),
      {
        ...defaultConfig,
        emitOnBegin: true,
      },
    )
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(5)
  }, 10_000)
})

describe('blockTime on chain', () => {
  test('watches for new blocks', async () => {
    const provider = httpProvider({
      chain: { ...local, blockTime: 200 },
    })
    const block = await fetchBlock(provider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(provider, (block) => blocks.push(block))
    await wait(2000)
    unwatch()
    expect(blocks.length).toBe(10)
  }, 10_000)

  test('watches for new blocks (out of sync w/ block time)', async () => {
    const block = await fetchBlock(networkProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n) + 500)

    const provider = httpProvider({
      chain: { ...local, blockTime: 1_000 },
    })

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(provider, (block) => blocks.push(block))
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(5)
  }, 10_000)
})

describe('pollingInterval on provider', () => {
  test('watches for new blocks', async () => {
    const provider = httpProvider({
      chain: { ...local, blockTime: undefined },
      pollingInterval: 500,
    })
    const block = await fetchBlock(provider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(provider, (block) => blocks.push(block))
    await wait(2000)
    unwatch()
    expect(blocks.length).toBe(3)
  }, 10_000)
})

describe('behavior', () => {
  test('watch > unwatch > watch', async () => {
    const block = await fetchBlock(networkProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    let blocks: WatchBlocksResponse[] = []
    let unwatch = watchBlocks(
      networkProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(2)

    blocks = []
    unwatch = watchBlocks(
      networkProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    await wait(3000)
    unwatch()
    expect(blocks.length).toBe(2)
  }, 10_000)

  test('multiple watchers', async () => {
    const block = await fetchBlock(networkProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    let blocks: WatchBlocksResponse[] = []

    let unwatch1 = watchBlocks(
      networkProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    let unwatch2 = watchBlocks(
      networkProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    let unwatch3 = watchBlocks(
      networkProvider,
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
      networkProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    unwatch2 = watchBlocks(
      networkProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    unwatch3 = watchBlocks(
      networkProvider,
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
      networkProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    unwatch()
    await wait(3000)
    expect(blocks.length).toBe(0)
  }, 10_000)
})
