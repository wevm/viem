import { fc, test } from '@fast-check/vitest'
import { Hex, Secp256k1, Signature } from 'ox'
import {
  SignatureEnvelope,
  TokenId,
  TxEnvelopeTempo as TxTempo,
} from 'ox/tempo'
import { describe, expect } from 'vitest'
import { accounts } from '~test/tempo/config.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import * as Transaction from './Transaction.js'

const maxUint256 = 2n ** 256n - 1n

const address = fc
  .uint8Array({ minLength: 20, maxLength: 20 })
  .map((value) => Hex.fromBytes(value))
const data = fc
  .uint8Array({ minLength: 1, maxLength: 128 })
  .map((value) => Hex.fromBytes(value))

const call = fc.record({
  data: fc.option(data, { nil: undefined }),
  to: address,
  value: fc.option(fc.bigInt({ min: 0n, max: maxUint256 }), {
    nil: undefined,
  }),
})

const scenario = fc
  .record({
    calls: fc.array(call, { minLength: 1, maxLength: 6 }),
    chainId: fc.integer({ min: 1, max: 2 ** 32 }),
    feeToken: fc.bigInt({ min: 0n, max: 2n ** 144n - 2n }),
    gas: fc.option(fc.bigInt({ min: 0n, max: maxUint256 }), {
      nil: undefined,
    }),
    maxFeePerGas: fc.bigInt({ min: 0n, max: maxUint256 }),
    nonce: fc.integer({ min: 0, max: 2 ** 32 }),
    nonceKey: fc.bigInt({ min: 0n, max: 2n ** 192n - 1n }),
    payerOffset: fc.integer({ min: 1, max: 10 }),
    senderIndex: fc.integer({ min: 0, max: 10 }),
  })
  .chain((scenario) =>
    fc.tuple(
      fc.constant(scenario),
      fc.integer({ min: 0, max: 100 }),
      fc.constantFrom('payer-first' as const, 'sender-first' as const),
    ),
  )
  .map(([scenario, priorityRatio, signingOrder]) => ({
    ...scenario,
    maxPriorityFeePerGas:
      (scenario.maxFeePerGas * BigInt(priorityRatio)) / 100n,
    signingOrder,
  }))

function asViemSignature(signature: Signature.Signature) {
  return {
    r: Hex.fromNumber(signature.r, { size: 32 }),
    s: Hex.fromNumber(signature.s, { size: 32 }),
    yParity: signature.yParity,
  }
}

function feePayerSignature(
  transaction: Transaction.TransactionSerializableTempo,
) {
  const signature = transaction.feePayerSignature
  if (!signature) throw new Error('Expected a fee payer signature.')
  return Signature.from({
    r: BigInt(signature.r!),
    s: BigInt(signature.s!),
    yParity: Number(signature.yParity),
  })
}

function recoverSigners(transaction: Transaction.TransactionSerializableTempo) {
  const signature = transaction.signature
  if (!signature) throw new Error('Expected a sender signature.')

  const envelope = TxTempo.from(transaction as never)
  const sender = SignatureEnvelope.extractAddress({
    payload: TxTempo.getSignPayload(envelope),
    root: true,
    signature,
  })
  const feePayer = Secp256k1.recoverAddress({
    payload: TxTempo.getFeePayerSignPayload(envelope, { sender }),
    signature: feePayerSignature(transaction),
  })
  return { feePayer, sender }
}

describe('Transaction sponsorship: fuzz', () => {
  test.prop({ scenario }, fuzzParameters(250))(
    'preserves both signing domains through payer-first and sender-first flows',
    async ({ scenario }) => {
      const { payerOffset, senderIndex, signingOrder, ...transaction } =
        scenario
      const sender = accounts[senderIndex]
      const payer = accounts[(senderIndex + payerOffset) % accounts.length]

      const serialized = await (async () => {
        if (signingOrder === 'sender-first') {
          const partialSerialized = await sender.signTransaction({
            ...transaction,
            feePayer: true,
            from: sender.address,
          } as never)
          expect(partialSerialized.startsWith('0x78')).toBe(true)

          const partial = Transaction.deserialize(
            partialSerialized as `0x78${string}`,
          )
          expect(partial.feePayerSignature).toBeNull()
          expect(partial.feeToken).toBeUndefined()
          expect(partial.from).toBe(sender.address.toLowerCase())

          return await Transaction.serialize({
            ...partial,
            feePayer: payer,
            feeToken: transaction.feeToken,
          } as never)
        }

        const envelope = TxTempo.from({
          ...transaction,
          nonce: BigInt(transaction.nonce),
          type: 'tempo',
        })
        const signature = Signature.from(
          await payer.sign({
            hash: TxTempo.getFeePayerSignPayload(envelope, {
              sender: sender.address,
            }),
          }),
        )

        return await sender.signTransaction({
          ...transaction,
          feePayerSignature: asViemSignature(signature),
          from: sender.address,
        } as never)
      })()

      expect(serialized.startsWith('0x76')).toBe(true)
      const final = Transaction.deserialize(serialized as `0x76${string}`)

      expect(final.feeToken).toBe(TokenId.toAddress(transaction.feeToken))
      expect(final.from).toBe(sender.address.toLowerCase())
      expect(recoverSigners(final)).toEqual({
        feePayer: payer.address.toLowerCase(),
        sender: sender.address.toLowerCase(),
      })
      expect(await Transaction.serialize(final)).toBe(serialized)
    },
  )

  test.prop({ scenario }, fuzzParameters(250))(
    'excludes fee-token selection from the sender domain and binds it to the payer domain',
    async ({ scenario }) => {
      const {
        payerOffset,
        senderIndex,
        signingOrder: _,
        ...transaction
      } = scenario
      const sender = accounts[senderIndex]
      const payer = accounts[(senderIndex + payerOffset) % accounts.length]
      const partialSerialized = await sender.signTransaction({
        ...transaction,
        feePayer: true,
        from: sender.address,
      } as never)
      const partial = Transaction.deserialize(
        partialSerialized as `0x78${string}`,
      )

      const finalize = async (feeToken: bigint) => {
        const serialized = await Transaction.serialize({
          ...partial,
          feePayer: payer,
          feeToken,
        } as never)
        return Transaction.deserialize(serialized as `0x76${string}`)
      }
      const finalA = await finalize(transaction.feeToken)
      const finalB = await finalize(transaction.feeToken + 1n)
      const envelopeA = TxTempo.from(finalA as never)
      const envelopeB = TxTempo.from(finalB as never)

      expect(finalA.signature).toEqual(finalB.signature)
      expect(TxTempo.getSignPayload(envelopeA)).toBe(
        TxTempo.getSignPayload(envelopeB),
      )
      expect(
        TxTempo.getFeePayerSignPayload(envelopeA, {
          sender: sender.address,
        }),
      ).not.toBe(
        TxTempo.getFeePayerSignPayload(envelopeB, {
          sender: sender.address,
        }),
      )
      expect(
        TxTempo.getFeePayerSignPayload(envelopeA, {
          sender: sender.address,
        }),
      ).not.toBe(
        TxTempo.getFeePayerSignPayload(envelopeA, {
          sender: accounts[(senderIndex + 1) % accounts.length].address,
        }),
      )
      expect(finalA.feePayerSignature).not.toEqual(finalB.feePayerSignature)
      expect(recoverSigners(finalA).feePayer).toBe(payer.address.toLowerCase())
      expect(recoverSigners(finalB).feePayer).toBe(payer.address.toLowerCase())
    },
  )
})
