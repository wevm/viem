import { afterAll, beforeAll, beforeEach, vi } from 'vitest'

import { promiseCache, responseCache } from '../utils/promise/withCache'

beforeAll(() => {
  vi.mock('../errors/utils.ts', async (importOriginal) => {
    const module = await importOriginal()
    return {
      ...(module as {}),
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
})

afterAll(() => {
  vi.resetAllMocks()
})
