import type { Hex } from 'ox'
import type { KeyAuthorization } from 'ox/tempo'
import { expectTypeOf, test } from 'vitest'

import * as Selectors from './Selectors.js'

test('selector literals are preserved', () => {
  expectTypeOf(Selectors.tip20.transfer).toEqualTypeOf<'0xa9059cbb'>()
  expectTypeOf(Selectors.tip20.transfer).toMatchTypeOf<Hex.Hex>()

  const scope = {
    address: '0x20c0000000000000000000000000000000000001',
    selector: Selectors.tip20.transfer,
  } satisfies KeyAuthorization.Scope
  expectTypeOf(scope.selector).toEqualTypeOf<'0xa9059cbb'>()
})

test('overloaded selectors are signature-keyed maps', () => {
  expectTypeOf(
    Selectors.accountKeychain.authorizeKey[
      'authorizeKey(address,uint8,(uint64,bool,(address,uint256,uint64)[],bool,(address,(bytes4,address[])[])[]))'
    ],
  ).toMatchTypeOf<Hex.Hex>()
  expectTypeOf(
    Selectors.accountKeychain.authorizeKey,
  ).not.toMatchTypeOf<Hex.Hex>()
})
