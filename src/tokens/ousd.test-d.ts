import { ousd } from 'viem/tokens'
import { expectTypeOf, test } from 'vitest'

test('preserves OUSD metadata and chain-specific addresses', () => {
  expectTypeOf(ousd).parameter(0).toEqualTypeOf<1 | 4217 | 8453>()
  expectTypeOf(ousd(8453)).toEqualTypeOf<{
    address: '0xB2000000000000000000002fEb517dFeC7415344'
    currency: 'USD'
    decimals: 6
    name: 'OpenUSD'
    popular: undefined
    symbol: 'OUSD'
  }>()
})
