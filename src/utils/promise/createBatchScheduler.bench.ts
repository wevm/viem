import { bench, describe } from 'vitest'

import { uid } from '../uid.js'
import { createBatchScheduler } from './createBatchScheduler.js'

for (const count of [100, 1_000, 5_000])
  describe(`Schedule ${count} items in one tick`, () => {
    bench('viem: `createBatchScheduler`', async () => {
      const id = uid()
      const promises = []
      for (let i = 0; i < count; i++) {
        // Callers create a scheduler per request and share the queue by `id`.
        const { schedule } = createBatchScheduler({
          id,
          fn: async (args: number[]) => args,
          shouldSplitBatch: (size) => size > 10_000,
        })
        promises.push(schedule(i))
      }
      await Promise.all(promises)
    })
  })
