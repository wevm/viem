import { RpcResponse } from 'ox'
import { describe, expect, test } from 'vitest'
import { normalizeFillTransactionRequest, toRpcError } from './utils.js'

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

describe('toRpcError', () => {
  test('preserves the original RPC error class through wrappers', () => {
    const error = new RpcResponse.InvalidParamsError({
      message: 'Conflicting chain ids.',
    })
    expect(toRpcError(error)).toBe(error)
    expect(toRpcError(new Error('Request failed', { cause: error }))).toBe(
      error,
    )
  })

  test('normalizes expired transactions even when already an RPC error', () => {
    const error = new RpcResponse.InternalError({
      message: 'Revm error: transaction expired',
    })
    expect(toRpcError(error)).toBeInstanceOf(
      RpcResponse.TransactionRejectedError,
    )
    expect(toRpcError(error)).toMatchObject({
      message: 'Transaction expired.',
      data: { code: 'transaction_expired' },
    })
  })
})
