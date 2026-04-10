import { expect, test } from 'vitest'

import { intuition } from './intuition.js'

test('intuition', () => {
  expect(intuition.id).toMatchInlineSnapshot('1155')
  expect(intuition.name).toMatchInlineSnapshot('"Intuition"')
  expect(intuition.nativeCurrency).toMatchInlineSnapshot(`
    {
      "decimals": 18,
      "name": "TRUST",
      "symbol": "TRUST",
    }
  `)
  expect(intuition.rpcUrls.default.http).toMatchInlineSnapshot(`
    [
      "https://rpc.intuition.systems",
    ]
  `)
  expect(intuition.blockExplorers?.default.url).toMatchInlineSnapshot(
    '"https://explorer.intuition.systems"',
  )
  expect(intuition.sourceId).toMatchInlineSnapshot('8453')
})
