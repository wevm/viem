import { describe, expect, test } from 'vitest'
import { accounts } from '../../test/src/constants.js'
import { getTransaction } from '../actions/index.js'
import { base } from '../chains/index.js'
import {
  http,
  createPublicClient,
  keccak256,
  parseEther,
  parseGwei,
} from '../index.js'
import { parseTransaction } from './parsers.js'
import { serializeTransaction } from './serializers.js'
import type { TransactionSerializableDeposit } from './types/transaction.js'

describe('deposit', async () => {
  const baseTransaction = {
    from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
    sourceHash:
      '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
    type: 'deposit',
  } as const satisfies TransactionSerializableDeposit

  test('default', () => {
    const serialized = serializeTransaction(baseTransaction)
    expect(parseTransaction(serialized)).toEqual(baseTransaction)
  })

  test('args: data', () => {
    const tx = {
      ...baseTransaction,
      data: '0xdeadbeef',
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(parseTransaction(serialized)).toEqual(tx)
  })

  test('args: gas', () => {
    const tx = {
      ...baseTransaction,
      gas: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(parseTransaction(serialized)).toEqual(tx)
  })

  test('args: isSystemTx', () => {
    const tx = {
      ...baseTransaction,
      isSystemTx: true,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(parseTransaction(serialized)).toEqual(tx)
  })

  test('args: mint', () => {
    const tx = {
      ...baseTransaction,
      mint: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(parseTransaction(serialized)).toEqual(tx)
  })

  test('args: to', () => {
    const tx = {
      ...baseTransaction,
      to: '0xaabbccddeeff00112233445566778899aabbccdd',
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(parseTransaction(serialized)).toEqual(tx)
  })

  test('args: value', () => {
    const tx = {
      ...baseTransaction,
      value: 69420n,
    } as const satisfies TransactionSerializableDeposit
    const serialized = serializeTransaction(tx)
    expect(parseTransaction(serialized)).toEqual(tx)
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
      [InvalidAddressError: Address "0xaabbccddeeff00112233445566778899aabbccd" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
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
      [InvalidAddressError: Address "0xaabbccddeeff00112233445566778899aabbccd" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
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
        serializeTransaction({
          ...tx_1,
          data: tx_1.input,
          sourceHash: tx_1.sourceHash!,
          type: 'deposit',
        } as TransactionSerializableDeposit),
      ),
    ).toEqual(hash_1)

    const hash_2 =
      '0x7a6307f60eca13ba3fcf58b4fb42d748a57eb1c03cb27553f7062c85ac0485fc'
    const tx_2 = await getTransaction(client, {
      hash: hash_2,
    })
    expect(
      keccak256(
        serializeTransaction({
          ...tx_2,
          data: tx_2.input,
          sourceHash: tx_2.sourceHash!,
          type: 'deposit',
        } as TransactionSerializableDeposit),
      ),
    ).toEqual(hash_2)

    const hash_3 =
      '0x2708d5d73a032a023c7fc19641b5a84483551166205b21a1a11d7d5689c0395c'
    const tx_3 = await getTransaction(client, {
      hash: hash_3,
    })
    expect(
      keccak256(
        serializeTransaction({
          ...tx_3,
          data: tx_3.input,
          sourceHash: tx_3.sourceHash!,
          type: 'deposit',
        } as TransactionSerializableDeposit),
      ),
    ).toEqual(hash_3)

    const hash_4 =
      '0xd5a40724880248619694f94dc8d710cfced12087be4451c314680deb2311d6a6'
    const tx_4 = await getTransaction(client, {
      hash: hash_4,
    })
    expect(
      keccak256(
        serializeTransaction({
          ...tx_4,
          data: tx_4.input,
          sourceHash: tx_4.sourceHash!,
          type: 'deposit',
        } as TransactionSerializableDeposit),
      ),
    ).toEqual(hash_4)
  })
})

describe('eip1559', async () => {
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
