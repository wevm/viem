import { afterAll, beforeAll, beforeEach, vi } from 'vitest'

import { cleanupCache, listenersCache } from '../utils/observe.js'
import { promiseCache, responseCache } from '../utils/promise/withCache.js'

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
