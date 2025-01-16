import { Caches } from 'ox'
import { afterAll, beforeAll, beforeEach, vi } from 'vitest'

import * as Anvil from './src/anvil.js'

beforeAll(() => {
  vi.mock('../src/core/internal/errors.ts', async () => ({
    ...(await vi.importActual('../src/core/internal/errors.ts')),
    getVersion: vi.fn().mockReturnValue('x.y.z'),
    getUrl: vi.fn().mockReturnValue('https://viem.sh/rpc'),
  }))
})

beforeEach(() => {
  Caches.clear()
})

afterAll(async () => {
  vi.restoreAllMocks()

  // Reset the anvil instances to the same state it was in before the tests started.
  await Promise.all(
    Object.values(Anvil.instances).map((instance) => instance.restart()),
  )
})
