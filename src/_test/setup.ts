import { afterAll, beforeAll, beforeEach, vi } from 'vitest'

import { cleanupCache, listenersCache } from '../utils/observe.js'
import { promiseCache, responseCache } from '../utils/promise/withCache.js'
import { setBlockNumber, testClient } from './utils.js'
import { setAutomine, setIntervalMining } from '../test.js'

beforeAll(() => {
  vi.mock('../errors/utils.ts', async () => {
    return {
      getContractAddress: vi
        .fn()
        .mockReturnValue('0x0000000000000000000000000000000000000000'),
      getUrl: vi.fn().mockReturnValue('http://localhost'),
      getVersion: vi.fn().mockReturnValue('viem@1.0.2'),
    }
  })
})

beforeEach(() => {
  promiseCache.clear()
  responseCache.clear()
  listenersCache.clear()
  cleanupCache.clear()
})

afterAll(() => {
  vi.resetAllMocks()
})

afterAll(async () => {
  // NOTE: The downside of doing this here is that it means we'll spawn an anvil instance even for unit tests.
  await setBlockNumber(BigInt(Number(process.env.VITE_ANVIL_BLOCK_NUMBER)))
  await setAutomine(testClient, false)
  await setIntervalMining(testClient, { interval: 1 })
})
