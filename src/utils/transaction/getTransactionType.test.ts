import { assertType, describe, expect, test } from 'vitest'

import { getTransactionType } from './getTransactionType.js'

describe('type', () => {
  test('eip1559', () => {
    const type = getTransactionType({ chainId: 1, type: 'eip1559' })
    assertType<'eip1559'>(type)
    expect(type).toEqual('eip1559')
  })

  test('eip2930', () => {
    const type = getTransactionType({ chainId: 1, type: 'eip2930' })
    assertType<'eip2930'>(type)
    expect(type).toEqual('eip2930')
  })

  test('legacy', () => {
    const type = getTransactionType({ type: 'legacy' })
    assertType<'legacy'>(type)
    expect(type).toEqual('legacy')
  })

  test('other', () => {
    const type = getTransactionType({ type: '0x7e' })
    assertType<'0x7e'>(type)
    expect(type).toEqual('0x7e')
  })
})

describe('attributes', () => {
  test('eip1559', () => {
    const type = getTransactionType({
      chainId: 1,
      maxFeePerGas: 1n,
    })
    assertType<'eip1559'>(type)
    expect(type).toEqual('eip1559')
  })

  test('eip1559 with gasPrice undefined', () => {
    const type = getTransactionType({
      chainId: 1,
      maxFeePerGas: 1n,
      gasPrice: undefined,
    })
    assertType<'eip1559'>(type)
    expect(type).toEqual('eip1559')
  })

  test('eip2930', () => {
    const type = getTransactionType({
      chainId: 1,
      gasPrice: 1n,
      accessList: [],
    })
    assertType<'eip2930'>(type)
    expect(type).toEqual('eip2930')
  })

  test('eip2930 with eip1559 properties undefined', () => {
    const type = getTransactionType({
      chainId: 1,
      gasPrice: 1n,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
      accessList: [],
    })
    assertType<'eip2930'>(type)
    expect(type).toEqual('eip2930')
  })

  test('legacy', () => {
    const type = getTransactionType({ gasPrice: 1n })
    assertType<'legacy'>(type)
    expect(type).toEqual('legacy')
  })

  test('legacy with eip1559 properties undefined', () => {
    const type = getTransactionType({
      gasPrice: 1n,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
    })
    assertType<'legacy'>(type)
    expect(type).toEqual('legacy')
  })
})

test('invalid', () => {
  expect(() =>
    getTransactionType({ chainId: 1 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidSerializableTransactionError: Cannot infer a transaction type from provided transaction.

    Provided Transaction:
    {
      chainId:  1
    }

    To infer the type, either provide:
    - a \`type\` to the Transaction, or
    - an EIP-1559 Transaction with \`maxFeePerGas\`, or
    - an EIP-2930 Transaction with \`gasPrice\` & \`accessList\`, or
    - a Legacy Transaction with \`gasPrice\`

    Version: viem@1.0.2]
  `)
})
