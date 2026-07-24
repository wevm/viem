import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { recoverOrderAddress, signOrder } from '../src/index.ts'

const key0 =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const
const key1 =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as const
const address0 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const address1 = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'

const order = {
  maker: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  taker: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  amount: 1_000_000n,
  nonce: 1n,
} as const

// RFC-6979 deterministic signature over the fixed order, signed by key0.
const signature =
  '0xe461dac66e03c75f167cd6c0c070dfce734f0013a851c89e96aff7e6f2da62585cf8cc1de0e056c6d44a6450e83c45ffc54d642e840685de720dd25edf83a9441b'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('signs the fixed order deterministically', async () => {
  expect(await signOrder({ order, privateKey: key0 })).toBe(signature)
})

test('recovers the address synchronously', () => {
  const recovered = recoverOrderAddress({ order, signature })
  expect(typeof recovered).toBe('string')
  expect(recovered.toLowerCase()).toBe(address0)
})

test('tampered order recovers a different address', () => {
  const tampered = { ...order, amount: 2_000_000n }
  const recovered = recoverOrderAddress({ order: tampered, signature })
  expect(recovered.toLowerCase()).toMatch(/^0x[0-9a-f]{40}$/)
  expect(recovered.toLowerCase()).not.toBe(address0)
})

test('round-trips for another account', async () => {
  const other = await signOrder({ order, privateKey: key1 })
  expect(other).not.toBe(signature)
  expect(recoverOrderAddress({ order, signature: other }).toLowerCase()).toBe(
    address1,
  )
})
