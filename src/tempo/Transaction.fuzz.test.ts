import { fc, test } from '@fast-check/vitest'
import { Hex, Rlp } from 'ox'
import { TxEnvelopeTempo as TxTempo } from 'ox/tempo'
import { describe, expect } from 'vitest'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import * as Transaction from './Transaction.js'

const maxUint256 = 2n ** 256n - 1n

const address = fc
  .uint8Array({ minLength: 20, maxLength: 20 })
  .map((value) => Hex.fromBytes(value))
const data = fc
  .uint8Array({ minLength: 1, maxLength: 128 })
  .map((value) => Hex.fromBytes(value))
const hash = fc
  .uint8Array({ minLength: 32, maxLength: 32 })
  .map((value) => Hex.fromBytes(value))

const call = fc.record({
  data: fc.option(data, { nil: undefined }),
  to: fc.option(address, { nil: undefined }),
  value: fc.option(fc.bigInt({ min: 0n, max: maxUint256 }), {
    nil: undefined,
  }),
})

const accessList = fc.option(
  fc.array(
    fc.record({
      address,
      storageKeys: fc.array(hash, { maxLength: 4 }),
    }),
    { minLength: 1, maxLength: 4 },
  ),
  { nil: undefined },
)

const fees = fc
  .record({
    maxFeePerGas: fc.option(fc.bigInt({ min: 0n, max: maxUint256 }), {
      nil: undefined,
    }),
    priorityRatio: fc.integer({ min: 0, max: 100 }),
  })
  .map(({ maxFeePerGas, priorityRatio }) => ({
    maxFeePerGas,
    maxPriorityFeePerGas:
      typeof maxFeePerGas === 'bigint'
        ? (maxFeePerGas * BigInt(priorityRatio)) / 100n
        : undefined,
  }))

const validityWindow = fc.oneof(
  fc.constant({ validAfter: undefined, validBefore: undefined }),
  fc.integer({ min: 0, max: 2 ** 32 }).map((validAfter) => ({
    validAfter,
    validBefore: undefined,
  })),
  fc.integer({ min: 1, max: 2 ** 32 }).map((validBefore) => ({
    validAfter: undefined,
    validBefore,
  })),
  fc
    .record({
      duration: fc.integer({ min: 1, max: 86_400 }),
      validAfter: fc.integer({ min: 0, max: 2 ** 32 - 86_400 }),
    })
    .map(({ duration, validAfter }) => ({
      validAfter,
      validBefore: validAfter + duration,
    })),
)

const transaction = fc
  .record({
    accessList,
    calls: fc.array(call, { minLength: 1, maxLength: 6 }),
    chainId: fc.integer({ min: 1, max: 2 ** 32 }),
    feeToken: fc.option(
      fc.oneof(address, fc.bigInt({ min: 0n, max: 2n ** 144n - 1n })),
      { nil: undefined },
    ),
    gas: fc.option(fc.bigInt({ min: 0n, max: maxUint256 }), {
      nil: undefined,
    }),
    nonce: fc.option(fc.integer({ min: 0, max: 2 ** 32 }), {
      nil: undefined,
    }),
    nonceKey: fc.option(fc.bigInt({ min: 0n, max: 2n ** 192n - 1n }), {
      nil: undefined,
    }),
  })
  .chain((transaction) =>
    fc.tuple(fc.constant(transaction), fees, validityWindow),
  )
  .map(([transaction, fees, validityWindow]) => ({
    ...transaction,
    ...fees,
    ...validityWindow,
  }))

const invalidEnvelope = fc
  .record({
    fields: fc.oneof(
      fc.array(data, { maxLength: 12 }),
      fc.array(data, { minLength: 16, maxLength: 24 }),
    ),
    type: fc.constantFrom('0x76' as const, '0x78' as const),
  })
  .map(({ fields, type }) => Hex.concat(type, Rlp.fromHex(fields)))

describe('Transaction serialization: fuzz', () => {
  test.prop({ transaction }, fuzzParameters(500))(
    'matches ox and preserves the canonical envelope across round trips',
    async ({ transaction }) => {
      const referenceTransaction = {
        ...transaction,
        nonce:
          typeof transaction.nonce === 'number'
            ? BigInt(transaction.nonce)
            : undefined,
        type: 'tempo' as const,
      }
      const reference = TxTempo.serialize(referenceTransaction)

      const serialized = await Transaction.serialize(transaction as never)
      expect(serialized).toBe(reference)

      const deserialized = Transaction.deserialize(
        serialized as `0x76${string}`,
      )
      const reserialized = await Transaction.serialize(deserialized)

      expect(reserialized).toBe(serialized)
      expect(deserialized.calls).toEqual(TxTempo.deserialize(reference).calls)
      expect(deserialized.nonce).toBe(
        Number(TxTempo.deserialize(reference).nonce ?? 0n),
      )
    },
  )

  test.prop({ serialized: invalidEnvelope }, fuzzParameters(500))(
    'rejects envelopes with invalid RLP field counts',
    ({ serialized }) => {
      expect(() =>
        Transaction.deserialize(
          serialized as `0x76${string}` | `0x78${string}`,
        ),
      ).toThrow()
    },
  )
})
