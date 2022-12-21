import { describe, expect, test } from 'vitest'

import type { WatchBlockNumberResponse } from './watchBlockNumber'
import { watchBlockNumber } from './watchBlockNumber'
import { publicClient, testClient } from '../../../test'
import { wait } from '../../utils/wait'
import { localhost } from '../../chains'
import { createPublicClient, http } from '../../clients'
import { mine } from '../test/mine'

test('watches for new block numbers', async () => {
  const blockNumbers: WatchBlockNumberResponse[] = []
  const unwatch = watchBlockNumber(publicClient, (blockNumber) =>
    blockNumbers.push(blockNumber),
  )
  await wait(5000)
  unwatch()
  expect(blockNumbers.length).toBe(4)
}, 10_000)

describe('emitMissed', () => {
  test('emits on missed blocks', async () => {
    await testClient.request({ method: 'evm_setIntervalMining', params: [99] })
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      publicClient,
      (block) => blockNumbers.push(block),
      {
        pollingInterval: 500,
        emitMissed: true,
      },
    )
    await mine(testClient, { blocks: 1 })
    await wait(1000)
    await mine(testClient, { blocks: 5 })
    await wait(1000)
    unwatch()
    await testClient.request({ method: 'evm_setIntervalMining', params: [1] })
    expect(blockNumbers.length).toBe(6)
  })
})

describe('emitOnBegin', () => {
  test('watches for new block numbers', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      {
        emitOnBegin: true,
      },
    )
    await wait(5000)
    unwatch()
    expect(blockNumbers.length).toBe(5)
  }, 10_000)
})

describe('pollingInterval on client', () => {
  test('watches for new block numbers', async () => {
    const client = createPublicClient({
      chain: localhost,
      transport: http(),
      pollingInterval: 500,
    })

    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(client, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    await wait(2000)
    unwatch()
    expect(blockNumbers.length).toBe(2)
  }, 10_000)
})

describe('behavior', () => {
  test('does not emit when no new incoming blocks', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      publicClient,
      (block) => blockNumbers.push(block),
      {
        pollingInterval: 100,
      },
    )
    await wait(1200)
    unwatch()
    expect(blockNumbers.length).toBe(2)
  }, 10_000)

  test('watch > unwatch > watch', async () => {
    let blockNumbers: WatchBlockNumberResponse[] = []
    let unwatch = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    await wait(3000)
    unwatch()
    expect(blockNumbers.length).toBe(2)

    blockNumbers = []
    unwatch = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    await wait(3000)
    unwatch()
    expect(blockNumbers.length).toBe(2)
  }, 10_000)

  test('multiple watchers', async () => {
    let blockNumbers: WatchBlockNumberResponse[] = []

    let unwatch1 = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    let unwatch2 = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    let unwatch3 = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blockNumbers.length).toBe(6)

    blockNumbers = []

    unwatch1 = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    unwatch2 = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    unwatch3 = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blockNumbers.length).toBe(6)
  }, 10_000)

  test('immediately unwatch', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(publicClient, (blockNumber) =>
      blockNumbers.push(blockNumber),
    )
    unwatch()
    await wait(3000)
    expect(blockNumbers.length).toBe(0)
  }, 10_000)
})
