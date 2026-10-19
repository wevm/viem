import type { KeyAuthorization } from 'ox/tempo'
import { describe, expect, expectTypeOf, test } from 'vitest'
import type { Hex } from '../types/misc.js'
import { Scopes as TempoScopes } from './index.js'
import * as Scopes from './Scopes.js'
import * as Selectors from './Selectors.js'

const pathUsd = '0x20c0000000000000000000000000000000000001'
const recipient = '0x0000000000000000000000000000000000000001'

describe('Scopes', () => {
  test('exports through tempo entrypoint', () => {
    expect(TempoScopes.tip20(pathUsd).transfer()).toEqual(
      Scopes.tip20(pathUsd).transfer(),
    )
  })

  test('target.any', () => {
    const scope = Scopes.target(pathUsd).any()
    expect(scope).toEqual({ address: pathUsd })
    expect(scope).toEqual({ address: pathUsd } satisfies KeyAuthorization.Scope)
  })

  test('target.selector', () => {
    const scope = Scopes.target(pathUsd).selector(Selectors.tip20.transfer)
    expect(scope).toEqual({
      address: pathUsd,
      selector: Selectors.tip20.transfer,
    })
  })

  test('target.selector with recipients', () => {
    const scope = Scopes.target(pathUsd).selector(Selectors.tip20.transfer, {
      recipients: [recipient],
    })
    expect(scope).toEqual({
      address: pathUsd,
      recipients: [recipient],
      selector: Selectors.tip20.transfer,
    })
  })

  test('tip20.transfer', () => {
    expect(Scopes.tip20(pathUsd).transfer()).toEqual({
      address: pathUsd,
      selector: Selectors.tip20.transfer,
    })
  })

  test('tip20.transfer with recipients', () => {
    expect(Scopes.tip20(pathUsd).transfer({ recipients: [recipient] })).toEqual(
      {
        address: pathUsd,
        recipients: [recipient],
        selector: Selectors.tip20.transfer,
      },
    )
  })

  test('tip20.approve', () => {
    expect(Scopes.tip20(pathUsd).approve()).toEqual({
      address: pathUsd,
      selector: Selectors.tip20.approve,
    })
  })

  test('tip20.transferWithMemo', () => {
    expect(Scopes.tip20(pathUsd).transferWithMemo()).toEqual({
      address: pathUsd,
      selector: Selectors.tip20.transferWithMemo,
    })
  })

  test('contract', () => {
    const scope = Scopes.contract(
      pathUsd,
      Selectors.stablecoinDex,
    ).swapExactAmountIn()
    expect(scope).toEqual({
      address: pathUsd,
      selector: Selectors.stablecoinDex.swapExactAmountIn,
    })
    expectTypeOf(scope.selector).toEqualTypeOf<
      typeof Selectors.stablecoinDex.swapExactAmountIn | undefined
    >()
  })

  test('contract with overloaded selectors', () => {
    const scope = Scopes.contract(
      pathUsd,
      Selectors.tip20Factory,
    ).createToken.selector(
      'createToken(string,string,string,address,address,bytes32,string)',
    )
    expect(scope).toEqual({
      address: pathUsd,
      selector:
        Selectors.tip20Factory.createToken[
          'createToken(string,string,string,address,address,bytes32,string)'
        ],
    })

    const bracketScope = Scopes.contract(
      pathUsd,
      Selectors.tip20Factory,
    ).createToken['createToken(string,string,string,address,address,bytes32)']()
    expect(bracketScope).toEqual({
      address: pathUsd,
      selector:
        Selectors.tip20Factory.createToken[
          'createToken(string,string,string,address,address,bytes32)'
        ],
    })
  })

  test('type: scope compatibility', () => {
    const transfer = Scopes.tip20(pathUsd).transfer()
    expectTypeOf(transfer).toMatchTypeOf<KeyAuthorization.Scope>()
    expectTypeOf(transfer.selector).toEqualTypeOf<
      typeof Selectors.tip20.transfer | undefined
    >()
    expectTypeOf(transfer.selector).toMatchTypeOf<Hex | undefined>()

    const raw = [
      { address: pathUsd, selector: Selectors.tip20.transfer },
      Scopes.tip20(pathUsd).transfer(),
      Scopes.target(pathUsd).selector(Selectors.tip20.approve),
      Scopes.contract(pathUsd, Selectors.stablecoinDex).swapExactAmountOut(),
      Scopes.target(pathUsd).any(),
    ] satisfies KeyAuthorization.Scope[]
    expect(raw).toHaveLength(5)
  })
})
