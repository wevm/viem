import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

// Signed vector: dev key 0 over the fields below (independently computed).
const signed = {
  chainId: 1,
  nonce: 785n,
  maxPriorityFeePerGas: 2_000_000_000n,
  maxFeePerGas: 20_000_000_000n,
  gas: 21_000n,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1_000_000_000_000_000_000n,
  data: '0xdeadbeef',
  yParity: 0,
  r: '0xa5b80dfdacf4e6381a4ddce65df848eb313bde2878cb490613b4fa566ad23884',
  s: '0x1d53222d3bf7436eb076c63ea236ae2ce4a45544fbaf48236c1b9ca4f91133e6',
} as const

const signedSerialized =
  '0x02f8790182031184773594008504a817c8008252089470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000084deadbeefc080a0a5b80dfdacf4e6381a4ddce65df848eb313bde2878cb490613b4fa566ad23884a01d53222d3bf7436eb076c63ea236ae2ce4a45544fbaf48236c1b9ca4f91133e6'

const signedHash =
  '0x1e2d50dad46a6c82988ab9ed66457f18ad50bdb2c09fd1872a13134dae5812d7'

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/TxEnvelopeEip1559\.serialize\(/)
  expect(source).toMatch(/TxEnvelopeEip1559\.deserialize\(/)
  expect(source).toMatch(/TxEnvelopeEip1559\.hash\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('serializes, deserializes, and hashes the fixed transaction', async () => {
  const result = await example()
  expect(result.serialized.toLowerCase()).toBe(signedSerialized)
  expect(result.deserialized).toMatchObject(signed)
  expect(result.hash.toLowerCase()).toBe(signedHash)
}, 60_000)
