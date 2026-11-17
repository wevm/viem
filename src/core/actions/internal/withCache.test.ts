import { expect, test } from 'vitest'

import { responseCache, withCache } from './withCache.js'

test('behavior: keeps at most 8192 responses', async () => {
  for (let i = 0; i < 8200; i++)
    await withCache(async () => i, { cacheKey: `bounded.${i}` })

  expect({
    first: responseCache.has('bounded.0'),
    last: responseCache.has('bounded.8199'),
    size: responseCache.size,
  }).toMatchInlineSnapshot(`
    {
      "first": false,
      "last": true,
      "size": 8192,
    }
  `)
})
