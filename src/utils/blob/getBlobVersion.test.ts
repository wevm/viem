import { expect, test } from 'vitest'
import { getBlobVersion } from './getBlobVersion.js'

test('default: returns 4844', () => {
  expect(getBlobVersion()).toBe('4844')
})

test('mainnet: returns 4844', () => {
  expect(getBlobVersion({ chainId: 1 })).toBe('4844')
})

test('sepolia: returns 7594', () => {
  expect(getBlobVersion({ chainId: 11_155_111 })).toBe('7594')
})

test('explicit blobVersion overrides chainId', () => {
  // Override Sepolia to use 4844
  expect(getBlobVersion({ chainId: 11_155_111, blobVersion: '4844' })).toBe(
    '4844',
  )

  // Override mainnet to use 7594
  expect(getBlobVersion({ chainId: 1, blobVersion: '7594' })).toBe('7594')
})

test('arbitrary chain: returns 4844', () => {
  expect(getBlobVersion({ chainId: 12345 })).toBe('4844')
})
