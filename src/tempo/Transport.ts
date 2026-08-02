import type { Hex } from 'ox'
import { TxEnvelopeTempo } from 'ox/tempo'

import * as Transport from '../core/Transport.js'

/** A relay {@link Transport.Transport}: routes fee sponsorship traffic to a relay (fee payer service). */
export type Relay = Transport.Transport<'relay'>

/**
 * Creates a {@link Transport.Transport} that routes requests between a
 * default transport and a relay (fee payer service) transport.
 *
 * All `eth_fillTransaction` requests are sent to the relay with the request's
 * `feePayer` value preserved so the relay can decide whether to sponsor the
 * transaction.
 *
 * Raw submissions of a sponsored envelope (one whose fee payer signature is
 * still pending) are encoded into the fee payer handoff format (`0x78`) and
 * handled per `policy`:
 * - `'sign-only'` (default): the relay co-signs via `eth_signRawTransaction`,
 *   and the co-signed transaction is broadcast through the default transport.
 * - `'sign-and-broadcast'`: the submission is forwarded to the relay, which
 *   co-signs and broadcasts it itself.
 *
 * All other requests are forwarded to the default transport.
 *
 * @example
 * ```ts
 * import { Client, http, withRelay } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: withRelay(http(), http('https://relay.example.com')),
 * })
 * ```
 *
 * @param defaultTransport - Transport for regular traffic.
 * @param relayTransport - Transport for the relay (fee payer service).
 * @param options - Options.
 * @returns A relay transport.
 */
export function withRelay(
  defaultTransport: Transport.Transport,
  relayTransport: Transport.Transport,
  options: withRelay.Options = {},
): Relay {
  const { policy = 'sign-only' } = options
  return Transport.from({
    key: options.key ?? 'relay',
    name: options.name ?? 'Relay Proxy',
    type: 'relay',
    setup({ chain, retryCount, timeout }) {
      const transport = defaultTransport.setup({
        chain,
        retryCount: 0,
        timeout,
      })
      const relay = relayTransport.setup({ chain, retryCount: 0, timeout })

      return {
        methods: options.methods,
        retryCount: options.retryCount ?? retryCount,
        retryDelay: options.retryDelay,
        async request(args, opts) {
          const { method, params } = args

          // The relay decides whether to sponsor from the fill request's `feePayer`.
          if (method === 'eth_fillTransaction') return relay.request(args, opts)

          if (
            method === 'eth_sendRawTransaction' ||
            method === 'eth_sendRawTransactionSync'
          ) {
            const serialized = (params as readonly unknown[])?.[0]
            // A pending fee payer signature marks the envelope as awaiting relay co-signature.
            const sponsored = toFeePayerFormat(serialized)
            if (sponsored) {
              if (policy === 'sign-and-broadcast')
                return relay.request({ method, params: [sponsored] }, opts)

              // The relay returns the co-signed serialized transaction.
              const signed = (await relay.request(
                { method: 'eth_signRawTransaction', params: [sponsored] },
                opts,
              )) as Hex.Hex
              return transport.request({ method, params: [signed] }, opts)
            }
          }

          return transport.request(args, opts)
        },
      }
    },
  })
}

export declare namespace withRelay {
  type Options = {
    /** Transport key. @default 'relay' */
    key?: string | undefined
    /** RPC methods to include or exclude. */
    methods?: { include?: string[] } | { exclude?: string[] } | undefined
    /** Transport name. @default 'Relay Proxy' */
    name?: string | undefined
    /** How the relay handles sponsored transactions. @default 'sign-only' */
    policy?: 'sign-only' | 'sign-and-broadcast' | undefined
    /** Max retries per request. @default 3 */
    retryCount?: number | undefined
    /** Base delay (ms) between retries. @default 150 */
    retryDelay?: number | undefined
  }
}

/**
 * Resolves the fee payer handoff encoding (`0x78`) of a Tempo envelope
 * pending a fee payer signature, or `undefined` when not pending.
 * @internal
 */
function toFeePayerFormat(serialized: unknown): Hex.Hex | undefined {
  if (typeof serialized !== 'string') return undefined
  // Already in the fee payer handoff format: pending by definition.
  if (serialized.startsWith(TxEnvelopeTempo.feePayerMagic))
    return serialized as Hex.Hex
  if (!serialized.startsWith(TxEnvelopeTempo.serializedType)) return undefined
  try {
    const envelope = TxEnvelopeTempo.deserialize(
      serialized as TxEnvelopeTempo.Serialized,
    )
    // `feePayerSignature: null` is the pending marker; the relay needs a
    // sender signature to know which account to cover fees for.
    if (envelope.feePayerSignature !== null || !envelope.signature)
      return undefined
    return TxEnvelopeTempo.serialize(envelope, { format: 'feePayer' })
  } catch {
    // Malformed payloads fall through to the node for the authoritative error.
    return undefined
  }
}
