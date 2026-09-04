import { AbiItem } from 'ox'
import { describe, expect, test } from 'vitest'

import { Selectors as tempo_Selectors } from 'viem/tempo'

import * as Abis from './Abis.js'
import * as Selectors from './Selectors.js'

type AbiFunction = Extract<(typeof Abis.all)[number], { type: 'function' }>
type SelectorMap = Record<string, string | Record<string, string>>

const selectorDefinitions = {
  accountKeychain: {
    abi: Abis.accountKeychain,
    selectors: Selectors.accountKeychain,
  },
  addressRegistry: {
    abi: Abis.addressRegistry,
    selectors: Selectors.addressRegistry,
  },
  currentCommittee: {
    abi: Abis.currentCommittee,
    selectors: Selectors.currentCommittee,
  },
  feeAmm: { abi: Abis.feeAmm, selectors: Selectors.feeAmm },
  feeManager: { abi: Abis.feeManager, selectors: Selectors.feeManager },
  nativeMultisig: {
    abi: Abis.nativeMultisig,
    selectors: Selectors.nativeMultisig,
  },
  nonce: { abi: Abis.nonce, selectors: Selectors.nonce },
  receivePolicyGuard: {
    abi: Abis.receivePolicyGuard,
    selectors: Selectors.receivePolicyGuard,
  },
  signatureVerifier: {
    abi: Abis.signatureVerifier,
    selectors: Selectors.signatureVerifier,
  },
  stablecoinDex: {
    abi: Abis.stablecoinDex,
    selectors: Selectors.stablecoinDex,
  },
  storageCredits: {
    abi: Abis.storageCredits,
    selectors: Selectors.storageCredits,
  },
  tip20: { abi: Abis.tip20, selectors: Selectors.tip20 },
  tip20ChannelReserve: {
    abi: Abis.tip20ChannelReserve,
    selectors: Selectors.tip20ChannelReserve,
  },
  tip20Factory: {
    abi: Abis.tip20Factory,
    selectors: Selectors.tip20Factory,
  },
  tip403Registry: {
    abi: Abis.tip403Registry,
    selectors: Selectors.tip403Registry,
  },
  validatorConfig: {
    abi: Abis.validatorConfig,
    selectors: Selectors.validatorConfig,
  },
  validatorConfigV2: {
    abi: Abis.validatorConfigV2,
    selectors: Selectors.validatorConfigV2,
  },
  zoneFactory: {
    abi: Abis.zoneFactory,
    selectors: Selectors.zoneFactory,
  },
  zoneMessenger: {
    abi: Abis.zoneMessenger,
    selectors: Selectors.zoneMessenger,
  },
  zoneOutbox: {
    abi: Abis.zoneOutbox,
    selectors: Selectors.zoneOutbox,
  },
  zonePortal: {
    abi: Abis.zonePortal,
    selectors: Selectors.zonePortal,
  },
  zoneVerifier: {
    abi: Abis.zoneVerifier,
    selectors: Selectors.zoneVerifier,
  },
} satisfies Record<string, { abi: readonly unknown[]; selectors: SelectorMap }>

const selectorFixtures = Object.entries(selectorDefinitions)
  .map(([name, { abi, selectors }]) => ({ name, abi, selectors }))
  .filter(({ abi }) => getFunctions(abi).length > 0)

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

test('exports through tempo entrypoint', () => {
  expect(tempo_Selectors).toBe(Selectors)
})

test('exports one selector map per ABI', () => {
  expect(Object.keys(Selectors).sort()).toEqual(
    Object.keys(selectorDefinitions),
  )
  expect(Object.keys(Selectors).sort()).toEqual(
    selectorFixtures.map((fixture) => fixture.name).sort(),
  )
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

describe('consistency', () => {
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
        const expected = AbiItem.getSelector(item)

        if (overloadedNames.has(item.name)) {
          expect(typeof selector).toBe('object')
          expect(selector).toHaveProperty(AbiItem.getSignature(item), expected)
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
          overloadedFunctions.map((item) => AbiItem.getSignature(item)).sort(),
        )
      }

      expect(Object.keys(selectors).sort()).toEqual(
        Array.from(new Set(functionNames)).sort(),
      )
    })
  }
})
