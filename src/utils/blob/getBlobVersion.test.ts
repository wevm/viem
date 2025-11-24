import { expect, test } from 'vitest'
import {
  FUSAKA_ACTIVATION_MAINNET_TIMESTAMP,
  getBlobVersion,
} from './getBlobVersion.js'

test('default: returns 4844', () => {
  expect(getBlobVersion()).toBe('4844')
})

test('mainnet before Fusaka activation: returns 4844', () => {
  expect(
    getBlobVersion({
      chainId: 1,
      currentTimestamp: FUSAKA_ACTIVATION_MAINNET_TIMESTAMP - 1,
    }),
  ).toBe('4844')
})

test('mainnet after Fusaka activation: returns 7594', () => {
  expect(
    getBlobVersion({
      chainId: 1,
      currentTimestamp: FUSAKA_ACTIVATION_MAINNET_TIMESTAMP,
    }),
  ).toBe('7594')
  expect(
    getBlobVersion({
      chainId: 1,
      currentTimestamp: FUSAKA_ACTIVATION_MAINNET_TIMESTAMP + 1,
    }),
  ).toBe('7594')
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
