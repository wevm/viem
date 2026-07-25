import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const bytesPerBlob = 131_072

test('exports a zero-input Viem example', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('round trips data spanning two EIP-4844 blobs', async () => {
  const { blobs, value } = await example()
  expect(value).toBe('y'.repeat(31 * 4096 + 1_000))
  expect(blobs).toHaveLength(2)
  for (const blob of blobs) {
    expect(blob).toMatch(/^0x[0-9a-fA-F]+$/)
    expect(blob.length).toBe(2 + bytesPerBlob * 2)
  }
}, 60_000)
