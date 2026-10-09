import { createClient, http } from 'viem'
import { tempo } from 'viem/chains'
import { Formatters, Transaction } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import { prepareTransactionRequest } from '../../actions/wallet/prepareTransactionRequest.js'
import { setErrorConfig } from '../../errors/base.js'
import { chainConfig } from '../chainConfig.js'
import { assertNonceKey, ReservedNonceKeyError } from './nonce.js'

const client = createClient({
  account: '0x0000000000000000000000000000000000000001',
  chain: tempo,
  transport: http(),
})
const prefix = 0x5bn << 248n
const reserved = [prefix, prefix + 1n, (0x5cn << 248n) - 1n]
const allowed = [
  undefined,
  0n,
  0x5bn,
  prefix - 1n,
  0x5cn << 248n,
  (1n << 256n) - 1n,
]

beforeAll(() => {
  setErrorConfig({ version: 'viem@x.y.z' })
})

describe('assertNonceKey', () => {
  test.each(reserved)('rejects reserved key %s', (nonceKey) => {
    expect(() => assertNonceKey(nonceKey)).toThrowError(ReservedNonceKeyError)
  })

  test('provides an actionable error', () => {
    expect(() => assertNonceKey(prefix)).toThrowErrorMatchingInlineSnapshot(`
      [Nonce.ReservedNonceKeyError: Nonce keys with the 0x5b prefix are reserved for subblocks.

      Choose a nonce key with a different first byte in its 32-byte representation.

      Version: viem@x.y.z]
    `)
  })

  test.each([...allowed, 'expiring' as const])('allows key %s', (nonceKey) => {
    expect(assertNonceKey(nonceKey)).toMatchInlineSnapshot('undefined')
  })
})

describe('transaction preparation', () => {
  test.each(reserved)('rejects reserved key %s', async (nonceKey) => {
    await expect(
      prepareTransactionRequest(client, { nonceKey, parameters: [] }),
    ).rejects.toThrowError(ReservedNonceKeyError)
  })

  test.each(['beforeFillTransaction', 'afterFillParameters'] as const)(
    'rejects reserved keys in the %s hook',
    async (phase) => {
      await expect(
        chainConfig.prepareTransactionRequest[0](
          { nonceKey: prefix },
          { client, phase },
        ),
      ).rejects.toThrowError(ReservedNonceKeyError)
    },
  )

  test.each(allowed)('preserves allowed key %s', async (nonceKey) => {
    const request = await prepareTransactionRequest(client, {
      nonceKey,
      parameters: [],
      validAfter: 1,
      validBefore: 2,
    })

    expect(request.nonceKey).toEqual(nonceKey)
  })
})

describe('transaction serialization', () => {
  test.each(reserved)('rejects reserved key %s', async (nonceKey) => {
    await expect(
      Transaction.serialize({ chainId: tempo.id, nonceKey }),
    ).rejects.toThrowError(ReservedNonceKeyError)
  })

  test.each(allowed)('roundtrips allowed key %s', async (nonceKey) => {
    const serialized = await Transaction.serialize({
      type: 'tempo',
      chainId: tempo.id,
      nonceKey,
    })
    const transaction = Transaction.deserialize(
      serialized as Transaction.TransactionSerializedTempo,
    )

    expect(transaction.nonceKey).toEqual(nonceKey ?? 0n)
  })
})

describe('RPC transaction formatting', () => {
  test.each(reserved)('rejects reserved key %s', (nonceKey) => {
    expect(() =>
      Formatters.formatTransactionRequest({ nonceKey }),
    ).toThrowError(ReservedNonceKeyError)
  })

  test.each(allowed)('formats allowed key %s', (nonceKey) => {
    const request = Formatters.formatTransactionRequest({
      type: 'tempo',
      nonceKey,
    })

    expect(
      request.nonceKey === undefined ? undefined : BigInt(request.nonceKey),
    ).toEqual(nonceKey)
  })
})
