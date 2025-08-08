import { assertType, describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { sign } from '../../accounts/utils/sign.js'
import type {
  TransactionSerializableBase,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableEIP4844,
  TransactionSerializableEIP7702,
  TransactionSerializableLegacy,
} from '../../types/transaction.js'
import { toHex } from '../encoding/toHex.js'
import { toRlp } from '../encoding/toRlp.js'
import { keccak256 } from '../hash/keccak256.js'
import { parseEther } from '../unit/parseEther.js'
import { parseGwei } from '../unit/parseGwei.js'

import type { Address } from 'abitype'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import {
  parseAccessList,
  parseTransaction,
  toTransactionArray,
} from './parseTransaction.js'
import { serializeTransaction } from './serializeTransaction.js'

const base = {
  to: accounts[1].address,
  nonce: 785,
  value: parseEther('1'),
} satisfies TransactionSerializableBase

describe('eip7702', () => {
  const baseEip7702 = {
    ...base,
    authorizationList: [
      {
        address: wagmiContractConfig.address.toLowerCase() as Address,
        chainId: 1,
        nonce: 420,
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        v: 27n,
        yParity: 0,
      },
      {
        address: '0x0000000000000000000000000000000000000000',
        chainId: 0,
        nonce: 69,
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        v: 28n,
        yParity: 1,
      },
    ],
    chainId: 1,
  } as const satisfies TransactionSerializableEIP7702

  test('default', () => {
    const serialized = serializeTransaction(baseEip7702)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP7702>(transaction)
    expect(transaction).toEqual({ ...baseEip7702, type: 'eip7702' })
  })

  test('args: fees', () => {
    const args = {
      ...baseEip7702,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('1'),
    }
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP7702>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip7702' })
  })

  test('args: gas', () => {
    const args = {
      ...baseEip7702,
      gas: 69n,
    }
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP7702>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip7702' })
  })

  test('args: accessList', () => {
    const args = {
      ...baseEip7702,
      accessList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          ],
        },
      ],
    } as const satisfies TransactionSerializableEIP7702
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP7702>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip7702' })
  })

  test('args: data', () => {
    const args = {
      ...baseEip7702,
      data: '0x1234',
    } satisfies TransactionSerializableEIP7702
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP7702>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip7702' })
  })

  test('behavior: zeroish nonce', () => {
    const args = {
      ...baseEip7702,
      nonce: 0,
    } satisfies TransactionSerializableEIP7702
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP7702>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip7702' })
  })
  test('signed', async () => {
    const signature = await sign({
      hash: keccak256(serializeTransaction(baseEip7702)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(baseEip7702, signature)
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip7702,
      ...signature,
      type: 'eip7702',
      yParity: 0,
    })
  })

  describe('errors', () => {
    test('invalid access list (invalid address)', () => {
      expect(() =>
        parseTransaction(
          `0x04${toRlp([
            toHex(1), // chainId
            toHex(0), // nonce
            toHex(1), // maxPriorityFeePerGas
            toHex(1), // maxFeePerGas
            toHex(1), // gas
            '0x0000000000000000000000000000000000000000', // to
            toHex(0), // value
            '0x', // data
            [
              [
                '0x',
                [
                  '0x0000000000000000000000000000000000000000000000000000000000000001',
                ],
              ],
            ], // accessList
            [], // authorizationList
          ]).slice(2)}`,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidAddressError: Address "0x" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.

        Version: viem@x.y.z]
      `)

      expect(() =>
        parseTransaction(
          `0x04${toRlp([
            toHex(1), // chainId
            toHex(0), // nonce
            toHex(1), // maxPriorityFeePerGas
            toHex(1), // maxFeePerGas
            toHex(1), // gas
            '0x0000000000000000000000000000000000000000', // to
            toHex(0), // value
            '0x', // data
            [['0x123456', ['0x0']]], // accessList
            [], // authorizationList
          ]).slice(2)}`,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidAddressError: Address "0x123456" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (all missing)', () => {
      expect(() =>
        parseTransaction(`0x04${toRlp([]).slice(2)}`),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip7702" was provided.

        Serialized Transaction: "0x04c0"
        Missing Attributes: chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList, authorizationList

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (some missing)', () => {
      expect(() =>
        parseTransaction(`0x04${toRlp(['0x0', '0x1']).slice(2)}`),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip7702" was provided.

        Serialized Transaction: "0x04c20001"
        Missing Attributes: maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList, authorizationList

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (missing signature)', () => {
      expect(() =>
        parseTransaction(
          `0x04${toRlp([
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
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip7702" was provided.

        Serialized Transaction: "0x04cc808080808080808080808080"
        Missing Attributes: s

        Version: viem@x.y.z]
      `)
    })
  })
})

describe('eip4844', () => {
  const baseEip4844 = {
    ...base,
    blobVersionedHashes: [
      '0x01adbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    ],
    chainId: 1,
  } as const satisfies TransactionSerializableEIP4844

  test('default', () => {
    const serialized = serializeTransaction(baseEip4844)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP4844>(transaction)
    expect(transaction).toEqual({ ...baseEip4844, type: 'eip4844' })
  })

  test('args: fees', () => {
    const args = {
      ...baseEip4844,
      maxFeePerBlobGas: parseGwei('2'),
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('1'),
    }
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP4844>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip4844' })
  })

  test('args: gas', () => {
    const args = {
      ...baseEip4844,
      gas: 69n,
    }
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP4844>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip4844' })
  })

  test('args: accessList', () => {
    const args = {
      ...baseEip4844,
      accessList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          ],
        },
      ],
    } as const satisfies TransactionSerializableEIP4844
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP4844>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip4844' })
  })

  test('args: data', () => {
    const args = {
      ...baseEip4844,
      data: '0x1234',
    } satisfies TransactionSerializableEIP4844
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP4844>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip4844' })
  })

  test('behavior: zeroish nonce', () => {
    const args = {
      ...baseEip4844,
      nonce: 0,
    } satisfies TransactionSerializableEIP4844
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP4844>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip4844' })
  })

  test('args: sidecar', () => {
    const args = {
      ...baseEip4844,
      sidecars: [
        {
          blob: '0x1234',
          commitment: '0x1234',
          proof: '0x1234',
        },
        {
          blob: '0x1234',
          commitment: '0x1234',
          proof: '0x1234',
        },
      ],
    } as const satisfies TransactionSerializableEIP4844
    const serialized = serializeTransaction(args)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP4844>(transaction)
    expect(transaction).toEqual({ ...args, type: 'eip4844' })
  })

  test('signed', async () => {
    const signature = await sign({
      hash: keccak256(serializeTransaction(baseEip4844)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(baseEip4844, signature)
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip4844,
      ...signature,
      type: 'eip4844',
      yParity: 1,
    })
  })

  describe('errors', () => {
    test('invalid access list (invalid address)', () => {
      expect(() =>
        parseTransaction(
          `0x03${toRlp([
            toHex(1), // chainId
            toHex(0), // nonce
            toHex(1), // maxPriorityFeePerGas
            toHex(1), // maxFeePerGas
            toHex(1), // gas
            '0x0000000000000000000000000000000000000000', // to
            toHex(0), // value
            '0x', // data
            [
              [
                '0x',
                [
                  '0x0000000000000000000000000000000000000000000000000000000000000001',
                ],
              ],
            ], // accessList
            '0x', // maxFeePerBlobGas,
            ['0x'], // blobVersionedHashes
          ]).slice(2)}`,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidAddressError: Address "0x" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.

        Version: viem@x.y.z]
      `)

      expect(() =>
        parseTransaction(
          `0x03${toRlp([
            toHex(1), // chainId
            toHex(0), // nonce
            toHex(1), // maxPriorityFeePerGas
            toHex(1), // maxFeePerGas
            toHex(1), // gas
            '0x0000000000000000000000000000000000000000', // to
            toHex(0), // value
            '0x', // data
            [['0x123456', ['0x0']]], // accessList
            '0x', // maxFeePerBlobGas,
            ['0x'], // blobVersionedHashes
          ]).slice(2)}`,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidAddressError: Address "0x123456" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (all missing)', () => {
      expect(() =>
        parseTransaction(`0x03${toRlp([]).slice(2)}`),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip4844" was provided.

        Serialized Transaction: "0x03c0"
        Missing Attributes: chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (some missing)', () => {
      expect(() =>
        parseTransaction(`0x03${toRlp(['0x0', '0x1']).slice(2)}`),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip4844" was provided.

        Serialized Transaction: "0x03c20001"
        Missing Attributes: maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (missing signature)', () => {
      expect(() =>
        parseTransaction(
          `0x03${toRlp([
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
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip4844" was provided.

        Serialized Transaction: "0x03cc808080808080808080808080"
        Missing Attributes: r, s

        Version: viem@x.y.z]
      `)
    })
  })
})

describe('eip1559', () => {
  const baseEip1559 = {
    ...base,
    chainId: 1,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
  }

  test('default', () => {
    const serialized = serializeTransaction(baseEip1559)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP1559>(transaction)
    expect(transaction).toEqual({ ...baseEip1559, type: 'eip1559' })
  })

  test('minimal', () => {
    const args = {
      chainId: 1,
      nonce: 0,
      maxFeePerGas: 1n,
    }
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip1559' })
  })

  test('args: gas', () => {
    const args = {
      ...baseEip1559,
      gas: 21001n,
    }
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip1559' })
  })

  test('args: accessList', () => {
    const args = {
      ...baseEip1559,
      accessList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          ],
        },
      ],
    } satisfies TransactionSerializableEIP1559
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip1559' })
  })

  test('args: data', () => {
    const args = {
      ...baseEip1559,
      data: '0x1234',
    } satisfies TransactionSerializableEIP1559
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip1559' })
  })

  test('signed', async () => {
    const signature = await sign({
      hash: keccak256(serializeTransaction(baseEip1559)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(baseEip1559, signature)
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip1559,
      ...signature,
      type: 'eip1559',
      yParity: 1,
    })
  })

  describe('raw', () => {
    test('default', () => {
      const serialized = `0x02${toRlp([
        toHex(1), // chainId
        toHex(0), // nonce
        toHex(1), // maxPriorityFeePerGas
        toHex(1), // maxFeePerGas
        toHex(1), // gas
        '0x0000000000000000000000000000000000000000', // to
        toHex(0), // value
        '0x', // data
        '0x', // accessList
      ]).slice(2)}` as const
      expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "chainId": 1,
          "gas": 1n,
          "maxFeePerGas": 1n,
          "maxPriorityFeePerGas": 1n,
          "nonce": 0,
          "to": "0x0000000000000000000000000000000000000000",
          "type": "eip1559",
          "value": 0n,
        }
      `)
    })

    test('empty sig', () => {
      const serialized = `0x02${toRlp([
        toHex(1), // chainId
        toHex(0), // nonce
        toHex(1), // maxPriorityFeePerGas
        toHex(1), // maxFeePerGas
        toHex(1), // gas
        '0x0000000000000000000000000000000000000000', // to
        toHex(0), // value
        '0x', // data
        '0x', // accessList
        '0x', // r
        '0x', // v
        '0x', // s
      ]).slice(2)}` as const
      expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "chainId": 1,
          "gas": 1n,
          "maxFeePerGas": 1n,
          "maxPriorityFeePerGas": 1n,
          "nonce": 0,
          "r": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "s": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "to": "0x0000000000000000000000000000000000000000",
          "type": "eip1559",
          "v": 27n,
          "value": 0n,
          "yParity": 0,
        }
      `)
    })

    test('low sig coords', () => {
      const serialized = `0x02${toRlp([
        toHex(1), // chainId
        toHex(0), // nonce
        toHex(1), // maxPriorityFeePerGas
        toHex(1), // maxFeePerGas
        toHex(1), // gas
        '0x0000000000000000000000000000000000000000', // to
        toHex(0), // value
        '0x', // data
        '0x', // accessList
        '0x', // r
        toHex(69), // v
        toHex(420), // s
      ]).slice(2)}` as const
      expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "chainId": 1,
          "gas": 1n,
          "maxFeePerGas": 1n,
          "maxPriorityFeePerGas": 1n,
          "nonce": 0,
          "r": "0x0000000000000000000000000000000000000000000000000000000000000045",
          "s": "0x00000000000000000000000000000000000000000000000000000000000001a4",
          "to": "0x0000000000000000000000000000000000000000",
          "type": "eip1559",
          "v": 27n,
          "value": 0n,
          "yParity": 0,
        }
      `)
    })
  })

  describe('errors', () => {
    test('invalid access list (invalid address)', () => {
      expect(() =>
        parseTransaction(
          `0x02${toRlp([
            toHex(1), // chainId
            toHex(0), // nonce
            toHex(1), // maxPriorityFeePerGas
            toHex(1), // maxFeePerGas
            toHex(1), // gas
            '0x0000000000000000000000000000000000000000', // to
            toHex(0), // value
            '0x', // data
            [
              [
                '0x',
                [
                  '0x0000000000000000000000000000000000000000000000000000000000000001',
                ],
              ],
            ], // accessList
          ]).slice(2)}`,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidAddressError: Address "0x" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.

        Version: viem@x.y.z]
      `)

      expect(() =>
        parseTransaction(
          `0x02${toRlp([
            toHex(1), // chainId
            toHex(0), // nonce
            toHex(1), // maxPriorityFeePerGas
            toHex(1), // maxFeePerGas
            toHex(1), // gas
            '0x0000000000000000000000000000000000000000', // to
            toHex(0), // value
            '0x', // data
            [['0x123456', ['0x0']]], // accessList
          ]).slice(2)}`,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidAddressError: Address "0x123456" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (all missing)', () => {
      expect(() =>
        parseTransaction(`0x02${toRlp([]).slice(2)}`),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip1559" was provided.

        Serialized Transaction: "0x02c0"
        Missing Attributes: chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (some missing)', () => {
      expect(() =>
        parseTransaction(`0x02${toRlp(['0x0', '0x1']).slice(2)}`),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip1559" was provided.

        Serialized Transaction: "0x02c20001"
        Missing Attributes: maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (missing signature)', () => {
      expect(() =>
        parseTransaction(
          `0x02${toRlp([
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
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip1559" was provided.

        Serialized Transaction: "0x02ca80808080808080808080"
        Missing Attributes: r, s

        Version: viem@x.y.z]
      `)
    })
  })
})

describe('eip2930', () => {
  const baseEip2930 = {
    ...base,
    chainId: 1,
    accessList: [
      {
        address: '0x1234512345123451234512345123451234512345',
        storageKeys: [
          '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        ],
      },
    ],
    gasPrice: parseGwei('2'),
  } as TransactionSerializableEIP2930

  test('default', () => {
    const serialized = serializeTransaction(baseEip2930)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableEIP2930>(transaction)
    expect(transaction).toEqual({ ...baseEip2930, type: 'eip2930' })
  })

  test('minimal', () => {
    const args = {
      chainId: 1,
      gasPrice: 1n,
      nonce: 0,
      accessList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
          ],
        },
      ],
    } satisfies TransactionSerializableEIP2930
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('args: gas', () => {
    const args = {
      ...baseEip2930,
      gas: 21001n,
    } satisfies TransactionSerializableEIP2930
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('args: data', () => {
    const args = {
      ...baseEip2930,
      data: '0x1234',
    } satisfies TransactionSerializableEIP2930
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('args: data', () => {
    const args = {
      ...baseEip2930,
      data: '0x1234',
    } satisfies TransactionSerializableEIP2930
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('behavior: zeroish nonce', () => {
    const args = {
      ...baseEip2930,
      nonce: 0,
    } satisfies TransactionSerializableEIP2930
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('signed', async () => {
    const signature = await sign({
      hash: keccak256(serializeTransaction(baseEip2930)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(baseEip2930, signature)
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip2930,
      ...signature,
      type: 'eip2930',
      yParity: 1,
    })
  })

  describe('errors', () => {
    test('invalid transaction (all missing)', () => {
      expect(() =>
        parseTransaction(`0x01${toRlp([]).slice(2)}`),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip2930" was provided.

        Serialized Transaction: "0x01c0"
        Missing Attributes: chainId, nonce, gasPrice, gas, to, value, data, accessList

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (some missing)', () => {
      expect(() =>
        parseTransaction(`0x01${toRlp(['0x0', '0x1']).slice(2)}`),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip2930" was provided.

        Serialized Transaction: "0x01c20001"
        Missing Attributes: gasPrice, gas, to, value, data, accessList

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (missing signature)', () => {
      expect(() =>
        parseTransaction(
          `0x01${toRlp([
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
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip2930" was provided.

        Serialized Transaction: "0x01c9808080808080808080"
        Missing Attributes: r, s

        Version: viem@x.y.z]
      `)
    })
  })
})

describe('legacy', () => {
  const baseLegacy = {
    ...base,
    gasPrice: parseGwei('2'),
  }

  test('default', () => {
    const serialized = serializeTransaction(baseLegacy)
    const transaction = parseTransaction(serialized)
    assertType<TransactionSerializableLegacy>(transaction)
    expect(transaction).toEqual({ ...baseLegacy, type: 'legacy' })
  })

  test('args: gas', () => {
    const args = {
      ...baseLegacy,
      gas: 21001n,
    }
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('args: data', () => {
    const args = {
      ...baseLegacy,
      data: '0x1234',
    } satisfies TransactionSerializableLegacy
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('args: chainId', () => {
    const args = {
      ...baseLegacy,
      chainId: 69,
    } satisfies TransactionSerializableLegacy
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('behavior: zeroish nonce', () => {
    const args = {
      ...baseLegacy,
      nonce: 0,
    }
    const serialized = serializeTransaction(args)
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('signed', async () => {
    const signature = await sign({
      hash: keccak256(serializeTransaction(baseLegacy)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(baseLegacy, signature)
    expect(parseTransaction(serialized)).toEqual({
      ...baseLegacy,
      ...signature,
      yParity: 1,
      type: 'legacy',
    })
  })

  test('signed w/ chainId', async () => {
    const args = {
      ...baseLegacy,
      chainId: 69,
    }
    const signature = await sign({
      hash: keccak256(serializeTransaction(args)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(args, signature)
    expect(parseTransaction(serialized)).toEqual({
      ...args,
      ...signature,
      yParity: 0,
      type: 'legacy',
      v: 173n,
    })
  })

  describe('raw', () => {
    test('default', () => {
      const serialized = toRlp([
        toHex(0), // nonce
        toHex(1), // gasPrice
        toHex(1), // gas
        '0x0000000000000000000000000000000000000000', // to
        toHex(0), // value
        '0x', // data
      ])
      expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "gas": 1n,
          "gasPrice": 1n,
          "nonce": 0,
          "to": "0x0000000000000000000000000000000000000000",
          "type": "legacy",
          "value": 0n,
        }
      `)
    })

    test('empty sig', () => {
      const serialized = toRlp([
        toHex(0), // nonce
        toHex(1), // gasPrice
        toHex(1), // gas
        '0x0000000000000000000000000000000000000000', // to
        toHex(0), // value
        '0x', // data
        '0x', // v
        '0x', // r
        '0x', // s
      ])
      expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "gas": 1n,
          "gasPrice": 1n,
          "nonce": 0,
          "to": "0x0000000000000000000000000000000000000000",
          "type": "legacy",
          "value": 0n,
        }
      `)
    })

    test('low sig coords', () => {
      const serialized = toRlp([
        toHex(0), // nonce
        toHex(1), // gasPrice
        toHex(1), // gas
        '0x0000000000000000000000000000000000000000', // to
        toHex(0), // value
        '0x', // data
        '0x1b', // v
        toHex(69), // r
        toHex(420), // s
      ])
      expect(parseTransaction(serialized)).toMatchInlineSnapshot(`
        {
          "gas": 1n,
          "gasPrice": 1n,
          "nonce": 0,
          "r": "0x45",
          "s": "0x01a4",
          "to": "0x0000000000000000000000000000000000000000",
          "type": "legacy",
          "v": 27n,
          "value": 0n,
          "yParity": 0,
        }
      `)
    })
  })

  describe('errors', () => {
    test('invalid transaction (all missing)', () => {
      expect(() =>
        parseTransaction(toRlp([])),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "legacy" was provided.

        Serialized Transaction: "0xc0"
        Missing Attributes: nonce, gasPrice, gas, to, value, data

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (some missing)', () => {
      expect(() =>
        parseTransaction(toRlp(['0x0', '0x1'])),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "legacy" was provided.

        Serialized Transaction: "0xc20001"
        Missing Attributes: gas, to, value, data

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (missing signature)', () => {
      expect(() =>
        parseTransaction(toRlp(['0x', '0x', '0x', '0x', '0x', '0x', '0x'])),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "legacy" was provided.

        Serialized Transaction: "0xc780808080808080"
        Missing Attributes: r, s

        Version: viem@x.y.z]
      `)
    })

    test('invalid transaction (attribute overload)', () => {
      expect(() =>
        parseTransaction(
          toRlp(['0x', '0x', '0x', '0x', '0x', '0x', '0x', '0x', '0x', '0x']),
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidSerializedTransactionError: Invalid serialized transaction of type "legacy" was provided.

        Serialized Transaction: "0xca80808080808080808080"

        Version: viem@x.y.z]
      `)
    })

    test('invalid v', () => {
      expect(() =>
        parseTransaction(
          toRlp([
            toHex(0), // nonce
            toHex(1), // gasPrice
            toHex(1), // gas
            '0x0000000000000000000000000000000000000000', // to
            toHex(0), // value
            '0x', // data
            '0x', // v
            toHex(69), // r
            toHex(420), // s
          ]),
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidLegacyVError: Invalid \`v\` value "0". Expected 27 or 28.

        Version: viem@x.y.z]
      `)

      expect(() =>
        parseTransaction(
          toRlp([
            toHex(0), // nonce
            toHex(1), // gasPrice
            toHex(1), // gas
            '0x0000000000000000000000000000000000000000', // to
            toHex(0), // value
            '0x', // data
            toHex(35), // v
            toHex(69), // r
            toHex(420), // s
          ]),
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidLegacyVError: Invalid \`v\` value "35". Expected 27 or 28.

        Version: viem@x.y.z]
      `)
    })
  })
})

describe('errors', () => {
  test('invalid transaction', () => {
    expect(() => parseTransaction('0x')).toThrowErrorMatchingInlineSnapshot(
      `
      [InvalidSerializedTransactionType: Serialized transaction type "0x" is invalid.

      Version: viem@x.y.z]
    `,
    )
  })

  test('invalid transaction', () => {
    expect(() => parseTransaction('0x69')).toThrowErrorMatchingInlineSnapshot(
      `
      [InvalidSerializedTransactionType: Serialized transaction type "0x69" is invalid.

      Version: viem@x.y.z]
    `,
    )
  })
})

test('toTransactionArray', () => {
  expect(
    toTransactionArray(
      serializeTransaction({
        ...base,
        chainId: 1,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
      }),
    ),
  ).toMatchInlineSnapshot(`
    [
      "0x01",
      "0x0311",
      "0x01",
      "0x01",
      "0x",
      "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "0x0de0b6b3a7640000",
      "0x",
      [],
    ]
  `)
})

test('parseAccessList', () => {
  expect(
    parseAccessList([
      [
        '0x1234512345123451234512345123451234512345',
        [
          '0x1234512345123451234512345123451234512345',
          '0x1234512345123451234512345123451234512345',
        ],
      ],
    ]),
  ).toMatchInlineSnapshot(`
    [
      {
        "address": "0x1234512345123451234512345123451234512345",
        "storageKeys": [
          "0x1234512345123451234512345123451234512345",
          "0x1234512345123451234512345123451234512345",
        ],
      },
    ]
  `)
})

test('https://github.com/wevm/viem/issues/3649', () => {
  const transaction = parseTransaction(
    '0x02f874827a6980843b9aca0084832156008252089470997970c51812dc3a010c7d01b50e0d17dc79c888016345785d8a000080c001a078f6d0d0f56eb676e9b58364f4555c6a64874e6e6ba9911b0bc968b582146190a07e1d1e9df79c86eef251675b7dab392df8018631ead898361c391c17c1ad4090',
  )
  expect(transaction).toMatchInlineSnapshot(`
    {
      "chainId": 31337,
      "gas": 21000n,
      "maxFeePerGas": 2200000000n,
      "maxPriorityFeePerGas": 1000000000n,
      "nonce": 0,
      "r": "0x78f6d0d0f56eb676e9b58364f4555c6a64874e6e6ba9911b0bc968b582146190",
      "s": "0x7e1d1e9df79c86eef251675b7dab392df8018631ead898361c391c17c1ad4090",
      "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "type": "eip1559",
      "v": 28n,
      "value": 100000000000000000n,
      "yParity": 1,
    }
  `)
})

test('https://github.com/wevm/viem/issues/3836', () => {
  const transaction = parseTransaction(
    '0x04f915110182c4488409662754842490a9ed83220284940000000071727de22e5e9d8baf0edac6f37da03280b91444765e827f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000003ac05161b76a35c1c28dc99aa01bed7b24cea3bf000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000002d8d24946a914904504ad674a8cdf0f5a5a59f930000b5514d426c8435aafc17824d28646d74ad6951777fc100000000000000000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000011a80000000000000000000000000000f740e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000001340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011a4e9ae5c530100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000011400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000001dd9eef96646ad40d58da28d1878e7f223d5e8ba0000000000000000000000000000000000000000000000000d500f84028863c40000000000000000000000000000000000000000000000000000000000000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000bbbfd134e9b44bfb5123898ba36b01de7ab93d980000000000000000000000000000000000000000000002a2e555576e6c3a9c3c00000000000000000000000000000000000000000000000000000000000000000000000000000000bbbfd134e9b44bfb5123898ba36b01de7ab93d98000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000e443087505600000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000002d8d24946a914904504ad674a8cdf0f5a5a59f930000000000000000000000002d8d24946a914904504ad674a8cdf0f5a5a59f93000000000000000000000000000000000000000000000000000000000000000100000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f5100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000002a2e555576e6c3a9c3c0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000b0000000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000044095ea7b30000000000000000000000000000000000001ff3684f28c67538d4d072c227340000000000000000000000000000000000000000000002a2e555576e6c3a9c3c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001ff3684f28c67538d4d072c2273400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000008e42213bc0b000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000002a2e555576e6c3a9c3c000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000008041fff991f000000000000000000000000f5042e6ffac5a625d4e7848e0b01373d8eb9e222000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000002b1702bec00000000000000000000000000000000000000000000000000000000000000a08e1ed9f5b21bf0a0310d0b050af43c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000005a000000000000000000000000000000000000000000000000000000000000000e4c1fb425e000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000002a2e555576e6c3a9c3c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000688d9de700000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016438c9c14700000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000000000000000000002616000000000000000000000000a5407eae9ba41422680e2e00537571bcc53efbfd000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000843df021240000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c4103b48be000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000000000000000000002710000000000000000000000000f80758ab42c3b07da84053fd88804bcb6baa4b5c0000000000000000000000000000000000000000000000000000000000001e01000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010438c9c147000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000002710000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000242e1a7d4d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001646c5f9cf9000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000000000000000271000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000ffffffffffffffc5000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037271001a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000d1b71758e21960000137e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f5042e6ffac5a625d4e7848e0b01373d8eb9e22200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001243b2253c8000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000000010000000000000000000000002d8d24946a914904504ad674a8cdf0f5a5a59f930000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c54d45f988b0d762f4ec742dba95922dc04de49e99125684db7ca448d4b07b1d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004191ce190a2b974b0eef07f06d92e7f1a40d5dc977be354d1c3153b99391cff3a211df38827c1e3828e75895920e2423c4dc88b60df1bfa5006d59db2fbf1dd89f1b00000000000000000000000000000000000000000000000000000000000000c0f85cf85a0194d6cedde84be40893d153be9d467cd6ad37875b288001a0e70b15f7cd9c2065ee475b233282678a971de97f99baabc95232abd4f84b4cbca03ca844308d5f98ecb899249eb09e1b382d2b691cd11a839faf385a65b3d177ab01a08dfdfc65e72d9ce4772b335721b862a3ef19c393c9acfcd7a14e0a7eab335c38a00aff887cc545695eeb8dfa2ce66837273a796a91ad1d02599f53feb301fc3049',
  )

  expect(transaction).toMatchInlineSnapshot(`
    {
      "authorizationList": [
        {
          "address": "0xd6cedde84be40893d153be9d467cd6ad37875b28",
          "chainId": 1,
          "nonce": 0,
          "r": "0xe70b15f7cd9c2065ee475b233282678a971de97f99baabc95232abd4f84b4cbc",
          "s": "0x3ca844308d5f98ecb899249eb09e1b382d2b691cd11a839faf385a65b3d177ab",
          "v": 28n,
          "yParity": 1,
        },
      ],
      "chainId": 1,
      "data": "0x765e827f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000003ac05161b76a35c1c28dc99aa01bed7b24cea3bf000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000002d8d24946a914904504ad674a8cdf0f5a5a59f930000b5514d426c8435aafc17824d28646d74ad6951777fc100000000000000000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000011a80000000000000000000000000000f740e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000001340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011a4e9ae5c530100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000011400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000022000000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb0000000000000000000000001dd9eef96646ad40d58da28d1878e7f223d5e8ba0000000000000000000000000000000000000000000000000d500f84028863c40000000000000000000000000000000000000000000000000000000000000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000bbbfd134e9b44bfb5123898ba36b01de7ab93d980000000000000000000000000000000000000000000002a2e555576e6c3a9c3c00000000000000000000000000000000000000000000000000000000000000000000000000000000bbbfd134e9b44bfb5123898ba36b01de7ab93d98000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000e443087505600000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000002d8d24946a914904504ad674a8cdf0f5a5a59f930000000000000000000000002d8d24946a914904504ad674a8cdf0f5a5a59f93000000000000000000000000000000000000000000000000000000000000000100000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f5100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000002a2e555576e6c3a9c3c0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000b0000000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000044095ea7b30000000000000000000000000000000000001ff3684f28c67538d4d072c227340000000000000000000000000000000000000000000002a2e555576e6c3a9c3c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001ff3684f28c67538d4d072c2273400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000008e42213bc0b000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000002a2e555576e6c3a9c3c000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000008041fff991f000000000000000000000000f5042e6ffac5a625d4e7848e0b01373d8eb9e222000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000002b1702bec00000000000000000000000000000000000000000000000000000000000000a08e1ed9f5b21bf0a0310d0b050af43c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000005a000000000000000000000000000000000000000000000000000000000000000e4c1fb425e000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000002a2e555576e6c3a9c3c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000688d9de700000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016438c9c14700000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000000000000000000002616000000000000000000000000a5407eae9ba41422680e2e00537571bcc53efbfd000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000843df021240000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c4103b48be000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f510000000000000000000000000000000000000000000000000000000000002710000000000000000000000000f80758ab42c3b07da84053fd88804bcb6baa4b5c0000000000000000000000000000000000000000000000000000000000001e01000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010438c9c147000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000002710000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000242e1a7d4d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001646c5f9cf9000000000000000000000000df31a70a21a1931e02033dbba7deace6c45cfd0f000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000000000000000271000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000ffffffffffffffc5000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037271001a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000d1b71758e21960000137e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f5042e6ffac5a625d4e7848e0b01373d8eb9e22200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001243b2253c8000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000000010000000000000000000000002d8d24946a914904504ad674a8cdf0f5a5a59f930000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c54d45f988b0d762f4ec742dba95922dc04de49e99125684db7ca448d4b07b1d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004191ce190a2b974b0eef07f06d92e7f1a40d5dc977be354d1c3153b99391cff3a211df38827c1e3828e75895920e2423c4dc88b60df1bfa5006d59db2fbf1dd89f1b00000000000000000000000000000000000000000000000000000000000000",
      "gas": 2228868n,
      "maxFeePerGas": 613460461n,
      "maxPriorityFeePerGas": 157689684n,
      "nonce": 50248,
      "r": "0x8dfdfc65e72d9ce4772b335721b862a3ef19c393c9acfcd7a14e0a7eab335c38",
      "s": "0x0aff887cc545695eeb8dfa2ce66837273a796a91ad1d02599f53feb301fc3049",
      "to": "0x0000000071727de22e5e9d8baf0edac6f37da032",
      "type": "eip7702",
      "v": 28n,
      "yParity": 1,
    }
  `)
})
