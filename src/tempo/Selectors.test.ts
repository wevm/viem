import type { KeyAuthorization } from 'ox/tempo'
import { describe, expect, expectTypeOf, test } from 'vitest'
import type { Hex } from '../types/misc.js'
import { toFunctionSelector } from '../utils/hash/toFunctionSelector.js'
import { toSignature } from '../utils/hash/toSignature.js'
import * as Abis from './Abis.js'
import { Selectors as TempoSelectors } from './index.js'
import * as Selectors from './Selectors.js'

type AbiFunction = Extract<(typeof Abis.abis)[number], { type: 'function' }>

const selectorFixtures = [
  { name: 'tip20', abi: Abis.tip20, selectors: Selectors.tip20 },
  {
    name: 'validatorConfigV2',
    abi: Abis.validatorConfigV2,
    selectors: Selectors.validatorConfigV2,
  },
  {
    name: 'signatureVerifier',
    abi: Abis.signatureVerifier,
    selectors: Selectors.signatureVerifier,
  },
  {
    name: 'stablecoinDex',
    abi: Abis.stablecoinDex,
    selectors: Selectors.stablecoinDex,
  },
  {
    name: 'addressRegistry',
    abi: Abis.addressRegistry,
    selectors: Selectors.addressRegistry,
  },
  { name: 'feeManager', abi: Abis.feeManager, selectors: Selectors.feeManager },
  { name: 'feeAmm', abi: Abis.feeAmm, selectors: Selectors.feeAmm },
  {
    name: 'accountKeychain',
    abi: Abis.accountKeychain,
    selectors: Selectors.accountKeychain,
  },
  { name: 'nonce', abi: Abis.nonce, selectors: Selectors.nonce },
  {
    name: 'tip20Factory',
    abi: Abis.tip20Factory,
    selectors: Selectors.tip20Factory,
  },
  {
    name: 'tip403Registry',
    abi: Abis.tip403Registry,
    selectors: Selectors.tip403Registry,
  },
  {
    name: 'validatorConfig',
    abi: Abis.validatorConfig,
    selectors: Selectors.validatorConfig,
  },
] as const

function getFunctions(abi: readonly unknown[]) {
  return (abi as readonly AbiFunction[]).filter(
    (item) => item.type === 'function',
  )
}

function getSelectorValues(selectors: Record<string, unknown>) {
  return Object.values(selectors).flatMap((selector) =>
    typeof selector === 'string'
      ? [selector]
      : Object.values(selector as Record<string, string>),
  )
}

describe('Selectors', () => {
  test('exports through tempo entrypoint', () => {
    expect(TempoSelectors.tip20.transfer).toBe(Selectors.tip20.transfer)
  })

  test('exports one selector map per ABI', () => {
    expect(Object.keys(Selectors).sort()).toEqual(
      selectorFixtures.map((fixture) => fixture.name).sort(),
    )
    expect(selectorFixtures).toHaveLength(Object.keys(Abis).length - 1)
  })

  test('all selectors are bytes4 hex values', () => {
    for (const { selectors } of selectorFixtures) {
      for (const selector of getSelectorValues(selectors)) {
        expect(selector).toMatch(/^0x[0-9a-f]{8}$/)
      }
    }
  })

  test('selector count matches function count', () => {
    const functionCount = selectorFixtures.reduce(
      (count, { abi }) => count + getFunctions(abi).length,
      0,
    )
    const selectorCount = selectorFixtures.reduce(
      (count, { selectors }) => count + getSelectorValues(selectors).length,
      0,
    )

    expect(selectorCount).toBe(functionCount)
  })

  test('tip20.transfer', () => {
    expect(Selectors.tip20.transfer).toBe('0xa9059cbb')
  })

  test('type: tip20 selector literals', () => {
    expectTypeOf(Selectors.tip20.transfer).toEqualTypeOf<'0xa9059cbb'>()
    expectTypeOf(Selectors.tip20.transfer).toMatchTypeOf<Hex>()

    const scope = {
      address: '0x20c0000000000000000000000000000000000001',
      selector: Selectors.tip20.transfer,
    } satisfies KeyAuthorization.Scope
    expectTypeOf(scope.selector).toEqualTypeOf<'0xa9059cbb'>()

    expectTypeOf(
      Selectors.accountKeychain.authorizeKey[
        'authorizeKey(address,uint8,(uint64,bool,(address,uint256,uint64)[],bool,(address,(bytes4,address[])[])[]))'
      ],
    ).toMatchTypeOf<Hex>()
    expectTypeOf(
      Selectors.accountKeychain.authorizeKey,
    ).not.toMatchTypeOf<Hex>()
  })

  for (const { name, abi, selectors } of selectorFixtures) {
    test(name, () => {
      const functions = getFunctions(abi)
      const functionNames = functions.map((item) => item.name)
      const overloadedNames = new Set(
        functionNames.filter(
          (functionName, index) =>
            functionNames.indexOf(functionName) !== index,
        ),
      )

      for (const item of functions) {
        const selector = selectors[item.name as keyof typeof selectors]
        const expected = toFunctionSelector(item)

        if (overloadedNames.has(item.name)) {
          expect(typeof selector).toBe('object')
          expect(selector).toHaveProperty(toSignature(item), expected)
          continue
        }

        expect(typeof selector).toBe('string')
        expect(selector).toBe(expected)
      }

      for (const overloadedName of overloadedNames) {
        const overloadedFunctions = functions.filter(
          (item) => item.name === overloadedName,
        )
        const selector = selectors[overloadedName as keyof typeof selectors]
        expect(Object.keys(selector as Record<string, string>).sort()).toEqual(
          overloadedFunctions.map((item) => toSignature(item)).sort(),
        )
      }

      expect(Object.keys(selectors).sort()).toEqual(
        Array.from(new Set(functionNames)).sort(),
      )
    })
  }
})
