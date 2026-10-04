import type { Hex } from 'ox'
import { TxEnvelopeTempo } from 'ox/tempo'

import { RpcResponse } from 'ox'
import * as Transport from '../core/Transport.js'
import { http as http_ } from '../core/transports/http.js'
import * as Plugin from './internal/relay/plugin.js'
import * as Request from './internal/relay/request.js'
import type * as Relay_ from './Relay.js'
import * as Store from './Store.js'

/** A relay {@link Transport.Transport}: routes fee sponsorship traffic to a relay (fee payer service). */
export type Relay = Transport.Transport<'relay', { multisig: true }>

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
 * Multisig approvals and submissions are sent to the relay. Transaction and
 * receipt lookups fall back to the relay for pending multisig operations.
 * Other requests are forwarded to the default transport.
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
export function withRelay<
  transport extends Transport.Transport,
  const plugins extends readonly Relay_.Plugin[] = readonly [],
>(
  defaultTransport: transport,
  options: withRelay.LocalOptions<plugins>,
): withRelay.LocalReturnValue<transport, plugins>
export function withRelay(
  defaultTransport: Transport.Transport,
  relayTransport: Transport.Transport,
  options?: withRelay.Options,
): Relay
export function withRelay(
  defaultTransport: Transport.Transport,
  relayTransport: Transport.Transport | withRelay.LocalOptions,
  options: withRelay.Options = {},
): Transport.Transport {
  if (!('setup' in relayTransport))
    return {
      ...defaultTransport,
      setup(config = {}) {
        const transport = defaultTransport.setup(config)
        const request = Request.compose(
          (request, options) => transport.request(request, options),
          relayTransport,
          config.chain ? () => ({ chain: config.chain! }) : undefined,
        )
        return {
          ...transport,
          request: ((request_, options) =>
            request(request_ as Relay_.handleRequest.Request, {
              chainId: config.chain?.id,
              ...options,
            })) as typeof transport.request,
          ...(relayTransport.plugins?.some((plugin) =>
            Plugin.isMultisig(plugin),
          )
            ? { multisig: true }
            : {}),
        }
      },
    }

  const { policy = 'sign-only' } = options
  return Transport.from({
    key: options.key ?? 'relay',
    name: options.name ?? 'Relay Proxy',
    type: 'relay',
    setup({ chain, timeout }) {
      const transport = defaultTransport.setup({
        chain,
        retryCount: 0,
        timeout,
      })
      const relay = relayTransport.setup({ chain, retryCount: 0, timeout })

      return {
        multisig: true as const,
        methods: options.methods,
        retryCount: 0,
        retryDelay: options.retryDelay,
        async request(args, opts) {
          const { method, params } = args

          // The relay decides whether to sponsor from the fill request's `feePayer`.
          if (method === 'eth_fillTransaction') return relay.request(args, opts)

          if (
            method === 'eth_getTransactionByHash' ||
            method === 'eth_getTransactionReceipt'
          ) {
            const result = await transport.request(
              { method, params: params as [Hex.Hex] },
              opts,
            )
            if (result !== null && typeof result !== 'undefined') return result

            const operation = await (async () => {
              try {
                return await relay.request(
                  { method: 'multisig_getOperation', params },
                  opts,
                )
              } catch (error) {
                if (
                  error instanceof RpcResponse.MethodNotFoundError ||
                  error instanceof RpcResponse.MethodNotSupportedError
                ) {
                  // Relays created before multisig coordination do not expose this method.
                  return null
                }
                throw error
              }
            })()
            if (
              !operation ||
              typeof operation !== 'object' ||
              !('type' in operation) ||
              operation.type !== 'transaction'
            )
              return result
            return relay.request({ method, params: params as [Hex.Hex] }, opts)
          }

          if (
            method === 'multisig_approveKeyAuthorization' ||
            method === 'multisig_approveRawTransaction' ||
            method === 'multisig_approveRawTransactionSync' ||
            method === 'multisig_getConfig' ||
            method === 'multisig_getOperation'
          )
            return relay.request({ method, params: params as [Hex.Hex] }, opts)

          if (
            method === 'eth_sendRawTransaction' ||
            method === 'eth_sendRawTransactionSync'
          ) {
            const serialized = (params as readonly unknown[])?.[0]
            // A pending fee payer signature marks the envelope as awaiting relay co-signature.
            if (
              typeof serialized === 'string' &&
              serialized.startsWith(TxEnvelopeTempo.serializedType)
            ) {
              const envelope = (() => {
                try {
                  return TxEnvelopeTempo.deserialize(
                    serialized as TxEnvelopeTempo.Serialized,
                  )
                } catch {
                  return undefined
                }
              })()
              if (envelope?.signature?.type === 'multisig')
                return relay.request(
                  { method, params: [serialized as Hex.Hex] },
                  opts,
                )
            }
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
  /** Plugins applied directly to the default transport. */
  type LocalOptions<
    plugins extends readonly Relay_.Plugin[] = readonly Relay_.Plugin[],
  > = Pick<Relay_.handleRequest.Options, 'resolveTokens'> & {
    /** Ordered relay plugins. Defaults to an empty list. */
    plugins?: plugins | undefined
  }
  /** Wrapped transport preserving its attributes and RPC schema. */
  type LocalReturnValue<
    transport extends Transport.Transport,
    plugins extends readonly Relay_.Plugin[] = readonly [],
  > =
    transport extends Transport.Transport<
      infer type,
      infer properties,
      infer request
    >
      ? Transport.Transport<
          type,
          properties &
            (Extract<plugins[number], Relay_.multisig.ReturnType> extends never
              ? {}
              : { multisig: true }),
          request
        >
      : never

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

/**
 * Creates an HTTP JSON-RPC transport with support for Zone authorization
 * tokens.
 *
 * Reads the authorization token for the client's chain from {@link Store}
 * and injects the `X-Authorization-Token` header on every request. Batching
 * is not supported because zone tokens are account-scoped.
 *
 * @example
 * ```ts
 * import { Client, http, Zone } from 'viem/tempo'
 *
 * const client = Client.create({
 *   chain: Zone.a,
 *   transport: http(),
 * })
 * ```
 *
 * @param url - RPC URL. Defaults to the chain's default RPC URL.
 * @param options - Options.
 * @returns An HTTP transport.
 */
export function http(
  url?: string | undefined,
  options: http.Options = {},
): Transport.Http {
  const { onFetchRequest, store = Store.defaultStore(), ...rest } = options
  return {
    key: rest.key ?? 'http',
    name: rest.name ?? 'HTTP JSON-RPC',
    type: 'http',
    setup(setupOptions = {}) {
      const chainId = setupOptions.chain?.id
      return http_(url, {
        ...rest,
        async onFetchRequest(request, init) {
          const next = (await onFetchRequest?.(request, init)) ?? init
          const headers = new Headers(next.headers)

          if (chainId) {
            const token = await store.getItem(`auth:token:${chainId}`)
            if (token) headers.set('X-Authorization-Token', token)
          }

          return { ...next, headers }
        },
      }).setup(setupOptions)
    },
  }
}

export declare namespace http {
  type Options = Omit<http_.Options, 'batch' | 'raw'> & {
    /** Store for reading zone authorization tokens. Defaults to session storage (web) or memory (server). */
    store?: Store.Store | undefined
  }
}
