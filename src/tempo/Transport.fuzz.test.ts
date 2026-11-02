import { Secp256k1 } from 'ox'
import { TxEnvelopeTempo } from 'ox/tempo'
import fc from 'fast-check'
import { custom } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { describe, expect, test } from 'vitest'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import { withRelay } from './Transport.js'

const privateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const method = fc.constantFrom(
  'eth_sendRawTransaction' as const,
  'eth_sendRawTransactionSync' as const,
)

type RequestRecord = {
  method: string
  serialized: `0x${string}`
}

describe('withRelay: fuzz', () => {
  test('routes concurrent sponsored transactions exactly once', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('sign-only' as const, 'sign-and-broadcast' as const),
        fc.array(method, { minLength: 1, maxLength: 20 }),
        fc.scheduler(),
        async (policy, methods, scheduler) => {
          const envelopes = methods.map((_, index) =>
            TxEnvelopeTempo.from({
              calls: [{ to: address(index) }],
              chainId: tempoLocalnet.id,
              feePayerSignature: null,
              gas: 100_000n,
              maxFeePerGas: 1_000_000_000n,
              nonce: BigInt(index),
            }),
          )
          const serialized = envelopes.map((envelope) =>
            TxEnvelopeTempo.serialize(envelope, {
              signature: Secp256k1.sign({
                payload: TxEnvelopeTempo.getSignPayload(envelope),
                privateKey,
              }),
            }),
          )
          const handoffs = envelopes.map((envelope) =>
            TxEnvelopeTempo.serialize(envelope, {
              format: 'feePayer',
              signature: Secp256k1.sign({
                payload: TxEnvelopeTempo.getSignPayload(envelope),
                privateKey,
              }),
            }),
          )
          const signed = new Map(
            handoffs.map((transaction, index) => [
              transaction,
              `0x${(index + 1).toString(16).padStart(64, '0')}` as const,
            ]),
          )
          const methodByTransaction = new Map<
            `0x${string}`,
            (typeof methods)[number]
          >(
            handoffs.map((transaction, index) => [
              transaction,
              methods[index]!,
            ]),
          )
          const transactionBySignature = new Map(
            [...signed].map(([transaction, signature]) => [
              signature,
              transaction,
            ]),
          )
          const defaultRequests: RequestRecord[] = []
          const relayRequests: RequestRecord[] = []

          const defaultTransport = custom({
            async request({ method, params }) {
              defaultRequests.push({ method, serialized: params[0] })
              return params[0]
            },
          })
          const relayTransport = custom({
            async request({ method, params }) {
              const transaction = params[0]
              relayRequests.push({ method, serialized: transaction })
              const result =
                policy === 'sign-only'
                  ? signed.get(transaction)
                  : `0x${transaction.slice(-64)}`
              return scheduler.schedule(
                Promise.resolve(result),
                `${method}:${transaction.slice(-8)}`,
              )
            },
          })
          const transport = withRelay(defaultTransport, relayTransport, {
            policy,
          }).setup({ chain: tempoLocalnet, retryCount: 0 })

          const pending = Promise.all(
            methods.map((method, index) =>
              transport.request({
                method,
                params: [serialized[index]],
              } as never),
            ),
          )
          const results = await scheduler.waitFor(pending)

          expect(relayRequests).toHaveLength(methods.length)
          for (const request of relayRequests) {
            expect(handoffs).toContain(request.serialized)
            expect(request.method).toBe(
              policy === 'sign-only'
                ? 'eth_signRawTransaction'
                : methodByTransaction.get(request.serialized),
            )
          }

          if (policy === 'sign-only') {
            expect(defaultRequests).toHaveLength(methods.length)
            for (const request of defaultRequests) {
              const transaction = transactionBySignature.get(request.serialized)
              expect(transaction).toBeDefined()
              expect(request.method).toBe(methodByTransaction.get(transaction!))
            }
            for (const [index, transaction] of handoffs.entries())
              expect(results[index]).toBe(signed.get(transaction))
          } else expect(defaultRequests).toHaveLength(0)
        },
      ),
      fuzzParameters(100),
    )
  })

  test('bypasses the relay for concurrent unsponsored transactions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(method, { minLength: 1, maxLength: 20 }),
        async (methods) => {
          const serialized = methods.map((_, index) => {
            const envelope = TxEnvelopeTempo.from({
              calls: [{ to: address(index) }],
              chainId: tempoLocalnet.id,
              gas: 100_000n,
              maxFeePerGas: 1_000_000_000n,
              nonce: BigInt(index),
            })
            return TxEnvelopeTempo.serialize(envelope, {
              signature: Secp256k1.sign({
                payload: TxEnvelopeTempo.getSignPayload(envelope),
                privateKey,
              }),
            })
          })
          const defaultRequests: RequestRecord[] = []
          const relayRequests: RequestRecord[] = []
          const defaultTransport = custom({
            async request({ method, params }) {
              defaultRequests.push({ method, serialized: params[0] })
              return params[0]
            },
          })
          const relayTransport = custom({
            async request({ method, params }) {
              relayRequests.push({ method, serialized: params[0] })
            },
          })
          const transport = withRelay(defaultTransport, relayTransport).setup({
            chain: tempoLocalnet,
            retryCount: 0,
          })

          await Promise.all(
            methods.map((method, index) =>
              transport.request({
                method,
                params: [serialized[index]],
              } as never),
            ),
          )

          expect(relayRequests).toHaveLength(0)
          expect(defaultRequests).toEqual(
            methods.map((method, index) => ({
              method,
              serialized: serialized[index],
            })),
          )
        },
      ),
      fuzzParameters(100),
    )
  })
})

function address(index: number) {
  return `0x${(index + 1).toString(16).padStart(40, '0')}` as const
}
