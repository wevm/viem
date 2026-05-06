import { readFileSync } from 'node:fs'
import { afterEach, beforeAll, beforeEach, type TestContext, vi } from 'vitest'

import { setIntervalMining } from '../src/actions/test/setIntervalMining.js'
import { setErrorConfig } from '../src/errors/base.js'
import { cleanupCache, listenersCache } from '../src/utils/observe.js'
import { promiseCache, responseCache } from '../src/utils/promise/withCache.js'
import { withRetry } from '../src/utils/promise/withRetry.js'
import { withTimeout } from '../src/utils/promise/withTimeout.js'
import { idCache } from '../src/utils/rpc/id.js'
import { socketClientCache } from '../src/utils/rpc/socket.js'

const usesAnvilCache = new Map<string, boolean>()

function testFileUsesAnvil(context: TestContext) {
  const file = context.task.file
  const filepath = file.filepath
  const cached = usesAnvilCache.get(filepath)
  if (cached !== undefined) return cached

  const importPaths = Object.keys(file.importDurations ?? {})
  const usesAnvil =
    importPaths.some((path) => path.includes('/test/src/anvil.ts')) ||
    readFileSync(filepath, 'utf8').match(
      /~test\/(?:account-abstraction|anvil|bench|bundler|utils)\.js/,
    ) !== null
  usesAnvilCache.set(filepath, usesAnvil)
  return usesAnvil
}

function isResetRetryable(error: Error) {
  return (
    error.message === 'timed out' ||
    (typeof (error as any)?.status === 'number' &&
      (error as any).status === 400)
  )
}

async function resetIntervalMining() {
  const isCi = process.env.CI === 'true'
  const { anvilMainnet } = await import('./src/anvil.js')
  const client = anvilMainnet.getClient()
  if (!isCi) return await setIntervalMining(client, { interval: 0 })

  const reset = () =>
    withRetry(
      () =>
        withTimeout(() => setIntervalMining(client, { interval: 0 }), {
          timeout: 8_000,
        }),
      {
        delay: ({ count }) => (count + 1) * 300,
        retryCount: 1,
        shouldRetry: ({ error }) => isResetRetryable(error),
      },
    )

  try {
    await reset()
  } catch {
    await withTimeout(() => anvilMainnet.restart(), {
      timeout: 5_000,
    }).catch(() => {})
    await reset()
  }
}

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
    getContractAddress: vi
      .fn()
      .mockReturnValue('0x0000000000000000000000000000000000000000'),
    getUrl: vi.fn().mockReturnValue('http://localhost'),
  }))
})

beforeEach(async (context) => {
  idCache.reset()
  promiseCache.clear()
  responseCache.clear()
  listenersCache.clear()
  cleanupCache.clear()
  socketClientCache.clear()

  if (process.env.SKIP_GLOBAL_SETUP) return
  if (process.env.CI === 'true' && !testFileUsesAnvil(context)) {
    idCache.take()
    return
  }
  await resetIntervalMining()
})

afterEach(() => {
  vi.restoreAllMocks()
})
