import { accounts } from '../../_test/constants.js'
import { signTransaction } from '../../accounts/utils/signTransaction.js'
import {
  FeeCapTooHighError,
  TipAboveFeeCapError,
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
    feeCurrency: '0x765de816845861e75a25fca122bb6898b8b1282a',
    type: 'cip42',
  }
  test('should be able to serialize a cip42 transaction', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
    }

    expect(serializeTransaction(transaction)).toEqual(
      '0x7cf84682a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })
  test('args: feeCurrency', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      feeCurrency: '0x765de816845861e75a25fca122bb6898b8b1282a',
    }

    expect(serializeTransaction(transaction)).toEqual(
      '0x7cf84682a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
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
      '0x7cf8a282a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080f85bf859940000000000000000000000000000000000000000f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })

  test('with signature', async () => {
    const signed = await signTransaction({
      privateKey: accounts[0].privateKey,
      transaction: baseTransaction,
      serializer: serializeTransaction,
    })

    expect(signed).toEqual(
      '0x7cf88982a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c080a01ae1d60446ad5fdd620e1982050dc315ff9a0f61b32bcc2a3cdadd0571a76df7a073aba459b3aef6796d5f2a9979551c29f66586821b5613d5080d00782b07c280',
    )
  })

  test('args: data', () => {
    const args: TransactionSerializableCIP42 = {
      ...baseTransaction,
      data: '0x1234',
    }
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0x7cf84882a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a7640000821234c0',
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

describe('when param values are not right', () => {
  const baseTransaction: TransactionSerializableCIP42 = {
    feeCurrency: '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73',
    to: accounts[0].address,
    chainId: 42220,
    nonce: 0,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
    value: parseEther('1'),
    type: 'cip42',
  }
  test('maxPriorityFeePerGas is higher than maxPriorityFee', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      maxPriorityFeePerGas: parseGwei('5000000000'),
      maxFeePerGas: parseGwei('1'),
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      TipAboveFeeCapError,
    )
  })
  test('maxFeePerGas is too high', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      maxPriorityFeePerGas: parseGwei('5000000000'),
      maxFeePerGas:
        115792089237316195423570985008687907853269984665640564039457584007913129639938n,
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      FeeCapTooHighError,
    )
  })
  test('when fee Currency is not an address', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      // @ts-expect-error
      feeCurrency: 'CUSD',
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      '`feeCurrency` MUST be a token address for CIP-42 transactions.',
    )
  })

  test('when gasPrice is defined', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      // @ts-expect-error
      gasPrice: 1,
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      '`gasPrice` is not a valid CIP-42 Transaction attribute.',
    )
  })

  test('when only one of the gateWayFee fields is defined', () => {
    const transactionA: TransactionSerializableCIP42 = {
      ...baseTransaction,
      gatewayFeeRecipient: accounts[7].address,
    }
    expect(() => serializeTransaction(transactionA)).toThrowError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
    const transactionB: TransactionSerializableCIP42 = {
      ...baseTransaction,
      gatewayFee: 1000023434343n,
    }
    expect(() => serializeTransaction(transactionB)).toThrowError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
  })
  test('when the transaction looks like cip42 but does not have values for either feeCurrency or gatewayFee', () => {
    const transaction = {
      ...baseTransaction,
      feeCurrency: undefined,
      gatewayFee: undefined,
      gatewayFeeRecipient: undefined,
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      'Either `feeCurrency` or `gatewayFeeRecipient` must be provided for CIP-42 transactions.',
    )
  })
  test('when chainID is invalid', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseTransaction,
      chainId: -1,
    }

    expect(() => serializeTransaction(transaction)).toThrowError(
      `Chain ID "${-1}" is invalid.`
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
