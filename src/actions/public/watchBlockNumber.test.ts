import { describe, expect, test, vi } from 'vitest'

import type { OnBlockNumberParameter } from './watchBlockNumber'
import { watchBlockNumber } from './watchBlockNumber'
import { publicClient, testClient } from '../../_test'
import { wait } from '../../utils/wait'
import { localhost } from '../../chains'
import { createPublicClient, http } from '../../clients'
import { mine } from '../test/mine'
import * as getBlockNumber from './getBlockNumber'
import { setIntervalMining } from '../test'

test('watches for new block numbers', async () => {
  const blockNumbers: OnBlockNumberParameter[] = []
  const unwatch = watchBlockNumber(publicClient, {
    onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
  })
  await wait(5000)
  unwatch()
  expect(blockNumbers.length).toBe(4)
})

describe('emitMissed', () => {
  test('emits on missed blocks', async () => {
    await setIntervalMining(testClient, { interval: 0 })
    const blockNumbers: OnBlockNumberParameter[] = []
    const unwatch = watchBlockNumber(publicClient, {
      emitMissed: true,
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
      pollingInterval: 500,
    })
    await mine(testClient, { blocks: 1 })
    await wait(1000)
    await mine(testClient, { blocks: 5 })
    await wait(1000)
    unwatch()
    await setIntervalMining(testClient, { interval: 1 })
    expect(blockNumbers.length).toBe(6)
  })
})

describe('emitOnBegin', () => {
  test('watches for new block numbers', async () => {
    const blockNumbers: OnBlockNumberParameter[] = []
    const unwatch = watchBlockNumber(publicClient, {
      emitOnBegin: true,
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    await wait(5000)
    unwatch()
    expect(blockNumbers.length).toBe(5)
  })
})

describe('pollingInterval on client', () => {
  test('watches for new block numbers', async () => {
    const client = createPublicClient({
      chain: localhost,
      transport: http(),
      pollingInterval: 500,
    })

    const blockNumbers: OnBlockNumberParameter[] = []
    const unwatch = watchBlockNumber(client, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    await wait(2000)
    unwatch()
    expect(blockNumbers.length).toBe(2)
  })
})

describe('behavior', () => {
  test('does not emit when no new incoming blocks', async () => {
    const blockNumbers: OnBlockNumberParameter[] = []
    const unwatch = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
      pollingInterval: 100,
    })
    await wait(1200)
    unwatch()
    expect(blockNumbers.length).toBe(2)
  })

  test('watch > unwatch > watch', async () => {
    let blockNumbers: OnBlockNumberParameter[] = []
    let unwatch = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    await wait(3000)
    unwatch()
    expect(blockNumbers.length).toBe(2)

    blockNumbers = []
    unwatch = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    await wait(3000)
    unwatch()
    expect(blockNumbers.length).toBe(2)
  })

  test('multiple watchers', async () => {
    let blockNumbers: OnBlockNumberParameter[] = []

    let unwatch1 = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    let unwatch2 = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    let unwatch3 = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blockNumbers.length).toBe(6)

    blockNumbers = []

    unwatch1 = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    unwatch2 = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    unwatch3 = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    await wait(3000)
    unwatch1()
    unwatch2()
    unwatch3()
    expect(blockNumbers.length).toBe(6)
  })

  test('immediately unwatch', async () => {
    const blockNumbers: OnBlockNumberParameter[] = []
    const unwatch = watchBlockNumber(publicClient, {
      onBlockNumber: (blockNumber) => blockNumbers.push(blockNumber),
    })
    unwatch()
    await wait(3000)
    expect(blockNumbers.length).toBe(0)
  })

  test('out of order blocks', async () => {
    vi.spyOn(getBlockNumber, 'getBlockNumber')
      .mockResolvedValueOnce(420n)
      .mockResolvedValueOnce(421n)
      .mockResolvedValueOnce(419n)
      .mockResolvedValueOnce(424n)
      .mockResolvedValueOnce(424n)
      .mockResolvedValueOnce(426n)
      .mockResolvedValueOnce(423n)
      .mockResolvedValueOnce(424n)
      .mockResolvedValueOnce(429n)
      .mockResolvedValueOnce(430n)

    const blockNumbers: [
      OnBlockNumberParameter,
      OnBlockNumberParameter | undefined,
    ][] = []
    const unwatch = watchBlockNumber(publicClient, {
      pollingInterval: 100,
      onBlockNumber: (blockNumber, prevBlockNumber) =>
        blockNumbers.push([blockNumber, prevBlockNumber]),
    })
    await wait(1000)
    unwatch()
    expect(blockNumbers).toMatchInlineSnapshot(`
      [
        [
          420n,
          undefined,
        ],
        [
          421n,
          420n,
        ],
        [
          424n,
          421n,
        ],
        [
          426n,
          424n,
        ],
        [
          429n,
          426n,
        ],
      ]
    `)
  })

  test('out of order blocks (emitMissed)', async () => {
    vi.spyOn(getBlockNumber, 'getBlockNumber')
      .mockResolvedValueOnce(420n)
      .mockResolvedValueOnce(421n)
      .mockResolvedValueOnce(419n)
      .mockResolvedValueOnce(424n)
      .mockResolvedValueOnce(424n)
      .mockResolvedValueOnce(426n)
      .mockResolvedValueOnce(423n)
      .mockResolvedValueOnce(424n)
      .mockResolvedValueOnce(429n)
      .mockResolvedValueOnce(430n)

    const blockNumbers: [
      OnBlockNumberParameter,
      OnBlockNumberParameter | undefined,
    ][] = []
    const unwatch = watchBlockNumber(publicClient, {
      emitMissed: true,
      pollingInterval: 100,
      onBlockNumber: (blockNumber, prevBlockNumber) =>
        blockNumbers.push([blockNumber, prevBlockNumber]),
    })
    await wait(1000)
    unwatch()
    expect(blockNumbers).toMatchInlineSnapshot(`
      [
        [
          420n,
          undefined,
        ],
        [
          421n,
          420n,
        ],
        [
          422n,
          421n,
        ],
        [
          423n,
          422n,
        ],
        [
          424n,
          423n,
        ],
        [
          425n,
          424n,
        ],
        [
          426n,
          425n,
        ],
        [
          427n,
          426n,
        ],
        [
          428n,
          427n,
        ],
        [
          429n,
          428n,
        ],
      ]
    `)
  })
})

describe('errors', () => {
  test('handles error thrown', async () => {
    vi.spyOn(getBlockNumber, 'getBlockNumber').mockRejectedValue(
      new Error('foo'),
    )

    let unwatch: () => void = () => null
    const error = await new Promise((resolve) => {
      unwatch = watchBlockNumber(publicClient, {
        onBlockNumber: () => null,
        onError: resolve,
      })
    })
    expect(error).toMatchInlineSnapshot('[Error: foo]')
    unwatch()
  })
})
