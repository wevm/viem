import { fetchLogs } from '@viem/anvil'

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'

import { cleanupCache, listenersCache } from '../utils/observe.js'
import { promiseCache, responseCache } from '../utils/promise/withCache.js'

import { setIntervalMining } from '../test.js'
import { socketsCache } from '../utils/rpc.js'
import { forkBlockNumber, poolId } from './constants.js'
import { setBlockNumber, testClient } from './utils.js'

beforeAll(() => {
  vi.mock('../errors/utils.ts', () => ({
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
  socketsCache.clear()

  await setIntervalMining(testClient, { interval: 0 })
})

afterAll(async () => {
  vi.restoreAllMocks()

  // Reset the anvil instance to the same state it was in before the tests started.
  await setBlockNumber(forkBlockNumber)
})

afterEach((context) => {
  // Print the last log entries from anvil after each test.
  context.onTestFailed(async (result) => {
    try {
      const response = await fetchLogs('http://127.0.0.1:8545', poolId)
      const logs = response.slice(-20)

      if (logs.length === 0) {
        return
      }

      // Try to append the log messages to the vitest error message if possible. Otherwise, print them to the console.
      const error = result.errors?.[0]

      if (error !== undefined) {
        error.message +=
          '\n\nAnvil log output\n=======================================\n'
        error.message += `\n${logs.join('\n')}`
      } else {
        console.log(...logs)
      }
    } catch {}
  })
})
