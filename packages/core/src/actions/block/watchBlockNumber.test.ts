import { describe, expect, test } from 'vitest'

import type { WatchBlockNumberResponse } from './watchBlockNumber'
import { watchBlockNumber } from './watchBlockNumber'
import { publicClient } from '../../../test'
import { wait } from '../../utils/wait'
import { localhost } from '../../chains'
import { createPublicClient, http } from '../../clients'

const defaultConfig = { pollingInterval: 1_000 }

test('watches for new block numbers', async () => {
  const blockNumbers: WatchBlockNumberResponse[] = []
  const unwatch = watchBlockNumber(
    publicClient,
    (blockNumber) => blockNumbers.push(blockNumber),
    defaultConfig,
  )
  await wait(5000)
  unwatch()
  expect(blockNumbers.length).toBe(4)
}, 10_000)

describe('emitOnBegin', () => {
  test('watches for new block numbers', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      {
        ...defaultConfig,
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
    expect(blockNumbers.length).toBe(3)
  }, 10_000)
})

describe('behavior', () => {
  test('watch > unwatch > watch', async () => {
    let blockNumbers: WatchBlockNumberResponse[] = []
    let unwatch = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(3000)
    unwatch()
    expect(blockNumbers.length).toBe(2)

    blockNumbers = []
    unwatch = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(3000)
    unwatch()
    expect(blockNumbers.length).toBe(2)
  }, 10_000)

  test('multiple watchers', async () => {
    let blockNumbers: WatchBlockNumberResponse[] = []

    let unwatch1 = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    let unwatch2 = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    let unwatch3 = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blockNumbers.length).toBe(6)

    blockNumbers = []

    unwatch1 = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    unwatch2 = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    unwatch3 = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blockNumbers.length).toBe(6)
  }, 10_000)

  test('immediately unwatch', async () => {
    const blockNumbers: WatchBlockNumberResponse[] = []
    const unwatch = watchBlockNumber(
      publicClient,
      (blockNumber) => blockNumbers.push(blockNumber),
      defaultConfig,
    )
    unwatch()
    await wait(3000)
    expect(blockNumbers.length).toBe(0)
  }, 10_000)
})
