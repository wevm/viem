import * as Address from 'ox/Address'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as Provider from 'ox/Provider'
import * as RpcRequest from 'ox/RpcRequest'
import type { LocalAccount } from '../accounts/types.js'
import { getTransactionReceipt } from '../actions/public/getTransactionReceipt.js'
import { sendTransaction } from '../actions/wallet/sendTransaction.js'
import { sendTransactionSync } from '../actions/wallet/sendTransactionSync.js'
import { createClient } from '../clients/createClient.js'
import {
  createTransport,
  type Transport,
} from '../clients/transports/createTransport.js'
import {
  type HttpTransport,
  type HttpTransportConfig,
  http as http_,
} from '../clients/transports/http.js'
import {
  MethodNotFoundRpcError,
  MethodNotSupportedRpcError,
} from '../errors/rpc.js'
import type { Chain } from '../types/chain.js'
import type { ChainConfig } from './chainConfig.js'
import * as Plugin_ from './internal/relay/plugin.js'
import * as Request_ from './internal/relay/request.js'
import type * as Relay_ from './Relay.js'
import type { Store } from './Store.js'
import * as Store_ from './Store.js'
import * as Transaction from './Transaction.js'

export type HttpConfig = Omit<
  HttpTransportConfig,
  'batch' | 'raw' | 'rpcSchema'
> & {
  /** Store for reading Zone authorization tokens. Defaults to sessionStorage (web) or memory (server). */
  store?: Store | undefined
}

/**
 * Creates an HTTP transport with support for Zone authentication tokens.
 *
 * Reads the authorization token from the store and injects the
 * `X-Authorization-Token` header on every request.
 *
 * @example
 * ```ts
 * import { createPublicClient } from 'viem'
 * import { http, Zone } from 'viem/tempo'
 *
 * const client = createPublicClient({
 *   chain: Zone.a,
 *   transport: http(),
 * })
 * ```
 */
export function http(
  url?: string | undefined,
  config: HttpConfig = {},
): HttpTransport {
  const { store: store_, onFetchRequest, ...rest } = config
  const store = store_ ?? Store_.defaultStore()

  return (config) =>
    http_(url, {
      ...rest,
      async onFetchRequest(request, init) {
        const next = (await onFetchRequest?.(request, init)) ?? init
        const headers = new Headers(next.headers)

        const chainId = config.chain?.id
        if (chainId) {
          const token = (await store.getItem(`auth:token:${chainId}`)) ?? null
          if (token) headers.set('X-Authorization-Token', token)
        }

        return { ...next, headers }
      },
    })(config)
}

type RelayProxyParameters = {
  /** Policy for how the relay should handle sponsored transactions. Defaults to `'sign-only'`. */
  policy?: 'sign-only' | 'sign-and-broadcast' | undefined
}

export type FeePayer = Transport<typeof withFeePayer.type>
export type Relay = Transport<typeof withRelay.type, { accounts: true }>

/**
 * Creates a relay transport that routes requests between
 * the default transport or the relay transport.
 *
 * All `eth_fillTransaction` requests are sent to the relay with the request's
 * `feePayer` value preserved so the relay can decide whether to sponsor the transaction.
 * Owner approvals, configs, operations, and operation-aware transaction
 * lookups are also sent to the relay so it can coordinate approvals in its store.
 *
 * The policy parameter controls how the relay handles sponsored transactions:
 * - `'sign-only'`: Relay co-signs the transaction and returns it to the client transport, which then broadcasts it via the default transport
 * - `'sign-and-broadcast'`: Relay co-signs and broadcasts the transaction directly
 *
 * Local plugin options wrap the default transport directly, preserving its attributes.
 * Local mode enables fee sponsorship only when a `Relay.feePayer` plugin is configured.
 *
 * @param defaultTransport - The default transport to use.
 * @param relayTransport - The remote relay transport or local plugin options.
 * @param parameters - Configuration parameters.
 * @returns A relay transport.
 */
export function withRelay<
  transport extends Transport,
  const plugins extends readonly Relay_.Plugin[] = readonly [],
>(
  defaultTransport: transport,
  options: withRelay.LocalOptions<plugins>,
): withRelay.LocalReturnValue<transport, plugins>
export function withRelay(
  defaultTransport: Transport,
  relayTransport: Transport,
  parameters?: withRelay.Parameters,
): withRelay.ReturnValue
export function withRelay(
  defaultTransport: Transport,
  relayTransport: Transport | withRelay.LocalOptions,
  parameters?: withRelay.Parameters,
): Transport {
  if (typeof relayTransport !== 'function')
    return (config) => {
      const transport = defaultTransport(config)
      const next: Relay_.handleRequest.Handler = (request, options) =>
        transport.request(request as never, options)
      const request = Request_.compose(
        next,
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
        value: {
          ...transport.value,
          ...(relayTransport.plugins?.some(Plugin_.isAccounts)
            ? { accounts: true }
            : {}),
        },
      }
    }

  const { policy = 'sign-only' } = parameters ?? {}

  return (config) => {
    const transport_default = defaultTransport(config)
    const transport_relay = relayTransport(config)

    const transport = createTransport({
      key: withRelay.type,
      name: 'Relay Proxy',
      async request({ method, params }, options) {
        if (method === 'eth_fillTransaction')
          return transport_relay.request({ method, params }, options) as never

        if (
          method === 'eth_getTransactionByHash' ||
          method === 'eth_getTransactionReceipt'
        ) {
          const result = await transport_default.request(
            { method, params },
            options,
          )
          if (result !== null && typeof result !== 'undefined')
            return result as never

          const operation = await (async () => {
            try {
              return await transport_relay.request(
                { method: 'account_getOperation', params },
                options,
              )
            } catch (error) {
              if (
                error instanceof MethodNotFoundRpcError ||
                error instanceof MethodNotSupportedRpcError
              ) {
                // Relays without the accounts plugin do not expose this method.
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
            return result as never
          return transport_relay.request({ method, params }, options) as never
        }

        if (
          method === 'account_approveKeyAuthorization' ||
          method === 'account_approveRawTransaction' ||
          method === 'account_approveRawTransactionSync' ||
          method === 'account_getConfig' ||
          method === 'account_getOperation'
        )
          return transport_relay.request({ method, params }, options) as never

        if (
          method === 'eth_sendRawTransactionSync' ||
          method === 'eth_sendRawTransaction'
        ) {
          const serialized = (params as any)[0] as `0x76${string}`
          const transaction = Transaction.deserialize(serialized)

          if (transaction.signature?.type === 'configurable')
            return transport_relay.request({ method, params }, options) as never

          // Serialized Tempo envelopes encode `feePayer: true` as a missing fee payer
          // signature until the relay co-signs the transaction.
          if (transaction.feePayerSignature === null) {
            // For 'sign-and-broadcast', relay signs and broadcasts
            if (policy === 'sign-and-broadcast')
              return transport_relay.request(
                { method, params },
                options,
              ) as never

            // For 'sign-only', request signature from relay using eth_signRawTransaction
            {
              // Request signature from relay using eth_signRawTransaction
              const signedTransaction = await transport_relay.request(
                {
                  method: 'eth_signRawTransaction',
                  params: [serialized],
                },
                options,
              )

              // Broadcast the signed transaction via the default transport
              return transport_default.request(
                { method, params: [signedTransaction] },
                options,
              ) as never
            }
          }
        }

        return (await transport_default.request(
          { method, params },
          options,
        )) as never
      },
      type: withRelay.type,
    })
    return { ...transport, value: { accounts: true } }
  }
}

export declare namespace withRelay {
  export const type = 'relay'

  export type Parameters = RelayProxyParameters

  /** Plugins applied directly to the default transport. */
  export type LocalOptions<
    plugins extends readonly Relay_.Plugin[] = readonly Relay_.Plugin[],
  > = Pick<Relay_.handleRequest.Options, 'resolveTokens'> & {
    /** Ordered relay plugins. Defaults to an empty list. */
    plugins?: plugins | undefined
  }

  /** Wrapped transport preserving its attributes and RPC request schema. */
  export type LocalReturnValue<
    transport extends Transport,
    plugins extends readonly Relay_.Plugin[] = readonly [],
  > = transport extends Transport<infer type, infer attributes, infer request>
    ? Transport<
        type,
        attributes &
          (Extract<plugins[number], Relay_.accounts.ReturnType> extends never
            ? {}
            : { accounts: true }),
        request
      >
    : never

  export type ReturnValue = Relay
}

/** @deprecated Use `withRelay` instead. */
export function withFeePayer(
  defaultTransport: Transport,
  relayTransport: Transport,
  parameters?: withFeePayer.Parameters,
): withFeePayer.ReturnValue {
  const { policy = 'sign-only' } = parameters ?? {}

  return (config) => {
    const transport_default = defaultTransport(config)
    const transport_relay = relayTransport(config)

    return createTransport({
      key: withFeePayer.type,
      name: 'Relay Proxy',
      async request({ method, params }, options) {
        if (method === 'eth_fillTransaction') {
          const request = (params as readonly unknown[] | undefined)?.[0]
          if (
            request &&
            typeof request === 'object' &&
            'feePayer' in request &&
            request.feePayer === true
          )
            return transport_relay.request({ method, params }, options) as never
        }
        if (
          method === 'eth_sendRawTransactionSync' ||
          method === 'eth_sendRawTransaction'
        ) {
          const serialized = (params as any)[0] as `0x76${string}`
          const transaction = Transaction.deserialize(serialized)

          // Serialized Tempo envelopes encode `feePayer: true` as a missing fee payer
          // signature until the relay co-signs the transaction.
          if (transaction.feePayerSignature === null) {
            // For 'sign-and-broadcast', relay signs and broadcasts
            if (policy === 'sign-and-broadcast')
              return transport_relay.request(
                { method, params },
                options,
              ) as never

            // For 'sign-only', request signature from relay using eth_signRawTransaction
            {
              // Request signature from relay using eth_signRawTransaction
              const signedTransaction = await transport_relay.request(
                {
                  method: 'eth_signRawTransaction',
                  params: [serialized],
                },
                options,
              )

              // Broadcast the signed transaction via the default transport
              return transport_default.request(
                { method, params: [signedTransaction] },
                options,
              ) as never
            }
          }
        }
        return (await transport_default.request(
          { method, params },
          options,
        )) as never
      },
      type: withFeePayer.type,
    })
  }
}

export declare namespace withFeePayer {
  export const type = 'feePayer'

  export type Parameters = {
    /** Policy for how the fee payer should handle transactions. Defaults to `'sign-only'`. */
    policy?: 'sign-only' | 'sign-and-broadcast' | undefined
  }

  export type ReturnValue = FeePayer
}

/**
 * Creates a transport that instruments a compatibility layer for
 * `wallet_` RPC actions (`sendCalls`, `getCallsStatus`, etc).
 *
 * @param transport - Transport to wrap.
 * @returns Transport.
 */
export function walletNamespaceCompat(
  transport: Transport,
  options: walletNamespaceCompat.Parameters,
): Transport {
  const { account } = options

  const sendCallsMagic = Hash.keccak256(Hex.fromString('TEMPO_5792'))

  return (options) => {
    const t = transport(options)

    const chain = options.chain as Chain & ChainConfig

    return {
      ...t,
      async request(args: never) {
        const request = RpcRequest.from(args)

        const client = createClient({
          chain,
          transport,
        })

        if (request.method === 'wallet_sendCalls') {
          const params = request.params[0] ?? {}
          const { capabilities, chainId, from } = params
          const { sync, ...properties } = capabilities ?? {}

          if (!chainId) throw new Provider.UnsupportedChainIdError()
          if (Number(chainId) !== client.chain.id)
            throw new Provider.UnsupportedChainIdError()
          if (from && !Address.isEqual(from, account.address))
            throw new Provider.DisconnectedError()

          const calls = (params.calls ?? []).map((call) => ({
            to: call.to,
            value: call.value ? BigInt(call.value) : undefined,
            data: call.data,
          }))

          const hash = await (async () => {
            if (!sync)
              return sendTransaction(client, {
                account,
                ...(properties ? properties : {}),
                calls,
              })

            const { transactionHash } = await sendTransactionSync(client, {
              account,
              ...(properties ? properties : {}),
              calls,
            })
            return transactionHash
          })()

          const id = Hex.concat(hash, Hex.padLeft(chainId, 32), sendCallsMagic)

          return {
            capabilities: { sync },
            id,
          }
        }

        if (request.method === 'wallet_getCallsStatus') {
          const [id] = request.params ?? []
          if (!id) throw new Error('`id` not found')
          if (!id.endsWith(sendCallsMagic.slice(2)))
            throw new Error('`id` not supported')
          Hex.assert(id)

          const hash = Hex.slice(id, 0, 32)
          const chainId = Hex.slice(id, 32, 64)

          const receipt = await getTransactionReceipt(client, { hash })
          return {
            atomic: true,
            chainId: Number(chainId),
            id,
            receipts: [receipt],
            status: receipt.status === 'success' ? 200 : 500,
            version: '2.0.0',
          }
        }

        return t.request(args)
      },
    } as never
  }
}

export declare namespace walletNamespaceCompat {
  export type Parameters = {
    account: LocalAccount
  }
}
