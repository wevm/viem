import { assertType, expect, test } from 'vitest'

import type { Hex, TransactionType } from '../../index.js'
import { getSerializedTransactionType } from './getSerializedTransactionType.js'

test('eip1559', () => {
  const type = getSerializedTransactionType('0x02abcd')
  assertType<'eip1559'>(type)
  expect(type).toEqual('eip1559')
})

test('eip2930', () => {
  const type = getSerializedTransactionType('0x01abcd')
  assertType<'eip2930'>(type)
  expect(type).toEqual('eip2930')
})

test('eip4844', () => {
  const type = getSerializedTransactionType('0x03abcd')
  assertType<'eip4844'>(type)
  expect(type).toEqual('eip4844')
})

test('legacy', () => {
  const type = getSerializedTransactionType('0xc7c0')
  assertType<'legacy'>(type)
  expect(type).toEqual('legacy')
})

test('unknown', () => {
  const type = getSerializedTransactionType('0xc7c0' as Hex)
  assertType<TransactionType>(type)
  expect(type).toEqual('legacy')
})

test('invalid', () => {
  expect(() =>
    getSerializedTransactionType('0x69abcd'),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidSerializedTransactionTypeError: Serialized transaction type "0x69" is invalid.

    Version: viem@x.y.z]
  `)
})
