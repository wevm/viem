import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { decodeBlobs, encodeBlobs } from '../src/index.ts'

// EIP-4844: 4096 field elements of 32 bytes each.
const bytesPerBlob = 131_072
// ox packing: 31 usable bytes per 32-byte field element.
const usableBytesPerBlob = 31 * 4096

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('round trips a multi-KB string', () => {
  const value = 'The quick brown fox jumps over the lazy blob. '.repeat(256)
  expect(value.length).toBeGreaterThan(10_000)
  expect(decodeBlobs({ blobs: encodeBlobs({ value }) })).toBe(value)
})

test('blobs have the EIP-4844 shape', () => {
  const value = 'x'.repeat(12_000)
  const blobs = encodeBlobs({ value })
  expect(blobs.length).toBe(1)
  for (const blob of blobs) {
    expect(blob).toMatch(/^0x[0-9a-fA-F]+$/)
    expect(blob.length).toBe(2 + bytesPerBlob * 2)
  }
})

test('data past one blob capacity spans two blobs and round trips', () => {
  const value = 'y'.repeat(usableBytesPerBlob + 1_000)
  const blobs = encodeBlobs({ value })
  expect(blobs.length).toBe(2)
  for (const blob of blobs) expect(blob.length).toBe(2 + bytesPerBlob * 2)
  expect(decodeBlobs({ blobs })).toBe(value)
})
