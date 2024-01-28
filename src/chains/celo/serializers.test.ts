import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { signTransaction } from '../../accounts/utils/signTransaction.js'
import {
  FeeCapTooHighError,
  InvalidAddressError,
  TipAboveFeeCapError,
  type TransactionSerializableEIP1559,
  parseEther,
  parseGwei,
  parseTransaction as parseTransaction_,
} from '../../index.js'
import { parseTransaction } from './parsers.js'
import { serializeTransaction } from './serializers.js'
import type {
  TransactionSerializableCIP42,
  TransactionSerializableCIP64,
} from './types.js'

const commonBaseTx = {
  to: accounts[0].address,
  chainId: 42220,
  nonce: 1,
  feeCurrency: '0x765de816845861e75a25fca122bb6898b8b1282a',
  value: parseEther('1'),
}

const baseCip42 = {
  ...commonBaseTx,
  maxFeePerGas: parseGwei('2'),
  maxPriorityFeePerGas: parseGwei('2'),
  gatewayFee: 1000023434343n,
  gatewayFeeRecipient: accounts[7].address,
} as TransactionSerializableCIP42

const baseCip64 = {
  ...commonBaseTx,
  maxFeePerGas: parseGwei('2'),
  maxPriorityFeePerGas: parseGwei('2'),
} as TransactionSerializableCIP64

describe('cip42', () => {
  test('should be able to serialize a cip42 transaction', () => {
    // sanity checks the serialized value, but then rely on the parser
    const serialized = serializeTransaction(baseCip42)
    const reparsed = parseTransaction(serialized)
    const reserialized = serializeTransaction(reparsed)
    expect(serialized).toEqual(
      '0x7cf85f82a4ec01847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a9414dc79964da2c08b23698b3d3cc7ca32193d995585e8d60aa46794f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
    expect(reparsed).toEqual({ ...baseCip42, type: 'cip42' })
    expect(serialized).toEqual(reserialized)
  })

  test('args: accessList', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
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

    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: data', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      data: '0x1234',
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: feeCurrency (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gatewayFeeRecipient: accounts[0].address,
      gatewayFee: parseEther('0.1'),
      feeCurrency: undefined,
    }

    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: gas', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gas: 69420n,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: gas (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gas: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: maxFeePerGas (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      maxFeePerGas: undefined,
      type: 'cip42',
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: maxPriorityFeePerGas (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      maxPriorityFeePerGas: undefined,
      type: 'cip42',
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: nonce (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      nonce: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: to (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      to: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('args: value (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      value: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('type is undefined but has cip42 fields', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      type: undefined,
    }

    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip42',
    })
  })

  test('signed', async () => {
    const signed = await signTransaction({
      privateKey: accounts[0].privateKey,
      transaction: baseCip42,
      serializer: serializeTransaction,
    })

    const serialized =
      '0x7cf8a282a4ec01847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a9414dc79964da2c08b23698b3d3cc7ca32193d995585e8d60aa46794f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c001a0430169754e015d53ccf07816d580ea968cbf1ccec6fcf45589507c7a38c0e685a00a66965256aee1476446f293f6b7db29ddcfe09eba707612d63e3b67035671fe'
    expect(signed).toEqual(serialized)
    expect(parseTransaction(signed)).toEqual({
      ...baseCip42,
      type: 'cip42',
    })
  })

  test('signature', () => {
    const tx1 =
      '0x7cf8a282a4ec01847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a9414dc79964da2c08b23698b3d3cc7ca32193d995585e8d60aa46794f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe'
    const tx2 =
      '0x7cf8a282a4ec01847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a9414dc79964da2c08b23698b3d3cc7ca32193d995585e8d60aa46794f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c080a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe'
    expect(
      serializeTransaction(
        baseCip42,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 1,
        },
      ),
    ).toEqual(tx1)
    expect(
      serializeTransaction(
        baseCip42,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 0,
        },
      ),
    ).toEqual(tx2)

    expect(parseTransaction(tx1)).toEqual(parseTransaction(tx2))
    expect(parseTransaction(tx1)).toEqual({ ...baseCip42, type: 'cip42' })
  })
})

describe('cip64', () => {
  test('should be able to serialize a cip64 transaction', () => {
    // sanity checks the serialized value, but then rely on the parser
    const serialized = serializeTransaction(baseCip64)
    const reparsed = parseTransaction(serialized)
    const reserialized = serializeTransaction(reparsed)
    expect(serialized).toEqual(
      '0x7bf84482a4ec01847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
    expect(reparsed).toEqual({ ...baseCip64, type: 'cip64' })
    expect(serialized).toEqual(reserialized)
  })

  test('args: accessList', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
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

    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('args: data', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      data: '0x1234',
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('args: gas', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      gas: 69420n,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('args: gas (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      gas: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('args: maxFeePerGas (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      type: 'cip64',
      maxFeePerGas: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('args: maxPriorityFeePerGas (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      type: 'cip64',
      maxPriorityFeePerGas: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('args: nonce (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      nonce: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('args: to (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      to: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('args: value (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      value: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('type is undefined but has cip64 fields (feeCurrency, but not gateway*)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      feeCurrency: '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73',
      type: undefined,
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })

  test('signed', async () => {
    const signed = await signTransaction({
      privateKey: accounts[0].privateKey,
      transaction: baseCip64,
      serializer: serializeTransaction,
    })
    const serialized =
      '0x7bf88782a4ec01847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a01a087a588ffb7bec68b00d264932305b3badc3bfba2f48e9d3d916d038e1bb831a5a077e665b35849c636b52b3cc205acb98141b4a582fb84a7181e048dc5473c6d6d'
    expect(signed).toEqual(serialized)
    expect(parseTransaction(signed)).toEqual({
      ...baseCip64,
      type: 'cip64',
    })
  })

  test('signature', () => {
    const tx1 =
      '0x7bf88782a4ec01847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a01a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe'
    const tx2 =
      '0x7bf88782a4ec01847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe'
    expect(
      serializeTransaction(
        baseCip64,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 1,
        },
      ),
    ).toEqual(tx1)
    expect(
      serializeTransaction(
        baseCip64,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 0,
        },
      ),
    ).toEqual(tx2)
    expect(parseTransaction(tx1)).toEqual(parseTransaction(tx2))
    expect(parseTransaction(tx1)).toEqual({ ...baseCip64, type: 'cip64' })
  })

  test('CIP-42 transaction that has all CIP-64 fields and CIP-64 takes precedence', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gatewayFeeRecipient: undefined,
      gatewayFee: undefined,
      type: 'cip42',
    }
    expect(parseTransaction(serializeTransaction(transaction))).toEqual({
      ...transaction,
      type: 'cip64',
    })
  })
})

describe('invalid params specific to CIP-42', () => {
  const baseCip42WithType = {
    ...baseCip42,
    type: 'cip42',
  } as const
  test('only one of the gateWayFee fields is defined', () => {
    const transactionA: TransactionSerializableCIP42 = {
      ...baseCip42WithType,
      gatewayFee: undefined,
      gatewayFeeRecipient: accounts[7].address,
    }
    expect(() => serializeTransaction(transactionA)).toThrowError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
    const transactionB: TransactionSerializableCIP42 = {
      ...baseCip42WithType,
      gatewayFee: 1000023434343n,
      gatewayFeeRecipient: undefined,
    }
    expect(() => serializeTransaction(transactionB)).toThrowError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
  })
  test('transaction looks like cip42 but does not have values for either feeCurrency or gatewayFee', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42WithType,
      feeCurrency: undefined,
      gatewayFee: undefined,
      gatewayFeeRecipient: undefined,
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      'Either `feeCurrency` or `gatewayFeeRecipient` must be provided for CIP-42 transactions.',
    )
  })
})

describe('invalid params specific to CIP-64', () => {
  test('transaction looks like cip64 but does not have a value for feeCurrency', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      type: 'cip64',
      feeCurrency: undefined,
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      '`feeCurrency` must be provided for CIP-64 transactions.',
    )
  })
})

describe('Common invalid params (for CIP-42)', () => {
  test('invalid to', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      to: '0xdeadbeef',
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      InvalidAddressError,
    )
  })

  test('gatewayFeeRecipient is not an address', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      type: 'cip42',
      // @ts-expect-error - (Type '"example"' is not assignable to type "`0x${string}"'
      gatewayFeeRecipient: 'example',
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      InvalidAddressError,
    )
  })

  test('maxFeePerGas is too high', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      maxFeePerGas: 2n ** 257n,
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      FeeCapTooHighError,
    )
  })

  test('feeCurrency is not an address', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      // @ts-expect-error - (Type '"CUSD"' is not assignable to type "`0x${string}"'
      feeCurrency: 'CUSD',
    }

    expect(() => serializeTransaction(transaction)).toThrowError(
      '`feeCurrency` MUST be a token address for CIP-42 transactions.',
    )
  })

  test('gasPrice is defined', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      // @ts-expect-error
      gasPrice: BigInt(1),
    }

    expect(() => serializeTransaction(transaction)).toThrowError(
      '`gasPrice` is not a valid CIP-42 Transaction attribute.',
    )
  })

  test('chainID is invalid', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      chainId: -1,
    }

    expect(() => serializeTransaction(transaction)).toThrowError(
      `Chain ID "${-1}" is invalid.`,
    )
  })

  test('maxPriorityFeePerGas is higher than maxPriorityFee', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      maxPriorityFeePerGas: parseGwei('5000000000'),
      maxFeePerGas: parseGwei('1'),
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      TipAboveFeeCapError,
    )
  })
})

describe('Common invalid params (for CIP-64)', () => {
  test('invalid to', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      to: '0xdeadbeef',
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      InvalidAddressError,
    )
  })

  test('maxPriorityFeePerGas is higher than maxPriorityFee', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      maxPriorityFeePerGas: parseGwei('5000000000'),
      maxFeePerGas: parseGwei('1'),
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      TipAboveFeeCapError,
    )
  })

  test('maxFeePerGas is too high', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      maxPriorityFeePerGas: parseGwei('5000000000'),
      maxFeePerGas:
        115792089237316195423570985008687907853269984665640564039457584007913129639938n,
    }
    expect(() => serializeTransaction(transaction)).toThrowError(
      FeeCapTooHighError,
    )
  })

  test('feeCurrency is not an address', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      // @ts-expect-error
      feeCurrency: 'CUSD',
    }

    expect(() => serializeTransaction(transaction)).toThrowError(
      '`feeCurrency` MUST be a token address for CIP-64 transactions.',
    )
  })

  test('gasPrice is defined', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      // @ts-expect-error
      gasPrice: BigInt(1),
    }

    expect(() => serializeTransaction(transaction)).toThrowError(
      '`gasPrice` is not a valid CIP-64 Transaction attribute.',
    )
  })

  test('chainID is invalid', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      chainId: -1,
    }

    expect(() => serializeTransaction(transaction)).toThrowError(
      `Chain ID "${-1}" is invalid.`,
    )
  })
})

describe('not cip42', () => {
  const transaction: TransactionSerializableEIP1559 = {
    to: accounts[0].address,
    chainId: 1,
    nonce: 0,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
    value: parseEther('1'),
  }

  test('it calls the standard serializeTransaction', () => {
    const serialized = serializeTransaction(transaction)
    expect(serialized).toEqual(
      '0x02ed0180847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
    expect(parseTransaction_(serialized)).toEqual({
      to: accounts[0].address,
      chainId: 1,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
      value: parseEther('1'),
      type: 'eip1559',
    })
  })
})
