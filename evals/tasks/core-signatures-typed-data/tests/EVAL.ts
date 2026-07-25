import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const address0 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

// RFC-6979 deterministic signature over the fixed order, signed by key0.
const signature =
  '0xe461dac66e03c75f167cd6c0c070dfce734f0013a851c89e96aff7e6f2da62585cf8cc1de0e056c6d44a6450e83c45ffc54d642e840685de720dd25edf83a9441b'

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\.signTypedData\(/)
  expect(source).toMatch(/TypedData\.recoverAddress\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('signs and recovers the fixed order', async () => {
  const result = await example()
  expect(result.signature).toBe(signature)
  expect(result.recovered.toLowerCase()).toBe(address0)
  expect(result.changedRecovered.toLowerCase()).toMatch(/^0x[0-9a-f]{40}$/)
  expect(result.changedRecovered.toLowerCase()).not.toBe(address0)
}, 60_000)
