import { describe, expect, test } from 'vitest'
import { accounts } from '../../../test/src/constants.js'
import { getTransaction } from '../../actions/index.js'
import {
  http,
  createPublicClient,
  keccak256,
  parseEther,
  parseGwei,
  parseTransaction,
} from '../../index.js'
import { base } from '../index.js'
import {
  serializeTransaction,
  serializeTransactionDeposit,
} from './serializers.js'
import type { TransactionSerializableDeposit } from './types/transaction.js'

describe('serializeTransaction', async () => {
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

  test('deposit', () => {
    const transaction = {
      from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
      gas: 348576n,
      data: '0xd764ad0b0001000000000000000000000000000000000000000000000000000000021bc70000000000000000000000003154cf16ccdb4c6d922629664174b904d80f2c350000000000000000000000004200000000000000000000000000000000000010000000000000000000000000000000000000000000000000021bb94887478a00000000000000000000000000000000000000000000000000000000000000ea6000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a41635f5fd0000000000000000000000003a23f943181408eac424116af7b7790c94cb97a500000000000000000000000046f84f6e5134d9ff8eca8a56f88766b1007b5a30000000000000000000000000000000000000000000000000021bb94887478a000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      mint: 151918733605440000n,
      sourceHash:
        '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
      to: '0x4200000000000000000000000000000000000007',
      type: 'deposit',
      value: 151918733605440000n,
    } as const

    const serialized = serializeTransaction(transaction)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef90209a018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b94420000000000000000000000000000000000000788021bb94887478a0088021bb94887478a00830551a080b901a4d764ad0b0001000000000000000000000000000000000000000000000000000000021bc70000000000000000000000003154cf16ccdb4c6d922629664174b904d80f2c350000000000000000000000004200000000000000000000000000000000000010000000000000000000000000000000000000000000000000021bb94887478a00000000000000000000000000000000000000000000000000000000000000ea6000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a41635f5fd0000000000000000000000003a23f943181408eac424116af7b7790c94cb97a500000000000000000000000046f84f6e5134d9ff8eca8a56f88766b1007b5a30000000000000000000000000000000000000000000000000021bb94887478a000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"',
    )
  })
})

describe('serializeTransactionDeposit', async () => {
  const baseTransaction = {
    from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
    sourceHash:
      '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
    type: 'deposit',
  } as const satisfies TransactionSerializableDeposit

  test('default', () => {
    const serialized = serializeTransaction(baseTransaction)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef83ca018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b808080808080"',
    )
  })

  test('args: data', () => {
    const tx = {
      ...baseTransaction,
      data: '0xdeadbeef',
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef840a018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b808080808084deadbeef"',
    )
  })

  test('args: gas', () => {
    const tx = {
      ...baseTransaction,
      gas: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef83fa018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b80808083010f2c8080"',
    )
  })

  test('args: isSystemTx', () => {
    const tx = {
      ...baseTransaction,
      isSystemTx: true,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef83ca018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b808080800180"',
    )
  })

  test('args: mint', () => {
    const tx = {
      ...baseTransaction,
      mint: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef83fa018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b8083010f2c80808080"',
    )
  })

  test('args: to', () => {
    const tx = {
      ...baseTransaction,
      to: '0xaabbccddeeff00112233445566778899aabbccdd',
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef850a018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b94aabbccddeeff00112233445566778899aabbccdd8080808080"',
    )
  })

  test('args: value', () => {
    const tx = {
      ...baseTransaction,
      value: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef83fa018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b808083010f2c808080"',
    )
  })

  test('args: no type', () => {
    const serialized = serializeTransaction({
      ...baseTransaction,
      type: undefined,
    } as any)
    expect(serialized).toMatchInlineSnapshot(
      '"0x7ef83ca018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b808080808080"',
    )
  })

  test('error: invalid to', () => {
    const tx = {
      ...baseTransaction,
      to: '0xaabbccddeeff00112233445566778899aabbccd',
    } as const satisfies TransactionSerializableDeposit
    expect(() => serializeTransaction(tx)).toThrowErrorMatchingInlineSnapshot(
      `
      "Address \\"0xaabbccddeeff00112233445566778899aabbccd\\" is invalid.

      Version: viem@1.0.2"
    `,
    )
  })

  test('error: invalid from', () => {
    const tx = {
      ...baseTransaction,
      from: '0xaabbccddeeff00112233445566778899aabbccd',
    } as const satisfies TransactionSerializableDeposit
    expect(() => serializeTransaction(tx)).toThrowErrorMatchingInlineSnapshot(
      `
      "Address \\"0xaabbccddeeff00112233445566778899aabbccd\\" is invalid.

      Version: viem@1.0.2"
    `,
    )
  })

  test('e2e', async () => {
    const client = createPublicClient({
      chain: base,
      transport: http(),
    })

    const hash_1 =
      '0xfd2665b71d667680d4d8afba1cddf1dccd622d303fc336cb3aaec8e4345435bc'
    const tx_1 = await getTransaction(client, {
      hash: hash_1,
    })
    expect(
      keccak256(
        serializeTransactionDeposit({
          ...tx_1,
          data: tx_1.input,
          sourceHash: tx_1.sourceHash!,
          type: 'deposit',
        }),
      ),
    ).toEqual(hash_1)

    const hash_2 =
      '0x7a6307f60eca13ba3fcf58b4fb42d748a57eb1c03cb27553f7062c85ac0485fc'
    const tx_2 = await getTransaction(client, {
      hash: hash_2,
    })
    expect(
      keccak256(
        serializeTransactionDeposit({
          ...tx_2,
          data: tx_2.input,
          sourceHash: tx_2.sourceHash!,
          type: 'deposit',
        }),
      ),
    ).toEqual(hash_2)

    const hash_3 =
      '0x2708d5d73a032a023c7fc19641b5a84483551166205b21a1a11d7d5689c0395c'
    const tx_3 = await getTransaction(client, {
      hash: hash_3,
    })
    expect(
      keccak256(
        serializeTransactionDeposit({
          ...tx_3,
          data: tx_3.input,
          sourceHash: tx_3.sourceHash!,
          type: 'deposit',
        }),
      ),
    ).toEqual(hash_3)

    const hash_4 =
      '0xd5a40724880248619694f94dc8d710cfced12087be4451c314680deb2311d6a6'
    const tx_4 = await getTransaction(client, {
      hash: hash_4,
    })
    expect(
      keccak256(
        serializeTransactionDeposit({
          ...tx_4,
          data: tx_4.input,
          sourceHash: tx_4.sourceHash!,
          type: 'deposit',
        }),
      ),
    ).toEqual(hash_4)
  })
})
