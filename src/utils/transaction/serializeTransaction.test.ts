import { assertType, describe, expect, test } from 'vitest'
import { accounts } from '../../_test/index.js'
import { serializeTransaction } from './serializeTransaction.js'
import { parseGwei, parseEther } from '../unit/index.js'
import type {
  TransactionSerializableBase,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableLegacy,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedLegacy,
} from '../../types/index.js'
import { parseTransaction } from './parseTransaction.js'
import { keccak256 } from '../hash/index.js'
import { sign } from '../../accounts/utils/sign.js'

const base = {
  to: accounts[1].address,
  nonce: 785,
  value: parseEther('1'),
} satisfies TransactionSerializableBase

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
          v: 28n,
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
          v: 27n,
        },
      ),
    ).toEqual(
      '0x02f8720182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c080a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
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
        "Address \\"0x0000000000000000000000000000000000000000000000000000000000000001\\" is invalid.

        Version: viem@1.0.2"
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
        "Size for storage key \\"0x00000000000000000000000000000000000000000000000000000000000001\\" is invalid. Expected 32 bytes. Got 31 bytes.

        Version: viem@1.0.2"
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
          v: 28n,
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
          v: 27n,
        },
      ),
    ).toEqual(
      '0x01f8a6018203118477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080f838f7941234512345123451234512345123451234512345e1a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe80a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
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
        "Address \\"0x0\\" is invalid.

        Version: viem@1.0.2"
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
        "Size for storage key \\"0x0000000000000000000000000000000000000000000000000000000000001\\" is invalid. Expected 32 bytes. Got 30 bytes.

        Version: viem@1.0.2"
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
        "Invalid \`v\` value \\"29\\". Expected 27 or 28.

        Version: viem@1.0.2"
      `)
    })
  })
})

test('cannot infer type from transaction object', () => {
  expect(() =>
    serializeTransaction({ chainId: 1, data: '0x1234', nonce: 69 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Cannot infer a transaction type from provided transaction.

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
    - a Legacy Transaction with \`gasPrice\`

    Version: viem@1.0.2"
  `)
})
