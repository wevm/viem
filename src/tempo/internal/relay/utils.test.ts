import { describe, expect, test } from 'vitest'
import { normalizeFillTransactionRequest } from './utils.js'

describe('normalizeFillTransactionRequest', () => {
  test.each([null, undefined, [], 'call', 1, true])(
    'rejects malformed call entries: %s',
    (call) => {
      expect(() =>
        normalizeFillTransactionRequest({ calls: [call] }),
      ).toThrowError(
        expect.objectContaining({
          code: -32602,
          message: 'Expected a transaction call object.',
        }),
      )
    },
  )

  test.each(['0xzz', '0x-1', '0x1.5', '0x1 ', '0x0g'])(
    'rejects malformed values in calls and legacy transactions: %s',
    (value) => {
      for (const transaction of [{ value }, { calls: [{ value }] }])
        expect(() => normalizeFillTransactionRequest(transaction)).toThrowError(
          expect.objectContaining({
            code: -32602,
            message: 'Invalid transaction value.',
          }),
        )
    },
  )

  test.each([
    { value: '0x', expected: 0n },
    { value: '0x0', expected: 0n },
    { value: '0xA', expected: 10n },
    { value: 1n, expected: 1n },
  ])('normalizes valid transaction values: $value', ({ value, expected }) => {
    expect(normalizeFillTransactionRequest({ value })).toEqual({
      calls: [{ value: expected }],
    })
    expect(normalizeFillTransactionRequest({ calls: [{ value }] })).toEqual({
      calls: [{ value: expected }],
    })
  })
})
