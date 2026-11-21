import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import * as Concurrent from './concurrent.js'

const key = fc
  .integer({ min: 0, max: 7 })
  .map((value) => `concurrent-fuzz-${value}`)

describe('detect: fuzz', () => {
  test('isolates keys and cleans up completed requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(key, { minLength: 1, maxLength: 20 }),
        async (keys) => {
          const counts = new Map<string, number>()
          for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1)

          const results = await Promise.all(
            keys.map((key) => Concurrent.detect(key)),
          )

          for (const [index, key] of keys.entries())
            expect(results[index]).toBe((counts.get(key) ?? 0) > 1)

          await Promise.resolve()
          for (const key of new Set(keys))
            expect(await Concurrent.detect(key)).toBe(false)
        },
      ),
      fuzzParameters(250),
    )
  })
})
