import { expect, test } from 'vitest'

import { formatBlockParameter } from './formatBlockParameter.js'

test('returns blockTag when only blockTag is provided', () => {
  expect(formatBlockParameter({ blockTag: 'latest' })).toBe('latest')
  expect(formatBlockParameter({ blockTag: 'earliest' })).toBe('earliest')
  expect(formatBlockParameter({ blockTag: 'pending' })).toBe('pending')
  expect(formatBlockParameter({ blockTag: 'safe' })).toBe('safe')
  expect(formatBlockParameter({ blockTag: 'finalized' })).toBe('finalized')
})

test('returns latest when no parameters provided', () => {
  expect(formatBlockParameter({})).toBe('latest')
})

test('returns hex block number when blockNumber is provided', () => {
  expect(formatBlockParameter({ blockNumber: 0n })).toBe('0x0')
  expect(formatBlockParameter({ blockNumber: 69420n })).toBe('0x10f2c')
  expect(formatBlockParameter({ blockNumber: 21397179n })).toBe('0x1467ebb')
})

test('returns block identifier object when blockHash is provided', () => {
  const blockHash =
    '0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894'

  expect(formatBlockParameter({ blockHash })).toEqual({ blockHash })
})

test('returns block identifier with requireCanonical when true', () => {
  const blockHash =
    '0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894'

  expect(formatBlockParameter({ blockHash, requireCanonical: true })).toEqual({
    blockHash,
    requireCanonical: true,
  })
})

test('omits requireCanonical when false (default per EIP-1898)', () => {
  const blockHash =
    '0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894'

  expect(formatBlockParameter({ blockHash, requireCanonical: false })).toEqual({
    blockHash,
  })
})

test('blockHash takes priority over blockNumber and blockTag', () => {
  const blockHash =
    '0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894'

  expect(
    formatBlockParameter({
      blockHash,
      blockNumber: 123n,
      blockTag: 'latest',
    }),
  ).toEqual({ blockHash })
})

test('blockNumber takes priority over blockTag', () => {
  expect(
    formatBlockParameter({
      blockNumber: 123n,
      blockTag: 'latest',
    }),
  ).toBe('0x7b')
})

test('throws error when requireCanonical is provided without blockHash', () => {
  expect(() => formatBlockParameter({ requireCanonical: true })).toThrowError(
    '`requireCanonical` can only be provided when `blockHash` is set.',
  )

  expect(() =>
    formatBlockParameter({ blockTag: 'latest', requireCanonical: true }),
  ).toThrowError(
    '`requireCanonical` can only be provided when `blockHash` is set.',
  )

  expect(() =>
    formatBlockParameter({ blockNumber: 123n, requireCanonical: true }),
  ).toThrowError(
    '`requireCanonical` can only be provided when `blockHash` is set.',
  )
})
