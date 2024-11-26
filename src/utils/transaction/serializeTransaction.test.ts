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
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedEIP4844,
  TransactionSerializedEIP7702,
  TransactionSerializedLegacy,
} from '../../types/transaction.js'
import { keccak256 } from '../hash/keccak256.js'
import { parseEther } from '../unit/parseEther.js'
import { parseGwei } from '../unit/parseGwei.js'

import type { Address } from 'abitype'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { blobData, kzg } from '../../../test/src/kzg.js'
import { sidecarsToVersionedHashes } from '../blob/sidecarsToVersionedHashes.js'
import { toBlobSidecars } from '../blob/toBlobSidecars.js'
import { toBlobs } from '../blob/toBlobs.js'
import { stringToHex } from '../index.js'
import { parseTransaction } from './parseTransaction.js'
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
        contractAddress: wagmiContractConfig.address.toLowerCase() as Address,
        chainId: 1,
        nonce: 420,
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        v: 27n,
        yParity: 0,
      },
      {
        contractAddress: '0x0000000000000000000000000000000000000000',
        chainId: 10,
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
    assertType<TransactionSerializedEIP7702>(serialized)
    expect(serialized).toMatchInlineSnapshot(
      `"0x04f8e3018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0f8baf85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a480a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fef85a0a9400000000000000000000000000000000000000004501a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe"`,
    )
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip7702,
      type: 'eip7702',
    })
  })

  test('signature', () => {
    expect(
      serializeTransaction(baseEip7702, {
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        yParity: 1,
      }),
    ).toMatchInlineSnapshot(
      `"0x04f90126018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0f8baf85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a480a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fef85a0a9400000000000000000000000000000000000000004501a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe01a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe"`,
    )
    expect(
      serializeTransaction(
        baseEip7702,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 0,
        },
      ),
    ).toMatchInlineSnapshot(
      `"0x04f90126018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0f8baf85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a480a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fef85a0a9400000000000000000000000000000000000000004501a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe"`,
    )
    expect(
      serializeTransaction(
        baseEip7702,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 0n,
        },
      ),
    ).toMatchInlineSnapshot(
      `"0x04f90126018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0f8baf85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a480a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fef85a0a9400000000000000000000000000000000000000004501a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe"`,
    )
    expect(
      serializeTransaction(
        baseEip7702,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 1n,
        },
      ),
    ).toMatchInlineSnapshot(
      `"0x04f90126018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0f8baf85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a480a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fef85a0a9400000000000000000000000000000000000000004501a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe01a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe"`,
    )
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
    assertType<TransactionSerializedEIP4844>(serialized)
    expect(serialized).toEqual(
      '0x03f84a018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c080e1a001adbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    )
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip4844,
      type: 'eip4844',
    })
  })

  test('signature', () => {
    expect(
      serializeTransaction(baseEip4844, {
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        yParity: 1,
      }),
    ).toEqual(
      '0x03f88d018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c080e1a001adbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef01a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip4844,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 0,
        },
      ),
    ).toEqual(
      '0x03f88d018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c080e1a001adbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip4844,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 0n,
        },
      ),
    ).toEqual(
      '0x03f88d018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c080e1a001adbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip4844,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 1n,
        },
      ),
    ).toEqual(
      '0x03f88d018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c080e1a001adbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef01a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })

  test('network wrapper (blobVersionedHashes + sidecars)', () => {
    const sidecars = toBlobSidecars({ data: stringToHex('abcd'), kzg })
    const blobVersionedHashes = sidecarsToVersionedHashes({ sidecars })
    const transaction = {
      ...baseEip4844,
      blobVersionedHashes,
      sidecars,
    } satisfies TransactionSerializableEIP4844
    const serialized = serializeTransaction(transaction)
    assertType<TransactionSerializedEIP4844>(serialized)
    expect(serialized).toMatchSnapshot()
    expect(parseTransaction(serialized)).toEqual({
      ...transaction,
      type: 'eip4844',
    })
  })

  test('network wrapper (blobs + blobVersionedHashes + sidecars)', () => {
    const sidecars = toBlobSidecars({ data: stringToHex('abcd'), kzg })
    const blobVersionedHashes = sidecarsToVersionedHashes({ sidecars })
    const transaction = {
      ...baseEip4844,
      blobVersionedHashes,
      sidecars,
    } satisfies TransactionSerializableEIP4844
    const serialized = serializeTransaction({
      ...transaction,
      blobs: toBlobs({ data: stringToHex('abcd') }),
    } as unknown as TransactionSerializableEIP4844)
    expect(serialized).toMatchSnapshot()
    expect(parseTransaction(serialized)).toEqual({
      ...transaction,
      type: 'eip4844',
    })
  })

  test('network wrapper (blobs + kzg)', () => {
    const transaction = {
      ...baseEip4844,
      blobVersionedHashes: undefined,
      sidecars: undefined,
      blobs: toBlobs({ data: stringToHex(blobData) }),
      kzg,
    } satisfies TransactionSerializableEIP4844
    const serialized = serializeTransaction(transaction)
    assertType<TransactionSerializedEIP4844>(serialized)
    expect(serialized).toMatchSnapshot()
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
    assertType<TransactionSerializedEIP1559>(serialized)
    expect(serialized).toEqual(
      '0x02ef0182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0',
    )
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip1559,
      type: 'eip1559',
    })
  })

  test('default (all zeros)', () => {
    const baseEip1559Zero = {
      to: accounts[1].address,
      nonce: 0,
      chainId: 1,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      value: 0n,
    } satisfies TransactionSerializableEIP1559

    const serialized = serializeTransaction(baseEip1559Zero)

    expect(serialized).toEqual(
      '0x02dd01808080809470997970c51812dc3a010c7d01b50e0d17dc79c88080c0',
    )
    expect(parseTransaction(serialized)).toEqual({
      chainId: 1,
      to: accounts[1].address,
      type: 'eip1559',
    })
  })

  test('minimal (w/ maxFeePerGas)', () => {
    const args = {
      chainId: 1,
      maxFeePerGas: 1n,
    }
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual('0x02c90180800180808080c0')
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip1559' })
  })

  test('minimal (w/ type)', () => {
    const args = {
      chainId: 1,
      type: 'eip1559',
    } as const
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual('0x02c90180808080808080c0')
    expect(parseTransaction(serialized)).toEqual(args)
  })

  test('args: gas', () => {
    const args = {
      ...baseEip1559,
      gas: 21001n,
    }
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0x02f101820311847735940084773594008252099470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0',
    )
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
    expect(serialized).toEqual(
      '0x02f88b0182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f85bf859940000000000000000000000000000000000000000f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip1559' })
  })

  test('args: data', () => {
    const args = {
      ...baseEip1559,
      data: '0x1234',
    } satisfies TransactionSerializableEIP1559
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0x02f10182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a7640000821234c0',
    )
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip1559' })
  })

  test('signed', async () => {
    const signature = await sign({
      hash: keccak256(serializeTransaction(baseEip1559)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(baseEip1559, signature)
    expect(serialized).toEqual(
      '0x02f8720182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c001a0ce18214ff9d06ecaacb61811f9d6dc2be922e8cebddeaf6df0b30d5c498f6d33a05f0487c6dbbf2139f7c705d8054dbb16ecac8ae6256ce2c4c6f2e7ef35b3a496',
    )
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip1559,
      ...signature,
      type: 'eip1559',
      yParity: 1,
    })
  })

  test('signature', () => {
    expect(
      serializeTransaction(
        baseEip1559,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 1,
        },
      ),
    ).toEqual(
      '0x02f8720182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip1559,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 0,
        },
      ),
    ).toEqual(
      '0x02f8720182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c080a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip1559,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 0n,
        },
      ),
    ).toEqual(
      '0x02f8720182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c080a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip1559,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 1n,
        },
      ),
    ).toEqual(
      '0x02f8720182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })

  describe('errors', () => {
    test('invalid access list (invalid address)', () => {
      expect(() =>
        serializeTransaction({
          ...baseEip1559,
          accessList: [
            {
              address:
                '0x0000000000000000000000000000000000000000000000000000000000000001',
              storageKeys: [
                '0x0000000000000000000000000000000000000000000000000000000000000001',
              ],
            },
          ],
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidAddressError: Address "0x0000000000000000000000000000000000000000000000000000000000000001" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.

        Version: viem@x.y.z]
      `)
    })

    test('invalid access list (invalid storage key)', () => {
      expect(() =>
        serializeTransaction({
          ...baseEip1559,
          accessList: [
            {
              address:
                '0x0000000000000000000000000000000000000000000000000000000000000001',
              storageKeys: [
                '0x00000000000000000000000000000000000000000000000000000000000001',
              ],
            },
          ],
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidStorageKeySizeError: Size for storage key "0x00000000000000000000000000000000000000000000000000000000000001" is invalid. Expected 32 bytes. Got 31 bytes.

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
  } satisfies TransactionSerializableEIP2930

  test('default', () => {
    const serialized = serializeTransaction(baseEip2930)
    assertType<TransactionSerializedEIP2930>(serialized)
    expect(serialized).toEqual(
      '0x01f863018203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip2930,
      type: 'eip2930',
    })
  })

  test('default (all zeros)', () => {
    const baseEip2930Zero = {
      to: accounts[1].address,
      nonce: 0,
      chainId: 1,
      value: 0n,
      gasPrice: 0n,
      accessList: [],
    } satisfies TransactionSerializableEIP2930

    const serialized = serializeTransaction(baseEip2930Zero)

    expect(serialized).toEqual(
      '0x01dc018080809470997970c51812dc3a010c7d01b50e0d17dc79c88080c0',
    )

    expect(parseTransaction(serialized)).toEqual({
      chainId: 1,
      to: accounts[1].address,
      type: 'eip2930',
    })
  })

  test('minimal (w/ accessList & gasPrice)', () => {
    const args = {
      chainId: 1,
      accessList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
          ],
        },
      ],
      gasPrice: parseGwei('2'),
    } satisfies TransactionSerializableEIP2930
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0x01f8450180847735940080808080f838f7940000000000000000000000000000000000000000e1a00000000000000000000000000000000000000000000000000000000000000001',
    )
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('minimal (w/ type)', () => {
    const args = {
      chainId: 1,
      type: 'eip2930',
    } satisfies TransactionSerializableEIP2930
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual('0x01c801808080808080c0')
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('args: gas', () => {
    const args = {
      ...baseEip2930,
      gas: 21001n,
    }
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0x01f8650182031184773594008252099470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('args: data', () => {
    const args = {
      ...baseEip2930,
      data: '0x1234',
    } satisfies TransactionSerializableEIP2930
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0x01f865018203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a7640000821234f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'eip2930' })
  })

  test('signed', async () => {
    const signature = await sign({
      hash: keccak256(serializeTransaction(baseEip2930)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(baseEip2930, signature)
    expect(serialized).toEqual(
      '0x01f8a6018203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe01a0dc7b3483c0b183823f07d77247c60678d861080acdc4fb8b9fd131770b475c40a040f16567391132746735aff4d5a3fa5ae42ff3d5d538e341870e0259dc40741a',
    )
    expect(parseTransaction(serialized)).toEqual({
      ...baseEip2930,
      ...signature,
      type: 'eip2930',
      yParity: 1,
    })
  })

  test('signature', () => {
    expect(
      serializeTransaction(
        baseEip2930,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 1,
        },
      ),
    ).toEqual(
      '0x01f8a6018203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe01a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip2930,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          yParity: 0,
        },
      ),
    ).toEqual(
      '0x01f8a6018203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip2930,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 0n,
        },
      ),
    ).toEqual(
      '0x01f8a6018203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseEip2930,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 1n,
        },
      ),
    ).toEqual(
      '0x01f8a6018203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe01a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })

  describe('errors', () => {
    test('invalid access list (invalid address)', () => {
      expect(() =>
        serializeTransaction({
          ...baseEip2930,
          accessList: [
            {
              address: '0x0',
              storageKeys: [
                '0x0000000000000000000000000000000000000000000000000000000000000001',
              ],
            },
          ],
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidAddressError: Address "0x0" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.

        Version: viem@x.y.z]
      `)
    })

    test('invalid access list (invalid storage key)', () => {
      expect(() =>
        serializeTransaction({
          ...baseEip2930,
          accessList: [
            {
              address: '0x0',
              storageKeys: [
                '0x0000000000000000000000000000000000000000000000000000000000001',
              ],
            },
          ],
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidStorageKeySizeError: Size for storage key "0x0000000000000000000000000000000000000000000000000000000000001" is invalid. Expected 32 bytes. Got 30 bytes.

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
    assertType<TransactionSerializedLegacy>(serialized)
    expect(serialized).toEqual(
      '0xe88203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080',
    )
    expect(parseTransaction(serialized)).toEqual({
      ...baseLegacy,
      type: 'legacy',
    })
  })

  test('default (all zeros)', () => {
    const baseLegacyZero = {
      to: accounts[1].address,
      nonce: 0,
      value: 0n,
      gasPrice: 0n,
    } satisfies TransactionSerializableLegacy

    const serialized = serializeTransaction(baseLegacyZero)

    expect(serialized).toEqual(
      '0xda8080809470997970c51812dc3a010c7d01b50e0d17dc79c88080',
    )

    expect(parseTransaction(serialized)).toEqual({
      to: accounts[1].address,
      type: 'legacy',
    })
  })

  test('minimal (w/ gasPrice)', () => {
    const args = {
      gasPrice: parseGwei('2'),
    } satisfies TransactionSerializableLegacy
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual('0xca80847735940080808080')
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('minimal (w/ type)', () => {
    const args = {
      type: 'legacy',
    } satisfies TransactionSerializableLegacy
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual('0xc6808080808080')
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('args: gas', () => {
    const args = {
      ...baseLegacy,
      gas: 21001n,
    }
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0xea82031184773594008252099470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080',
    )
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('args: data', () => {
    const args = {
      ...baseLegacy,
      data: '0x1234',
    } satisfies TransactionSerializableLegacy
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0xea8203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a7640000821234',
    )
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('args: chainId', () => {
    const args = {
      ...baseLegacy,
      chainId: 69,
    } satisfies TransactionSerializableLegacy
    const serialized = serializeTransaction(args)
    expect(serialized).toEqual(
      '0xeb8203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080458080',
    )
    expect(parseTransaction(serialized)).toEqual({ ...args, type: 'legacy' })
  })

  test('signed', async () => {
    const signature = await sign({
      hash: keccak256(serializeTransaction(baseLegacy)),
      privateKey: accounts[0].privateKey,
    })
    const serialized = serializeTransaction(baseLegacy, signature)
    expect(serialized).toEqual(
      '0xf86b8203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a7640000801ca06cb0e8d21e5baf998fb9a05f47acd83692dc148f90b81b332a152f020da0ae98a0344e49bacb1ef7af7c2ffed9e88d3f0ae0aa4945c9da0a660a03717dd5621f98',
    )
    expect(parseTransaction(serialized)).toEqual({
      ...baseLegacy,
      ...signature,
      yParity: 1,
      type: 'legacy',
    })
  })

  test('signature', () => {
    expect(
      serializeTransaction(
        baseLegacy,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 28n,
        },
      ),
    ).toEqual(
      '0xf86b8203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a7640000801ca060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
    expect(
      serializeTransaction(
        baseLegacy,

        {
          r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
          v: 27n,
        },
      ),
    ).toEqual(
      '0xf86b8203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a7640000801ba060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
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
    expect(serialized).toEqual(
      '0xf86c8203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008081ada02f43314322cf4c5dd645b028aa0b0dadff0fb73c41a6f0620ff1dfb11601ac30a066f37a65e139fa4b6df33a42ab5ccaeaa7a109382e7430caefd1deee63962626',
    )
    expect(parseTransaction(serialized)).toEqual({
      ...args,
      ...signature,
      yParity: 0,
      type: 'legacy',
      v: 173n,
    })
  })

  describe('errors', () => {
    test('invalid v', () => {
      expect(() =>
        serializeTransaction(
          baseLegacy,

          {
            r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
            s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
            v: 29n,
          },
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidLegacyVError: Invalid \`v\` value "29". Expected 27 or 28.

        Version: viem@x.y.z]
      `)
    })
  })
})

test('cannot infer type from transaction object', () => {
  expect(() =>
    serializeTransaction({ chainId: 1, data: '0x1234', nonce: 69 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidSerializableTransactionError: Cannot infer a transaction type from provided transaction.

    Provided Transaction:
    {
      chainId:  1
      data:     0x1234
      nonce:    69
    }

    To infer the type, either provide:
    - a \`type\` to the Transaction, or
    - an EIP-1559 Transaction with \`maxFeePerGas\`, or
    - an EIP-2930 Transaction with \`gasPrice\` & \`accessList\`, or
    - an EIP-4844 Transaction with \`blobs\`, \`blobVersionedHashes\`, \`sidecars\`, or
    - an EIP-7702 Transaction with \`authorizationList\`, or
    - a Legacy Transaction with \`gasPrice\`

    Version: viem@x.y.z]
  `)
})

describe('github', () => {
  test('https://github.com/wevm/viem/issues/1433', () => {
    expect(
      serializeTransaction(
        {
          blockHash: null,
          blockNumber: null,
          from: '0xc702b9950e44f7d321fa16ee88bf8e1a561249ba',
          gas: 51627n,
          gasPrice: 3000000000n,
          hash: '0x3eaa88a766e82cbe53c95218ab4c3cf316325802b5f75d086b5121007b918e92',
          input:
            '0xa9059cbb00000000000000000000000082fc882199816bcec06baf848eaec51c2f96c85b000000000000000000000000000000000000000000000000eccae3078bacd15d',
          nonce: 117,
          to: '0x55d398326f99059ff775485246999027b3197955',
          transactionIndex: null,
          value: 0n,
          type: 'legacy',
          v: 84475n,
          r: '0x73b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bf',
          s: '0x354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23',
          chainId: undefined,
          typeHex: '0x0',
        },
        {
          v: 84475n,
          r: '0x73b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bf',
          s: '0x354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23',
        },
      ),
    ).toMatchInlineSnapshot(
      '"0xf8667584b2d05e0082c9ab9455d398326f99059ff775485246999027b31979558080830149fba073b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bfa0354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23"',
    )

    expect(
      serializeTransaction(
        {
          blockHash: null,
          blockNumber: null,
          from: '0xc702b9950e44f7d321fa16ee88bf8e1a561249ba',
          gas: 51627n,
          gasPrice: 3000000000n,
          hash: '0x3eaa88a766e82cbe53c95218ab4c3cf316325802b5f75d086b5121007b918e92',
          input:
            '0xa9059cbb00000000000000000000000082fc882199816bcec06baf848eaec51c2f96c85b000000000000000000000000000000000000000000000000eccae3078bacd15d',
          nonce: 117,
          to: '0x55d398326f99059ff775485246999027b3197955',
          transactionIndex: null,
          value: 0n,
          type: 'legacy',
          v: 84476n,
          r: '0x73b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bf',
          s: '0x354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23',
          chainId: undefined,
          typeHex: '0x0',
        },
        {
          v: 84476n,
          r: '0x73b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bf',
          s: '0x354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23',
        },
      ),
    ).toMatchInlineSnapshot(
      '"0xf8667584b2d05e0082c9ab9455d398326f99059ff775485246999027b31979558080830149fca073b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bfa0354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23"',
    )

    expect(
      serializeTransaction(
        {
          blockHash: null,
          blockNumber: null,
          from: '0xc702b9950e44f7d321fa16ee88bf8e1a561249ba',
          gas: 51627n,
          gasPrice: 3000000000n,
          hash: '0x3eaa88a766e82cbe53c95218ab4c3cf316325802b5f75d086b5121007b918e92',
          input:
            '0xa9059cbb00000000000000000000000082fc882199816bcec06baf848eaec51c2f96c85b000000000000000000000000000000000000000000000000eccae3078bacd15d',
          nonce: 117,
          to: '0x55d398326f99059ff775485246999027b3197955',
          transactionIndex: null,
          value: 0n,
          type: 'legacy',
          v: 35n,
          r: '0x73b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bf',
          s: '0x354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23',
          chainId: undefined,
          typeHex: '0x0',
        },
        {
          v: 35n,
          r: '0x73b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bf',
          s: '0x354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23',
        },
      ),
    ).toMatchInlineSnapshot(
      '"0xf8637584b2d05e0082c9ab9455d398326f99059ff775485246999027b319795580801ba073b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bfa0354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23"',
    )

    expect(
      serializeTransaction(
        {
          blockHash: null,
          blockNumber: null,
          from: '0xc702b9950e44f7d321fa16ee88bf8e1a561249ba',
          gas: 51627n,
          gasPrice: 3000000000n,
          hash: '0x3eaa88a766e82cbe53c95218ab4c3cf316325802b5f75d086b5121007b918e92',
          input:
            '0xa9059cbb00000000000000000000000082fc882199816bcec06baf848eaec51c2f96c85b000000000000000000000000000000000000000000000000eccae3078bacd15d',
          nonce: 117,
          to: '0x55d398326f99059ff775485246999027b3197955',
          transactionIndex: null,
          value: 0n,
          type: 'legacy',
          v: 36n,
          r: '0x73b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bf',
          s: '0x354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23',
          chainId: undefined,
          typeHex: '0x0',
        },
        {
          v: 36n,
          r: '0x73b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bf',
          s: '0x354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23',
        },
      ),
    ).toMatchInlineSnapshot(
      '"0xf8637584b2d05e0082c9ab9455d398326f99059ff775485246999027b319795580801ca073b39769ff4a36515c8fca546550a3fdafebbf37fa9e22be2d92b44653ade7bfa0354c756a1aa3346e9b3ea5423ac99acfc005e9cce2cd698e14d792f43fa15a23"',
    )
  })

  test('https://github.com/wevm/viem/issues/1849', async () => {
    const tx = {
      blockHash:
        '0xbfafd5da42c7e715149a1fbcc20c40bcf5f62e013f60af9cdf07c27142b6a0ff',
      blockNumber: 19295009n,
      gas: 421374n,
      gasPrice: 20701311233n,
      input:
        '0x3a2b7b980000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000726000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000065d96f1b00000000000000000000000000000000000000000000000000000000000000030b010c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000c23190af48df1c00000000000000000000000000000000000000000000000000000000000001000000000000000000000000002648f5592c09a260c601acde44e7f8f2944944fb0000000000000000000000000000000000000000000000000f43fc2c04ee000000000000000000000000000000000000000000000000000000c23190af48df1c00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bbe33f57f41a20b2f00dec91dcc1169597f36221f002710c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000023a03a3f85888a471f4effcafa03431511e388560000000000000000000000000000000000000000000000000000000000000000',
      nonce: 38,
      to: '0x2648f5592c09a260c601acde44e7f8f2944944fb',
      transactionIndex: 74,
      value: 57108134443873424n,
      type: 'legacy',
      chainId: 1,
      v: 38n,
      r: '0x5abc283bf902f90884f800b2f810febd5e90f8d5077d89e150631bbcc547b7d1',
      s: '0x5acc7718573bcd268256c996f2ae1bdd2bd97019992f44d5806b1cc843cde2e7',
      typeHex: '0x0',
    } as const

    const serialized = serializeTransaction({ ...tx, data: tx.input }, tx)

    expect(keccak256(serialized)).toEqual(
      '0x6ed21df69b02678dfb290ef2a43d490303562eb387f70795766b37bfa9d09bd2',
    )
  })

  test('https://github.com/wevm/viem/issues/2394', async () => {
    const serialized = serializeTransaction(
      {
        chainId: 17000,
        gas: BigInt('0x52080'),
        maxFeePerGas: BigInt('0x0'),
        maxPriorityFeePerGas: BigInt('0x0'),
        nonce: 0,
        to: '0xc000000000000000000000000000000000000000',
        value: BigInt('0x0'),
      },
      {
        r: '0x0',
        s: '0x0',
        yParity: 0,
      },
    )
    expect(serialized).toEqual(
      '0x02e58242688080808305208094c0000000000000000000000000000000000000008080c0808080',
    )
  })
})
