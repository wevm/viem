import { expect, test } from 'vitest'

import { NodeError } from 'viem'
import * as transactionRequest from './transactionRequest.js'

test('default: no fees', () => {
  expect(() => transactionRequest.assert({})).not.toThrow()
})

test('valid fees pass', () => {
  expect(() =>
    transactionRequest.assert({
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
    }),
  ).not.toThrow()
})

test('maxFeePerGas above 2^256-1 throws FeeCapTooHighError', () => {
  expect(() =>
    transactionRequest.assert({ maxFeePerGas: 2n ** 256n }),
  ).toThrowError(NodeError.FeeCapTooHighError)
})

test('maxPriorityFeePerGas above maxFeePerGas throws TipAboveFeeCapError', () => {
  expect(() =>
    transactionRequest.assert({
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 2n,
    }),
  ).toThrowError(NodeError.TipAboveFeeCapError)
})

test('normalizes number and hex inputs', () => {
  expect(() =>
    transactionRequest.assert({
      maxFeePerGas: 1,
      maxPriorityFeePerGas: '0x2',
    }),
  ).toThrowError(NodeError.TipAboveFeeCapError)
  expect(() =>
    transactionRequest.assert({
      maxFeePerGas: '0x2',
      maxPriorityFeePerGas: 1,
    }),
  ).not.toThrow()
})
