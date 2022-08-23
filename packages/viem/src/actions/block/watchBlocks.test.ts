import { describe, expect, test, vi } from 'vitest'

import { WatchBlocksResponse, watchBlocks } from './watchBlocks'
import { fetchBlock } from './fetchBlock'
import { walletProvider } from '../../../test/utils'
import { wait } from '../../utils/wait'
import { httpProvider as httpProvider_ } from '../../providers'
import { local } from '../../chains'

const defaultConfig = { pollingInterval: 1_000 }

const httpProvider = httpProvider_({ chain: local })

describe('http', () => {
  test('watches for new blocks', async () => {
    const block = await fetchBlock(httpProvider)
    vi.setSystemTime(Number(block.timestamp * 1000n))

    const blocks: WatchBlocksResponse[] = []
    const unwatch = watchBlocks(
      httpProvider,
      (block) => blocks.push(block),
      defaultConfig,
    )
    await wait(5000)
    unwatch()
    expect(blocks.length).toBe(5)
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
      expect(blocks.length).toBe(5)
    }, 10_000)
  })

  describe('emitOnOpen', () => {
    test('watches for new blocks', async () => {
      const block = await fetchBlock(httpProvider)
      vi.setSystemTime(Number(block.timestamp * 1000n))

      const blocks: WatchBlocksResponse[] = []
      const unwatch = watchBlocks(httpProvider, (block) => blocks.push(block), {
        ...defaultConfig,
        emitOnOpen: true,
      })
      await wait(5000)
      unwatch()
      expect(blocks.length).toBe(6)
    }, 10_000)
  })

  describe('blockTime on chain', () => {
    test('watches for new blocks', async () => {
      const provider = httpProvider_({
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
  })

  describe('pollingInterval on provider', () => {
    test('watches for new blocks', async () => {
      const provider = httpProvider_({
        chain: local,
        pollingInterval: 500,
      })
      const block = await fetchBlock(provider)
      vi.setSystemTime(Number(block.timestamp * 1000n))

      const blocks: WatchBlocksResponse[] = []
      const unwatch = watchBlocks(provider, (block) => blocks.push(block))
      await wait(2000)
      unwatch()
      expect(blocks.length).toBe(4)
    }, 10_000)
  })

  describe('behavior', () => {
    test('watches for new blocks (out of sync time)', async () => {
      const block = await fetchBlock(httpProvider)
      vi.setSystemTime(Number(block.timestamp * 1000n) + 500)

      const blocks: WatchBlocksResponse[] = []
      const unwatch = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      await wait(5000)
      unwatch()
      expect(blocks.length).toBe(5)
    }, 10_000)

    test('watch > unwatch > watch', async () => {
      const block = await fetchBlock(httpProvider)
      vi.setSystemTime(Number(block.timestamp * 1000n))

      let blocks: WatchBlocksResponse[] = []
      let unwatch = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      await wait(3000)
      unwatch()
      expect(blocks.length).toBe(3)

      blocks = []
      unwatch = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      await wait(3000)
      unwatch()
      expect(blocks.length).toBe(3)
    }, 10_000)

    test('multiple watchers', async () => {
      const block = await fetchBlock(httpProvider)
      vi.setSystemTime(Number(block.timestamp * 1000n))

      let blocks: WatchBlocksResponse[] = []

      let unwatch1 = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      let unwatch2 = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      let unwatch3 = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      await wait(3000)
      unwatch1()
      unwatch2()
      unwatch3()
      expect(blocks.length).toBe(9)

      blocks = []

      unwatch1 = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      unwatch2 = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      unwatch3 = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      await wait(3000)
      unwatch1()
      unwatch2()
      unwatch3()
      expect(blocks.length).toBe(9)
    }, 10_000)

    test('immediately unwatch', async () => {
      const blocks: WatchBlocksResponse[] = []
      const unwatch = watchBlocks(
        httpProvider,
        (block) => blocks.push(block),
        defaultConfig,
      )
      unwatch()
      await wait(3000)
      expect(blocks.length).toBe(0)
    }, 10_000)
  })
})
