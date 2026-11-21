import { afterEach, beforeAll, beforeEach, vi } from 'vitest'

import { setIntervalMining } from '../src/actions/test/setIntervalMining.js'
import { setErrorConfig } from '../src/errors/base.js'
import { cleanupCache, listenersCache } from '../src/utils/observe.js'
import { promiseCache, responseCache } from '../src/utils/promise/withCache.js'
import { idCache } from '../src/utils/rpc/id.js'
import { socketClientCache } from '../src/utils/rpc/socket.js'
import * as instances from './src/anvil.js'

const client = instances.anvilMainnet.getClient()

beforeAll(() => {
  setErrorConfig({
    getDocsUrl({ docsBaseUrl, docsPath }) {
      return docsPath
        ? `${docsBaseUrl ?? 'https://viem.sh'}${docsPath}`
        : undefined
    },
    version: 'viem@x.y.z',
  })
  vi.mock('../src/errors/utils.ts', () => ({
    getAbortError: vi.fn((signal?: AbortSignal | undefined) => {
      if (signal?.reason) return signal.reason
      return new DOMException('This operation was aborted', 'AbortError')
    }),
    getContractAddress: vi
      .fn()
      .mockReturnValue('0x0000000000000000000000000000000000000000'),
    getUrl: vi.fn().mockReturnValue('http://localhost'),
    isAbortError: vi.fn(
      (error: unknown) =>
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'AbortError',
    ),
  }))
})

beforeEach(async () => {
  idCache.reset()
  promiseCache.clear()
  responseCache.clear()
  listenersCache.clear()
  cleanupCache.clear()
  socketClientCache.clear()

  if (process.env.SKIP_GLOBAL_SETUP) return
  await setIntervalMining(client, { interval: 0 })
}, 20_000)

afterEach(() => {
  vi.restoreAllMocks()
})
