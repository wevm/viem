import { afterAll, beforeAll, beforeEach, vi } from 'vitest'

import { setIntervalMining } from '~viem/actions/test/setIntervalMining.js'
import { cleanupCache, listenersCache } from '~viem/utils/observe.js'
import { promiseCache, responseCache } from '~viem/utils/promise/withCache.js'
import { socketClientCache } from '~viem/utils/rpc/socket.js'

import { instances } from './globalSetup.js'
import { anvilMainnet } from './src/anvil.js'

const client = anvilMainnet.getClient()

beforeAll(() => {
  vi.mock('../src/errors/utils.ts', () => ({
    getContractAddress: vi
      .fn()
      .mockReturnValue('0x0000000000000000000000000000000000000000'),
    getUrl: vi.fn().mockReturnValue('http://localhost'),
    getVersion: vi.fn().mockReturnValue('viem@1.0.2'),
  }))
})

beforeEach(async () => {
  promiseCache.clear()
  responseCache.clear()
  listenersCache.clear()
  cleanupCache.clear()
  socketClientCache.clear()

  if (process.env.SKIP_GLOBAL_SETUP) return
  await setIntervalMining(client, { interval: 0 })
}, 20_000)

afterAll(async () => {
  vi.restoreAllMocks()

  if (process.env.SKIP_GLOBAL_SETUP) return
  // Reset the anvil instances to the same state it was in before the tests started.
  await Promise.all(instances.map((instance) => instance.restart()))
})
