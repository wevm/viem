import { assertType, expect, test } from 'vitest'
import { getSerializedTransactionType } from './getSerializedTransactionType.js'

test('eip1559', () => {
  const type = getSerializedTransactionType('0x02abc')
  assertType<'eip1559'>(type)
  expect(type).toEqual('eip1559')
})

test('eip2930', () => {
  const type = getSerializedTransactionType('0x01abc')
  assertType<'eip2930'>(type)
  expect(type).toEqual('eip2930')
})

test('legacy', () => {
  const type = getSerializedTransactionType('0xc7c')
  assertType<'legacy'>(type)
  expect(type).toEqual('legacy')
})

test('invalid', () => {
  expect(() =>
    getSerializedTransactionType('0x03abc'),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Serialized transaction type \\"0x03\\" is invalid.

    Version: viem@1.0.2"
  `)
})
