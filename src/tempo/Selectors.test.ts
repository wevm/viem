import { AbiItem } from 'ox'
import { describe, expect, test } from 'vitest'

import { Selectors as tempo_Selectors } from 'viem/tempo'

import * as Abis from './Abis.js'
import * as Selectors from './Selectors.js'

type AbiFunction = Extract<(typeof Abis.abis)[number], { type: 'function' }>
type SelectorMap = Record<string, string | Record<string, string>>

const selectorMaps = {
  accountKeychain: Selectors.accountKeychain,
  addressRegistry: Selectors.addressRegistry,
  feeAmm: Selectors.feeAmm,
  feeManager: Selectors.feeManager,
  nonce: Selectors.nonce,
  receivePolicyGuard: Selectors.receivePolicyGuard,
  signatureVerifier: Selectors.signatureVerifier,
  stablecoinDex: Selectors.stablecoinDex,
  storageCredits: Selectors.storageCredits,
  tip20: Selectors.tip20,
  tip20ChannelReserve: Selectors.tip20ChannelReserve,
  tip20Factory: Selectors.tip20Factory,
  tip403Registry: Selectors.tip403Registry,
  validatorConfig: Selectors.validatorConfig,
  validatorConfigV2: Selectors.validatorConfigV2,
} satisfies Record<string, SelectorMap>

// Earn slices are user-deployed contract ABIs. Selectors cover precompiles only.
const earnAbis = new Set<string>([
  'earnFactory',
  'erc4626Engine',
  'vaultAdapter',
  'vaultEngine',
  'vaultEngineAsync',
  'vaultEngineShares',
  'vaultRewards',
  'vedaEngine',
  'zoneGateway',
  'zoneGatewayBase',
  'zoneGatewayCallbackData',
])

const selectorFixtures = Object.entries(Abis)
  .filter(([name]) => name !== 'abis' && !earnAbis.has(name))
  .map(([name, abi]) => ({
    name,
    abi,
    selectors: selectorMaps[name as keyof typeof selectorMaps]!,
  }))
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
  expect(Object.keys(Selectors).sort()).toEqual(Object.keys(selectorMaps))
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
