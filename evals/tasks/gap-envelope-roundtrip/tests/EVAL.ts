import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import {
  deserializeTransaction,
  hashTransaction,
  serializeTransaction,
} from '../src/index.ts'

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
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('serializes a signed transaction to the exact wire bytes', () => {
  expect(serializeTransaction({ tx: signed }).toLowerCase()).toBe(
    signedSerialized,
  )
})

test('deserializes wire bytes back to the exact fields', () => {
  const tx = deserializeTransaction({ serialized: signedSerialized })
  expect(tx).toMatchObject(signed)
})

test('round-trips a signed transaction losslessly', () => {
  expect(
    deserializeTransaction({
      serialized: serializeTransaction({ tx: signed }),
    }),
  ).toMatchObject(signed)
})

test('round-trips an unsigned transaction losslessly', () => {
  const tx = {
    chainId: 10,
    nonce: 0n,
    maxPriorityFeePerGas: 1_500_000_000n,
    maxFeePerGas: 30_000_000_000n,
    gas: 53_000n,
    to: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    value: 42n,
  } as const
  const roundtripped = deserializeTransaction({
    serialized: serializeTransaction({ tx }),
  })
  expect(roundtripped).toMatchObject(tx)
  expect(roundtripped.data).toBeUndefined()
  expect(roundtripped.yParity).toBeUndefined()
  expect(roundtripped.r).toBeUndefined()
  expect(roundtripped.s).toBeUndefined()
})

test('computes the transaction hash of a signed transaction', () => {
  expect(hashTransaction({ tx: signed }).toLowerCase()).toBe(signedHash)
})
