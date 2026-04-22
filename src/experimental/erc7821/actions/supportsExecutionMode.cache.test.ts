import { beforeEach, expect, test, vi } from 'vitest'

import * as readContract from '../../../actions/public/readContract.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import {
  promiseCache,
  responseCache,
} from '../../../utils/promise/withCache.js'
import { supportsExecutionMode } from './supportsExecutionMode.js'

beforeEach(() => {
  promiseCache.clear()
  responseCache.clear()
  vi.restoreAllMocks()
})

test('behavior: cache key is isolated per client', async () => {
  const address = '0x0000000000000000000000000000000000000001'
  const client_1 = createClient({
    transport: http('https://mock-1.example.com'),
  })
  const client_2 = createClient({
    transport: http('https://mock-2.example.com'),
  })

  const readContractSpy = vi
    .spyOn(readContract, 'readContract')
    .mockResolvedValueOnce(true as never)
    .mockResolvedValueOnce(false as never)

  expect(
    await supportsExecutionMode(client_1, {
      address,
    }),
  ).toBe(true)
  expect(
    await supportsExecutionMode(client_2, {
      address,
    }),
  ).toBe(false)
  expect(readContractSpy).toHaveBeenCalledTimes(2)
})
