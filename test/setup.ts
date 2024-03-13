import { fetchLogs } from '@viem/anvil'

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'

import { setIntervalMining } from '~viem/actions/test/setIntervalMining.js'
import { cleanupCache, listenersCache } from '~viem/utils/observe.js'
import { promiseCache, responseCache } from '~viem/utils/promise/withCache.js'
import { socketClientCache } from '~viem/utils/rpc/socket.js'

import { forkBlockNumber, poolId } from './src/constants.js'
import { setBlockNumber, testClient } from './src/utils.js'

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
  await setIntervalMining(testClient, { interval: 0 })
}, 20_000)

afterAll(async () => {
  vi.restoreAllMocks()

  if (process.env.SKIP_GLOBAL_SETUP) return
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
