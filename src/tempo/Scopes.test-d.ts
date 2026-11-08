import type { Hex } from 'ox'
import type { KeyAuthorization } from 'ox/tempo'
import { expect, expectTypeOf, test } from 'vitest'

import * as Scopes from './Scopes.js'
import * as Selectors from './Selectors.js'

const pathUsd = '0x20c0000000000000000000000000000000000001'

test('scopes are KeyAuthorization.Scope compatible', () => {
  const transfer = Scopes.tip20(pathUsd).transfer()
  expectTypeOf(transfer).toMatchTypeOf<KeyAuthorization.Scope>()
  expectTypeOf(transfer.selector).toEqualTypeOf<
    typeof Selectors.tip20.transfer | undefined
  >()
  expectTypeOf(transfer.selector).toMatchTypeOf<Hex.Hex | undefined>()

  const raw = [
    { address: pathUsd, selector: Selectors.tip20.transfer },
    Scopes.tip20(pathUsd).transfer(),
    Scopes.target(pathUsd).selector(Selectors.tip20.approve),
    Scopes.contract(pathUsd, Selectors.stablecoinDex).swapExactAmountOut(),
    Scopes.target(pathUsd).any(),
  ] satisfies KeyAuthorization.Scope[]
  expect(raw).toHaveLength(5)
})

test('contract preserves selector literals', () => {
  const scope = Scopes.contract(
    pathUsd,
    Selectors.stablecoinDex,
  ).swapExactAmountIn()
  expectTypeOf(scope.selector).toEqualTypeOf<
    typeof Selectors.stablecoinDex.swapExactAmountIn | undefined
  >()
})
