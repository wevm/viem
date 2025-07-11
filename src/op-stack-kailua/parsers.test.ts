import { describe, expect, test } from 'vitest'
import { accounts } from '../../test/src/constants.js'
import { parseEther, parseGwei } from '../index.js'
import { parseTransaction } from './parsers.js'
import { serializeTransaction } from './serializers.js'
import type { TransactionSerializableDeposit } from './types/transaction.js'

describe('deposit', () => {
  const baseTransaction = {
    from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
    sourceHash:
      '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
    type: 'deposit',
  } as const satisfies TransactionSerializableDeposit

  test('default', () => {
    const serialized = serializeTransaction(baseTransaction)
    const transaction = parseTransaction(serialized)
    expect(transaction).toEqual(baseTransaction)
  })

  test('args: data', () => {
    const tx = {
      ...baseTransaction,
      data: '0xdeadbeef',
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    const transaction = parseTransaction(serialized)
    expect(transaction).toEqual(tx)
  })

  test('args: gas', () => {
    const tx = {
      ...baseTransaction,
      gas: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    const transaction = parseTransaction(serialized)
    expect(transaction).toEqual(tx)
  })

  test('args: isSystemTx', () => {
    const tx = {
      ...baseTransaction,
      isSystemTx: true,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    const transaction = parseTransaction(serialized)
    expect(transaction).toEqual(tx)
  })

  test('args: mint', () => {
    const tx = {
      ...baseTransaction,
      mint: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    const transaction = parseTransaction(serialized)
    expect(transaction).toEqual(tx)
  })

  test('args: to', () => {
    const tx = {
      ...baseTransaction,
      to: '0xaabbccddeeff00112233445566778899aabbccdd',
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    const transaction = parseTransaction(serialized)
    expect(transaction).toEqual(tx)
  })

  test('args: value', () => {
    const tx = {
      ...baseTransaction,
      value: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    const transaction = parseTransaction(serialized)
    expect(transaction).toEqual(tx)
  })

  test('error: invalid rlp', () => {
    expect(() =>
      parseTransaction(
        '0x7ef83aa018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b80808080',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidSerializedTransactionError: Invalid serialized transaction of type "deposit" was provided.

      Serialized Transaction: "0x7ef83aa018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b80808080"
      Missing Attributes: isSystemTx, data

      Version: viem@x.y.z]
    `)
  })
})

describe('eip1559', () => {
  test('default', async () => {
    const transaction = {
      to: accounts[0].address,
      chainId: 1,
      nonce: 69,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
      type: 'eip1559',
      value: parseEther('1'),
    } as const

    const serialized = serializeTransaction(transaction)
    expect(parseTransaction(serialized)).toEqual(transaction)
  })
})
