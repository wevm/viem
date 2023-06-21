import { accounts } from '../../_test/constants.js'
import {
  type TransactionSerializableEIP1559,
  parseEther,
  parseGwei,
  parseTransaction,
} from '../../index.js'
import {
  type TransactionSerializableCIP42,
  serializeTransaction,
} from './celo.js'
import { describe, expect, test } from 'vitest'

describe('cip42', () => {
  const baseTransaction: TransactionSerializableCIP42 = {
    to: accounts[0].address,
    chainId: 42220,
    nonce: 0,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
    value: parseEther('1'),
    type: 'cip42',
  }
  test('should be able to serialize a cip42 transaction', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
    }

    expect(serializeTransaction(transaction)).toEqual(
      '0x7cf282a4ec80847735940084773594008080808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })
  test('args: feeCurrency', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      feeCurrency: '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73',
    }

    expect(serializeTransaction(transaction)).toEqual(
      '0x7cf84682a4ec80847735940084773594008094d8763cba276a3738e6de85b4b3bf5fded6d6ca73808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('args: Access List', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      accessList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          ],
        },
      ],
    }

    expect(serializeTransaction(transaction)).toEqual(
      '0x7cf88e82a4ec80847735940084773594008080808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080f85bf859940000000000000000000000000000000000000000f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })

  test('args: data', () => {
    const args: TransactionSerializableCIP42 = {
      ...baseTransaction,
      data: '0x1234',
    }
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0x7cf482a4ec80847735940084773594008080808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a7640000821234c0',
    )
  })

  test('when type is not defined but has cip42 fields', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      feeCurrency: '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73',
      type: undefined,
    }

    expect(serializeTransaction(transaction)).toEqual(
      '0x7cf84682a4ec80847735940084773594008094d8763cba276a3738e6de85b4b3bf5fded6d6ca73808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })
})

describe('when not cip42', () => {
  const baseTransaction: TransactionSerializableEIP1559 = {
    to: accounts[0].address,
    chainId: 1,
    nonce: 0,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
    value: parseEther('1'),
  }
  test('it calls the standard serializeTransaction', () => {
    const serialized = serializeTransaction({ ...baseTransaction })
    expect(serialized).toEqual(
      '0x02ed0180847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
    expect(parseTransaction(serialized)).toEqual({
      to: accounts[0].address,
      chainId: 1,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
      value: parseEther('1'),
      type: 'eip1559',
    })
  })
})
