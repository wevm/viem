import { describe, expect, test } from 'vitest'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import { aaPayerType, aaTransactionType, nonceKeyMax } from '../constants.js'
import type { TransactionSerializable8130 } from '../types/transaction.js'
import {
  getPayerSignatureHash8130,
  getSenderSignatureHash8130,
} from './hashTransaction.js'
import { parseTransaction8130 } from './parseTransaction.js'
import { serializeTransaction8130 } from './serializeTransaction.js'

const alice = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const
const bob = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const
const payer = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const
const token = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const

const senderAuth =
  '0x1111111111111111111111111111111111111111111111111111111111111111' as const
const payerAuth =
  '0x2222222222222222222222222222222222222222222222222222222222222222' as const

describe('serializeTransaction (EIP-8130)', () => {
  test('self-pay: simple call', () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: alice,
      nonceSequence: 3n,
      maxPriorityFeePerGas: 1_000_000_000n,
      maxFeePerGas: 2_000_000_000n,
      gas: 100_000n,
      calls: [[{ to: bob, data: '0xdeadbeef' }]],
      senderAuth,
    }
    const serialized = serializeTransaction8130(transaction)
    expect(serialized.startsWith(aaTransactionType)).toBe(true)
    // canonical codec round-trip (addresses are returned lowercase, matching viem)
    expect(serializeTransaction8130(parseTransaction8130(serialized))).toEqual(
      serialized,
    )
    expect(parseTransaction8130(serialized)).toMatchObject({
      chainId: 8453,
      nonceSequence: 3n,
      senderAuth,
    })
  })

  test('sponsored: payer + payerAuth', () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: alice,
      nonceKey: 7n,
      nonceSequence: 1n,
      expiry: 1_900_000_000n,
      maxPriorityFeePerGas: 1n,
      maxFeePerGas: 2n,
      gas: 50_000n,
      calls: [[{ to: token, data: '0xabcd' }], [{ to: bob }]],
      payer,
      senderAuth,
      payerAuth,
    }
    const serialized = serializeTransaction8130(transaction)
    expect(serializeTransaction8130(parseTransaction8130(serialized))).toEqual(
      serialized,
    )
  })

  test('EOA path: no from', () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 1,
      maxFeePerGas: 2n,
      calls: [[{ to: bob, data: '0x' }]],
      senderAuth,
    }
    const serialized = serializeTransaction8130(transaction)
    const parsed = parseTransaction8130(serialized)
    expect(parsed.from).toBeUndefined()
    // re-serialization is stable
    expect(serializeTransaction8130(parsed)).toEqual(serialized)
  })

  test('account changes: create + delegation', () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: alice,
      maxFeePerGas: 2n,
      accountChanges: [
        {
          type: 'create',
          userSalt:
            '0x0000000000000000000000000000000000000000000000000000000000000001',
          code: '0x6080',
          initialActors: [
            {
              actorId:
                '0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8',
              authenticator: '0x0000000000000000000000000000000000000001',
            },
          ],
        },
        { type: 'delegation', target: bob },
      ],
      calls: [[{ to: alice, data: '0x' }]],
      senderAuth,
    }
    const serialized = serializeTransaction8130(transaction)
    expect(serializeTransaction8130(parseTransaction8130(serialized))).toEqual(
      serialized,
    )
  })

  test('account changes: config (actor management)', () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: alice,
      maxFeePerGas: 2n,
      accountChanges: [
        {
          type: 'config',
          chainId: 0,
          sequence: 5,
          actorChanges: [
            {
              changeType: 0x01,
              actorId:
                '0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc',
              authenticator: '0x0000000000000000000000000000000000000001',
              scope: 0x04,
              expiry: 1_900_000_000n,
              policyType: 0x01,
              policyData: '0xc0ffee',
            },
            {
              changeType: 0x02,
              actorId:
                '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            },
          ],
          auth: '0xfeed',
        },
      ],
      senderAuth,
    }
    const serialized = serializeTransaction8130(transaction)
    expect(serializeTransaction8130(parseTransaction8130(serialized))).toEqual(
      serialized,
    )
    // structural round-trip on the parsed actor changes
    const parsed = parseTransaction8130(serialized)
    const config = parsed.accountChanges?.[0]
    expect(config).toMatchObject({ type: 'config', chainId: 0, sequence: 5 })
  })

  test('nonce-free mode (nonceKeyMax)', () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: alice,
      nonceKey: nonceKeyMax,
      expiry: 1_900_000_000n,
      maxFeePerGas: 2n,
      calls: [[{ to: bob }]],
      senderAuth,
    }
    const serialized = serializeTransaction8130(transaction)
    expect(serializeTransaction8130(parseTransaction8130(serialized))).toEqual(
      serialized,
    )
  })
})

describe('assertions', () => {
  test('rejects invalid chainId', () => {
    expect(() =>
      serializeTransaction8130({ chainId: 0, senderAuth }),
    ).toThrowError()
  })

  test('nonce-free mode requires expiry', () => {
    expect(() =>
      serializeTransaction8130({
        chainId: 1,
        nonceKey: nonceKeyMax,
        senderAuth,
      }),
    ).toThrowError()
  })

  test('nonce-free mode rejects non-zero sequence', () => {
    expect(() =>
      serializeTransaction8130({
        chainId: 1,
        nonceKey: nonceKeyMax,
        nonceSequence: 1n,
        expiry: 1_900_000_000n,
        senderAuth,
      }),
    ).toThrowError()
  })

  test('self-pay rejects payerAuth', () => {
    expect(() =>
      serializeTransaction8130({ chainId: 1, senderAuth, payerAuth }),
    ).toThrowError()
  })
})

describe('signature hashes', () => {
  const transaction: TransactionSerializable8130 = {
    chainId: 8453,
    from: alice,
    nonceSequence: 3n,
    maxFeePerGas: 2n,
    gas: 100_000n,
    calls: [[{ to: bob, data: '0xdeadbeef' }]],
    payer,
  }

  test('sender hash is domain-separated from payer hash', () => {
    const senderHash = getSenderSignatureHash8130(transaction)
    const payerHash = getPayerSignatureHash8130(transaction)
    expect(senderHash).not.toEqual(payerHash)
    expect(senderHash).toMatch(/^0x[0-9a-f]{64}$/)
    expect(payerHash).toMatch(/^0x[0-9a-f]{64}$/)
  })

  test('sender hash binds the payer field', () => {
    const withPayer = getSenderSignatureHash8130(transaction)
    const withoutPayer = getSenderSignatureHash8130({
      ...transaction,
      payer: undefined,
    })
    expect(withPayer).not.toEqual(withoutPayer)
  })

  test('payer hash excludes the payer field', () => {
    const a = getPayerSignatureHash8130(transaction)
    const b = getPayerSignatureHash8130({ ...transaction, payer: undefined })
    expect(a).toEqual(b)
  })

  test('uses the correct domain-separation type bytes', () => {
    expect(aaTransactionType).not.toEqual(aaPayerType)
    // bytes output supported
    const bytes = getSenderSignatureHash8130({ ...transaction, to: 'bytes' })
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(keccak256(bytes)).toMatch(/^0x/)
  })
})
