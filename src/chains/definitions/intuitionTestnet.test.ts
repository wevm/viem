import { expect, test } from 'vitest'

import { intuitionTestnet } from './intuitionTestnet.js'

test('intuitionTestnet', () => {
  expect(intuitionTestnet.id).toMatchInlineSnapshot('13579')
  expect(intuitionTestnet.name).toMatchInlineSnapshot('"Intuition Testnet"')
  expect(intuitionTestnet.nativeCurrency).toMatchInlineSnapshot(`
    {
      "decimals": 18,
      "name": "tTRUST",
      "symbol": "tTRUST",
    }
  `)
  expect(intuitionTestnet.rpcUrls.default.http).toMatchInlineSnapshot(`
    [
      "https://testnet.rpc.intuition.systems",
    ]
  `)
  expect(intuitionTestnet.blockExplorers?.default.url).toMatchInlineSnapshot(
    '"https://testnet.explorer.intuition.systems"',
  )
  expect(intuitionTestnet.sourceId).toMatchInlineSnapshot('8453')
  expect(intuitionTestnet.testnet).toMatchInlineSnapshot('true')
})
