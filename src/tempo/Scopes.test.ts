import { expect, test } from 'vitest'

import { Scopes as tempo_Scopes } from 'viem/tempo'

import * as Scopes from './Scopes.js'
import * as Selectors from './Selectors.js'

const pathUsd = '0x20c0000000000000000000000000000000000001'
const recipient = '0x0000000000000000000000000000000000000001'

test('exports through tempo entrypoint', () => {
  expect(tempo_Scopes).toBe(Scopes)
})

test('target.any', () => {
  const scope = Scopes.target(pathUsd).any()
  expect(scope).toEqual({ address: pathUsd })
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
  expect(Scopes.tip20(pathUsd).transfer({ recipients: [recipient] })).toEqual({
    address: pathUsd,
    recipients: [recipient],
    selector: Selectors.tip20.transfer,
  })
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
