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
  parseTransaction,
} from '../../index.js'
import { serializeTransactionCelo } from './serializers.js'
import type {
  TransactionSerializableCIP42,
  TransactionSerializableCIP64,
} from './types.js'

const commonBaseTx = {
  to: accounts[0].address,
  chainId: 42220,
  nonce: 0,
  maxFeePerGas: parseGwei('2'),
  maxPriorityFeePerGas: parseGwei('2'),
  feeCurrency: '0x765de816845861e75a25fca122bb6898b8b1282a',
  value: parseEther('1'),
}
const baseCip42 = {
  ...commonBaseTx,
  type: 'cip42',
} as TransactionSerializableCIP42

const baseCip64 = {
  ...commonBaseTx,
  type: 'cip64',
} as TransactionSerializableCIP64

describe('cip42', () => {
  test('should be able to serialize a cip42 transaction', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
    }

    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf84682a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
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

    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf8a282a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080f85bf859940000000000000000000000000000000000000000f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })

  test('args: data', () => {
    const args: TransactionSerializableCIP42 = {
      ...baseCip42,
      data: '0x1234',
    }
    const serialized = serializeTransactionCelo(args)
    expect(serialized).toEqual(
      '0x7cf84882a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a7640000821234c0',
    )
  })

  test('args: feeCurrency (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gatewayFeeRecipient: accounts[0].address,
      gatewayFee: parseEther('0.1'),
      feeCurrency: undefined,
    }

    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf84e82a4ec8084773594008477359400808094f39fd6e51aad88f6f4ce6ab8827279cfffb9226688016345785d8a000094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('args: gas', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gas: 69420n,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf84982a4ec808477359400847735940083010f2c94765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('args: gas (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gas: undefined,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf84682a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('args: gatewayFee', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gatewayFeeRecipient: accounts[5].address,
      gatewayFee: parseEther('0.1'),
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf86282a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a949965507d1a55bcc2695c58ba16fb37d819b0a4dc88016345785d8a000094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('args: maxFeePerGas (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      // @ts-expect-error
      maxFeePerGas: undefined,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf84282a4ec808477359400808094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('args: maxPriorityFeePerGas (absent)', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      // @ts-expect-error
      maxPriorityFeePerGas: undefined,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf84282a4ec808084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('args: nonce', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      nonce: 20,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf84682a4ec14847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('args: to (absent)', () => {
    const args: TransactionSerializableCIP42 = {
      ...baseCip42,
      to: undefined,
    }
    const serialized = serializeTransactionCelo(args)
    expect(serialized).toEqual(
      '0x7cf282a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808080880de0b6b3a764000080c0',
    )
  })

  test('args: value (absent)', () => {
    const args: TransactionSerializableCIP42 = {
      ...baseCip42,
      value: undefined,
    }
    const serialized = serializeTransactionCelo(args)
    expect(serialized).toEqual(
      '0x7cf83e82a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb922668080c0',
    )
  })

  test('type is undefined but has cip42 fields', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      gatewayFeeRecipient: accounts[7].address,
      gatewayFee: 1000023434343n,
      type: undefined,
    }

    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7cf85f82a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a9414dc79964da2c08b23698b3d3cc7ca32193d995585e8d60aa46794f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0',
    )
  })

  test('signed', async () => {
    const signed = await signTransaction({
      privateKey: accounts[0].privateKey,
      transaction: baseCip42,
      serializer: serializeTransactionCelo,
    })

    expect(signed).toEqual(
      '0x7cf88982a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c080a01ae1d60446ad5fdd620e1982050dc315ff9a0f61b32bcc2a3cdadd0571a76df7a073aba459b3aef6796d5f2a9979551c29f66586821b5613d5080d00782b07c280',
    )
  })

  test('signature', () => {
    expect(
      serializeTransactionCelo(
        baseCip42,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 28n,
        },
      ),
    ).toEqual(
      '0x7cf88982a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransactionCelo(
        baseCip42,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 27n,
        },
      ),
    ).toEqual(
      '0x7cf88982a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c080a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })
})

describe('cip64', () => {
  test('should be able to serialize a cip64 transaction', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
    }

    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7bf84482a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
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

    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7bf8a082a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080f85bf859940000000000000000000000000000000000000000f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe94765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('args: data', () => {
    const args: TransactionSerializableCIP64 = {
      ...baseCip64,
      data: '0x1234',
    }
    const serialized = serializeTransactionCelo(args)
    expect(serialized).toEqual(
      '0x7bf84682a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a7640000821234c094765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('args: gas', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      gas: 69420n,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7bf84782a4ec808477359400847735940083010f2c94f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('args: gas (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      gas: undefined,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7bf84482a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('args: maxFeePerGas (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      // @ts-expect-error
      maxFeePerGas: undefined,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7bf84082a4ec808477359400808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('args: maxPriorityFeePerGas (absent)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      // @ts-expect-error
      maxPriorityFeePerGas: undefined,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7bf84082a4ec808084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('args: nonce', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      nonce: 20,
    }
    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7bf84482a4ec14847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('args: to (absent)', () => {
    const args: TransactionSerializableCIP64 = {
      ...baseCip64,
      to: undefined,
    }
    const serialized = serializeTransactionCelo(args)
    expect(serialized).toEqual(
      '0x7bf082a4ec80847735940084773594008080880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('args: value (absent)', () => {
    const args: TransactionSerializableCIP64 = {
      ...baseCip64,
      value: undefined,
    }
    const serialized = serializeTransactionCelo(args)
    expect(serialized).toEqual(
      '0x7bf83c82a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb922668080c094765de816845861e75a25fca122bb6898b8b1282a',
    )
  })

  test('type is undefined but has cip64 fields (feeCurrency, but not gateway*)', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      feeCurrency: '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73',
      type: undefined,
    }

    expect(serializeTransactionCelo(transaction)).toEqual(
      '0x7bf84482a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094d8763cba276a3738e6de85b4b3bf5fded6d6ca73',
    )
  })

  test('signed', async () => {
    const signed = await signTransaction({
      privateKey: accounts[0].privateKey,
      transaction: baseCip64,
      serializer: serializeTransactionCelo,
    })

    expect(signed).toEqual(
      '0x7bf88782a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a80a07b5ef5199c55a6765782eeb966fe135ff34b39eadabf952dfc00b017924b356aa06425ed31cf71b817c064b669f89d819ee25affa1669270b9b8ac9638b53d7e7f',
    )
  })

  test('signature', () => {
    expect(
      serializeTransactionCelo(
        baseCip64,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 28n,
        },
      ),
    ).toEqual(
      '0x7bf88782a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a01a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransactionCelo(
        baseCip64,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 27n,
        },
      ),
    ).toEqual(
      '0x7bf88782a4ec80847735940084773594008094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c094765de816845861e75a25fca122bb6898b8b1282a80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })
})

describe('invalid params specific to CIP-42', () => {
  test('only one of the gateWayFee fields is defined', () => {
    const transactionA: TransactionSerializableCIP42 = {
      ...baseCip42,
      gatewayFee: undefined,
      gatewayFeeRecipient: accounts[7].address,
    }
    expect(() => serializeTransactionCelo(transactionA)).toThrowError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
    const transactionB: TransactionSerializableCIP42 = {
      ...baseCip42,
      gatewayFee: 1000023434343n,
      gatewayFeeRecipient: undefined,
    }
    expect(() => serializeTransactionCelo(transactionB)).toThrowError(
      '`gatewayFee` and `gatewayFeeRecipient` must be provided together.',
    )
  })
  test('transaction looks like cip42 but does not have values for either feeCurrency or gatewayFee', () => {
    const transaction: TransactionSerializableCIP42 = {
      ...baseCip42,
      feeCurrency: undefined,
      gatewayFee: undefined,
      gatewayFeeRecipient: undefined,
    }
    expect(() => serializeTransactionCelo(transaction)).toThrowError(
      'Either `feeCurrency` or `gatewayFeeRecipient` must be provided for CIP-42 transactions.',
    )
  })
})

describe('invalid params specific to CIP-64', () => {
  test('transaction looks like cip64 but does not have a value for feeCurrency', () => {
    const transaction: TransactionSerializableCIP64 = {
      ...baseCip64,
      feeCurrency: undefined,
    }
    expect(() => serializeTransactionCelo(transaction)).toThrowError(
      '`feeCurrency` must be provided for CIP-64 transactions.',
    )
  })
})

describe.each([
  { typeName: 'CIP-42', baseTransaction: baseCip42 },
  { typeName: 'CIP-64', baseTransaction: baseCip64 },
])('Common invalid params (for $typeName)', ({ typeName, baseTransaction }) => {
  test('invalid to', () => {
    const transaction:
      | TransactionSerializableCIP42
      | TransactionSerializableCIP64 = {
      ...baseTransaction,
      to: '0xdeadbeef',
    }
    expect(() => serializeTransactionCelo(transaction)).toThrowError(
      InvalidAddressError,
    )
  })

  test('maxPriorityFeePerGas is higher than maxPriorityFee', () => {
    const transaction:
      | TransactionSerializableCIP42
      | TransactionSerializableCIP64 = {
      ...baseTransaction,
      maxPriorityFeePerGas: parseGwei('5000000000'),
      maxFeePerGas: parseGwei('1'),
    }
    expect(() => serializeTransactionCelo(transaction)).toThrowError(
      TipAboveFeeCapError,
    )
  })

  test('maxFeePerGas is too high', () => {
    const transaction:
      | TransactionSerializableCIP42
      | TransactionSerializableCIP64 = {
      ...baseTransaction,
      maxPriorityFeePerGas: parseGwei('5000000000'),
      maxFeePerGas:
        115792089237316195423570985008687907853269984665640564039457584007913129639938n,
    }
    expect(() => serializeTransactionCelo(transaction)).toThrowError(
      FeeCapTooHighError,
    )
  })

  test('feeCurrency is not an address', () => {
    const transaction:
      | TransactionSerializableCIP42
      | TransactionSerializableCIP64 = {
      ...baseTransaction,
      // @ts-expect-error
      feeCurrency: 'CUSD',
    }

    expect(() => serializeTransactionCelo(transaction)).toThrowError(
      `\`feeCurrency\` MUST be a token address for ${typeName} transactions.`,
    )
  })

  test('gasPrice is defined', () => {
    const transaction:
      | TransactionSerializableCIP42
      | TransactionSerializableCIP64 = {
      ...baseTransaction,
      // @ts-expect-error
      gasPrice: BigInt(1),
    }

    expect(() => serializeTransactionCelo(transaction)).toThrowError(
      `\`gasPrice\` is not a valid ${typeName} Transaction attribute.`,
    )
  })

  test('chainID is invalid', () => {
    const transaction:
      | TransactionSerializableCIP42
      | TransactionSerializableCIP64 = {
      ...baseTransaction,
      chainId: -1,
    }

    expect(() => serializeTransactionCelo(transaction)).toThrowError(
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

  test('it calls the standard serializeTransactionCelo', () => {
    const serialized = serializeTransactionCelo(transaction)
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
