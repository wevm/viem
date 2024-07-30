import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import {
  parseEther,
  parseGwei,
  parseTransaction as parseTransaction_,
  serializeTransaction as serializeTransaction_,
  toRlp,
} from '../index.js'
import { parseTransaction } from './parsers.js'
import { serializeTransaction } from './serializers.js'
import type { TransactionSerializableCIP64 } from './types.js'

test('should be able to parse a cip42 transaction', () => {
  const signedTransaction =
    '0x7cf84682a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0'

  expect(parseTransaction(signedTransaction)).toMatchInlineSnapshot(`
      {
        "chainId": 42220,
        "feeCurrency": "0x765de816845861e75a25fca122bb6898b8b1282a",
        "maxFeePerGas": 2000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "to": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "cip42",
        "value": 1000000000000000000n,
      }
    `)
})

const transaction = {
  chainId: 1,
  gas: 21001n,
  maxFeePerGas: parseGwei('2'),
  maxPriorityFeePerGas: parseGwei('2'),
  to: accounts[3].address,
  nonce: 785,
  value: parseEther('1'),
}

test('should return same result as standard parser when not CIP42 or CIP64', () => {
  const serialized = serializeTransaction_(transaction)

  expect(parseTransaction(serialized)).toEqual(parseTransaction_(serialized))
})

describe('should parse a CIP42 transaction', () => {
  test('with gatewayFee', () => {
    expect(
      parseTransaction(
        '0x7cf85282a51e82031184773594008477359400825209809470997970c51812dc3a010c7d01b50e0d17dc79c888016345785d8a00009490f79bf6eb2c4f870365e785982e1f101e93b906880de0b6b3a764000080c0',
      ),
    ).toMatchInlineSnapshot(`
        {
          "chainId": 42270,
          "gas": 21001n,
          "gatewayFee": 100000000000000000n,
          "gatewayFeeRecipient": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "maxFeePerGas": 2000000000n,
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 785,
          "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          "type": "cip42",
          "value": 1000000000000000000n,
        }
      `)
  })

  test('with access list', () => {
    expect(
      parseTransaction(
        '0x7cf8ae82a51e82031184773594008477359400825209809470997970c51812dc3a010c7d01b50e0d17dc79c888016345785d8a00009490f79bf6eb2c4f870365e785982e1f101e93b906880de0b6b3a764000080f85bf859940000000000000000000000000000000000000000f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
      ),
    ).toMatchInlineSnapshot(`
        {
          "accessList": [
            {
              "address": "0x0000000000000000000000000000000000000000",
              "storageKeys": [
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
              ],
            },
          ],
          "chainId": 42270,
          "gas": 21001n,
          "gatewayFee": 100000000000000000n,
          "gatewayFeeRecipient": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "maxFeePerGas": 2000000000n,
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 785,
          "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          "type": "cip42",
          "value": 1000000000000000000n,
        }
      `)
  })

  test('with data as 0x', () => {
    expect(
      parseTransaction(
        '0x7cf85282a51e82031184773594008477359400825209809470997970c51812dc3a010c7d01b50e0d17dc79c888016345785d8a00009490f79bf6eb2c4f870365e785982e1f101e93b906880de0b6b3a764000080c0',
      ),
    ).toMatchInlineSnapshot(`
        {
          "chainId": 42270,
          "gas": 21001n,
          "gatewayFee": 100000000000000000n,
          "gatewayFeeRecipient": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "maxFeePerGas": 2000000000n,
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 785,
          "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          "type": "cip42",
          "value": 1000000000000000000n,
        }
      `)
  })

  test('with data', () => {
    expect(
      parseTransaction(
        '0x7cf85482a51e82031184773594008477359400825209809470997970c51812dc3a010c7d01b50e0d17dc79c888016345785d8a00009490f79bf6eb2c4f870365e785982e1f101e93b906880de0b6b3a7640000821234c0',
      ),
    ).toMatchInlineSnapshot(`
        {
          "chainId": 42270,
          "data": "0x1234",
          "gas": 21001n,
          "gatewayFee": 100000000000000000n,
          "gatewayFeeRecipient": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "maxFeePerGas": 2000000000n,
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 785,
          "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          "type": "cip42",
          "value": 1000000000000000000n,
        }
      `)
  })
})

describe('should throw an error for invalid cip42 transactions', () => {
  test('when all fields are missing', () => {
    expect(() =>
      parseTransaction(`0x7c${toRlp([]).slice(2)}`),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidSerializedTransactionError: Invalid serialized transaction of type "cip42" was provided.

      Serialized Transaction: "0x7cc0"
      Missing Attributes: chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gas, feeCurrency, to, gatewayFeeRecipient, gatewayFee, value, data, accessList

      Version: viem@x.y.z]
    `)
  })

  test('when some fields are missing', () => {
    expect(() =>
      parseTransaction(`0x7c${toRlp(['0x0', '0x1']).slice(2)}`),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidSerializedTransactionError: Invalid serialized transaction of type "cip42" was provided.

      Serialized Transaction: "0x7cc20001"
      Missing Attributes: maxPriorityFeePerGas, maxFeePerGas, gas, feeCurrency, to, gatewayFeeRecipient, gatewayFee, value, data, accessList

      Version: viem@x.y.z]
    `)
  })

  test('when the signature is missing', () => {
    expect(() =>
      parseTransaction(
        `0x7c${toRlp([
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
        ]).slice(2)}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidSerializedTransactionError: Invalid serialized transaction of type "cip42" was provided.

      Serialized Transaction: "0x7ccd80808080808080808080808080"
      Missing Attributes: r, s

      Version: viem@x.y.z]
    `)
  })
})

describe('should parse a CIP64 transaction', () => {
  const transactionCip64 = {
    ...transaction,
    feeCurrency: '0x765de816845861e75a25fca122bb6898b8b1282a',
    chainId: 42270,
    type: 'cip64',
  } as TransactionSerializableCIP64

  test('when type is not specified, but the fields match CIP64', () => {
    const transactionWithoutType = {
      ...transaction,
      feeCurrency: '0x765de816845861e75a25fca122bb6898b8b1282a',
      type: 'cip64',
      chainId: 42270,
    } as TransactionSerializableCIP64

    const serialized = serializeTransaction(transactionWithoutType)

    expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "chainId": 42270,
          "feeCurrency": "0x765de816845861e75a25fca122bb6898b8b1282a",
          "gas": 21001n,
          "maxFeePerGas": 2000000000n,
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 785,
          "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          "type": "cip64",
          "value": 1000000000000000000n,
        }
    `)
  })

  test('with access list', () => {
    const transactionWithAccessList: TransactionSerializableCIP64 = {
      ...transactionCip64,
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

    const serialized = serializeTransaction(transactionWithAccessList)

    expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "accessList": [
            {
              "address": "0x0000000000000000000000000000000000000000",
              "storageKeys": [
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
              ],
            },
          ],
          "chainId": 42270,
          "feeCurrency": "0x765de816845861e75a25fca122bb6898b8b1282a",
          "gas": 21001n,
          "maxFeePerGas": 2000000000n,
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 785,
          "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          "type": "cip64",
          "value": 1000000000000000000n,
        }
      `)
  })
  test('with data as 0x', () => {
    const transactionWithData: TransactionSerializableCIP64 = {
      ...transactionCip64,
      data: '0x',
    }

    const serialized = serializeTransaction(transactionWithData)

    expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "chainId": 42270,
          "feeCurrency": "0x765de816845861e75a25fca122bb6898b8b1282a",
          "gas": 21001n,
          "maxFeePerGas": 2000000000n,
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 785,
          "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          "type": "cip64",
          "value": 1000000000000000000n,
        }
      `)
  })
  test('with data', () => {
    const transactionWithData: TransactionSerializableCIP64 = {
      ...transactionCip64,
      data: '0x1234',
    }

    const serialized = serializeTransaction(transactionWithData)

    expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "chainId": 42270,
          "data": "0x1234",
          "feeCurrency": "0x765de816845861e75a25fca122bb6898b8b1282a",
          "gas": 21001n,
          "maxFeePerGas": 2000000000n,
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 785,
          "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          "type": "cip64",
          "value": 1000000000000000000n,
        }
      `)
  })
})

describe('should throw an error for invalid cip64 transactions', () => {
  test('when all fields are missing', () => {
    expect(() =>
      parseTransaction(`0x7b${toRlp([]).slice(2)}`),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidSerializedTransactionError: Invalid serialized transaction of type "cip64" was provided.

      Serialized Transaction: "0x7bc0"
      Missing Attributes: chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList, feeCurrency

      Version: viem@x.y.z]
    `)
  })

  test('when some fields are missing', () => {
    expect(() =>
      parseTransaction(`0x7b${toRlp(['0x0', '0x1']).slice(2)}`),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidSerializedTransactionError: Invalid serialized transaction of type "cip64" was provided.

      Serialized Transaction: "0x7bc20001"
      Missing Attributes: maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList, feeCurrency

      Version: viem@x.y.z]
    `)
  })

  test('when the signature is missing', () => {
    expect(() =>
      parseTransaction(
        `0x7b${toRlp([
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
          '0x',
        ]).slice(2)}`,
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidSerializedTransactionError: Invalid serialized transaction of type "cip64" was provided.

      Serialized Transaction: "0x7bcb8080808080808080808080"
      Missing Attributes: r, s

      Version: viem@x.y.z]
    `)
  })
})

describe('should be able to parse op-stack transactions', () => {
  test('parsing an op deposit transaction', () => {
    const parsed = parseTransaction(
      '0x7ef83ca018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b808080808080',
    )
    expect(parsed).toEqual({
      from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
      sourceHash:
        '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
      type: 'deposit',
    })
  })
})
