import { ousd, tokens } from 'viem/tokens'
import { expect, test } from 'vitest'

test('canonical OUSD addresses', () => {
  expect(ousd.addresses).toMatchInlineSnapshot(`
    {
      "1": "0x9f6F3991D525015a6F8CaF062C83b62fD3AC4436",
      "4217": "0x20c0000000000000000000006a37DA5C996874BE",
      "8453": "0xB2000000000000000000002fEb517dFeC7415344",
    }
  `)
})

test('OUSD metadata', () => {
  expect(ousd(4217)).toMatchInlineSnapshot(`
    {
      "address": "0x20c0000000000000000000006a37DA5C996874BE",
      "currency": "USD",
      "decimals": 6,
      "name": "OpenUSD",
      "popular": undefined,
      "symbol": "OUSD",
    }
  `)
})

test.each([
  { name: 'all', set: tokens.all },
  { name: 'tempo', set: tokens.tempo },
])('includes one canonical OUSD definition in tokens.$name', ({ set }) => {
  expect(set.filter((token) => token.symbol === 'OUSD')).toEqual([ousd])
})
