import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { decodeBalanceResult, encodeTransferData } from '../src/index.ts'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('encodes transfer calldata', () => {
  expect(
    encodeTransferData({
      amount: 1_000_000n,
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    }).toLowerCase(),
  ).toBe(
    '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c800000000000000000000000000000000000000000000000000000000000f4240',
  )
  expect(
    encodeTransferData({
      amount: 123_456_789n,
      to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    }).toLowerCase(),
  ).toBe(
    '0xa9059cbb000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000075bcd15',
  )
})

test('decodes a balance result', () => {
  expect(
    decodeBalanceResult({
      data: '0x000000000000000000000000000000000000000000000000000000076bbef763',
    }),
  ).toBe(31_872_448_355n)
  expect(
    decodeBalanceResult({
      data: '0x000000000000000000000000000000000000000000000000000000000000002a',
    }),
  ).toBe(42n)
})
