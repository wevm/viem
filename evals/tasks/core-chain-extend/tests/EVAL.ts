import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { mainnet } from 'viem/chains'
import { withContract } from '../src/index.ts'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('keeps mainnet identity and exposes the new contract entry', () => {
  const chain = withContract({
    contracts: {
      registry: {
        address: '0x000000000000000000000000000000000000c0dE',
      },
    },
  })

  expect(chain.id).toBe(mainnet.id)
  expect(chain.name).toBe(mainnet.name)
  expect(chain.rpcUrls).toEqual(mainnet.rpcUrls)
  expect(chain.contracts.registry.address).toBe(
    '0x000000000000000000000000000000000000c0dE',
  )
}, 60_000)

test('is parameterized and does not mutate mainnet', () => {
  const chain = withContract({
    contracts: {
      paymaster: {
        address: '0x00000000000000000000000000000000DeaDBeef',
      },
    },
  })

  expect(chain.contracts.paymaster.address).toBe(
    '0x00000000000000000000000000000000DeaDBeef',
  )
  expect('registry' in chain.contracts).toBe(false)
  expect('registry' in mainnet.contracts).toBe(false)
  expect('paymaster' in mainnet.contracts).toBe(false)
}, 60_000)

test('preserves the contract key type', () => {
  const chain = withContract({
    contracts: {
      registry: {
        address: '0x000000000000000000000000000000000000c0dE',
      },
    },
  })
  expectTypeOf(chain.contracts.registry.address).toEqualTypeOf<`0x${string}`>()
  // @ts-expect-error Only the supplied key is added.
  expectTypeOf(chain.contracts.paymaster)
}, 60_000)
