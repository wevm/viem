import { describe, expect, test } from 'vitest'

import { WatchBlockNumberResponse, watchBlockNumber } from './watchBlockNumber'
import { networkProvider, walletProvider } from '../../../test/utils'
import { wait } from '../../utils/wait'
import { local } from '../../chains'
import { httpProvider } from '../../providers'

const defaultConfig = { pollingInterval: 1_000 }

test('watches for new block numbers', async () => {
  const blockNumbers: WatchBlockNumberResponse[] = []
  const unwatch = watchBlockNumber(
    networkProvider,
    (blockNumber) => blockNumbers.push(blockNumber),
    defaultConfig,
  )
  await wait(5000)
  unwatch()
  expect(blockNumbers.length).toBe(5)
}, 10_000)

describe('walletProvider', () => {
  test('watches for new block numbers', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      walletProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(5000)
    unwatch()
    expect(blockNumbers.length).toBe(5)
  }, 10_000)
})

describe('emitOnOpen', () => {
  test('watches for new blocks', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      {
        ...defaultConfig,
        emitOnOpen: true,
      },
    )
    await wait(5000)
    unwatch()
    expect(blockNumbers.length).toBe(6)
  }, 10_000)
})

describe('blockTime on chain', () => {
  test('watches for new block numbers', async () => {
    const provider = httpProvider({
      chain: { ...local, blockTime: 200 },
    })

    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(provider, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    await wait(2000)
    unwatch()
    expect(blockNumbers.length).toBe(10)
  }, 10_000)
})

describe('pollingInterval on provider', () => {
  test('watches for new blocks', async () => {
    const provider = httpProvider({
      chain: local,
      pollingInterval: 500,
    })

    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(provider, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    await wait(2000)
    unwatch()
    expect(blockNumbers.length).toBe(4)
  }, 10_000)
})

describe('behavior', () => {
  test('watches for new blocks (out of sync time)', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(5000)
    unwatch()
    expect(blockNumbers.length).toBe(5)
  }, 10_000)

  test('watch > unwatch > watch', async () => {
    let blockNumbers: WatchBlockNumberResponse[] = []
    let unwatch = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(3000)
    unwatch()
    expect(blockNumbers.length).toBe(3)

    blockNumbers = []
    unwatch = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(3000)
    unwatch()
    expect(blockNumbers.length).toBe(3)
  }, 10_000)

  test('multiple watchers', async () => {
    let blockNumbers: WatchBlockNumberResponse[] = []

    let unwatch1 = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    let unwatch2 = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    let unwatch3 = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blockNumbers.length).toBe(9)

    blockNumbers = []

    unwatch1 = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    unwatch2 = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    unwatch3 = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blockNumbers.length).toBe(9)
  }, 10_000)

  test('immediately unwatch', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      networkProvider,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    unwatch()
    await wait(3000)
    expect(blockNumbers.length).toBe(0)
  }, 10_000)
})
