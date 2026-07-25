import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { mainnet } from 'viem/chains'
import { example } from '../src/index.ts'

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/mainnet\.extend\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('keeps mainnet identity and exposes the new contract entry', async () => {
  const chain = await example()
  expect(chain.id).toBe(mainnet.id)
  expect(chain.name).toBe(mainnet.name)
  expect(chain.rpcUrls).toEqual(mainnet.rpcUrls)
  expect(chain.contracts.registry.address).toBe(
    '0x000000000000000000000000000000000000c0dE',
  )
  expect('registry' in mainnet.contracts).toBe(false)
}, 60_000)
