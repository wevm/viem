import { Client as CoreClient_ } from 'viem'
import { RpcResponse } from 'ox'
import { http } from 'viem'
import { tempo } from 'viem/chains'
import { describe, expect, test } from 'vitest'
import {
  formatFillTransactionRequest,
  mergeCallsFromRequest,
  normalizeFillTransactionRequest,
  toRpcError,
} from './utils.js'

describe('formatFillTransactionRequest', () => {
  test.each([false, true])(
    'preserves encoded fields while formatting sponsorship: %s',
    (signed) => {
      const client = CoreClient_.create({ chain: tempo, transport: http() })
      const feeToken = '0x20c0000000000000000000000000000000000001'
      const signature = { r: '0x1', s: '0x2', yParity: 0 }
      const request = {
        type: '0x76',
        nonceKey: '0xff',
        feePayer: true,
        feeToken,
        ...(signed ? { feePayerSignature: signature } : {}),
      }
      expect(formatFillTransactionRequest(client, request)).toEqual({
        type: '0x76',
        nonceKey: '0xff',
        feePayer: true,
        feeToken,
        ...(signed ? { feePayerSignature: signature } : {}),
      })
      expect(request.feeToken).toBe(feeToken)
      expect(
        formatFillTransactionRequest(client, { ...request, feePayer: false }),
      ).toEqual({ ...request, feePayer: false })
    },
  )
})

describe('normalizeFillTransactionRequest', () => {
  test('preserves empty calls without synthesizing a legacy call', () => {
    expect(normalizeFillTransactionRequest({ calls: [] })).toEqual({
      calls: [],
    })
    expect(mergeCallsFromRequest({}, { calls: [] })).toEqual({ calls: [] })
    expect(mergeCallsFromRequest({ calls: [] }, { calls: [] })).toEqual({
      calls: [],
    })
  })

  test.each([1, false, {}, [], 'recipient', '0x1234'])(
    'rejects malformed targets in calls and legacy transactions: %s',
    (to) => {
      for (const transaction of [{ to }, { calls: [{ to }] }])
        expect(() => normalizeFillTransactionRequest(transaction)).toThrowError(
          expect.objectContaining({
            code: -32602,
            message: 'Invalid transaction call target.',
          }),
        )
    },
  )

  test.each([null, undefined])(
    'preserves contract creation targets: %s',
    (to) => {
      expect(
        normalizeFillTransactionRequest({ calls: [{ to, data: '0x6000' }] })
          .calls,
      ).toEqual([{ to, data: '0x6000', value: undefined }])
    },
  )

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
  test('preserves execution errors wrapped by the RPC parser', () => {
    const error = RpcResponse.parseError({
      code: 3,
      message: 'execution reverted',
      data: '0x82b42900',
    })

    expect(toRpcError(error)).toMatchObject({
      code: 3,
      message: 'execution reverted',
      data: '0x82b42900',
    })
  })

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
