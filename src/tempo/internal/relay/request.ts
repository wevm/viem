import type { Address } from 'abitype'
import { RpcResponse } from 'ox'
import type { Transaction as core_Transaction } from 'ox/tempo'
import { tempo } from '../../../chains/index.js'
import { type Client, createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import type * as Relay from '../../Relay.js'
import * as Transaction from '../../Transaction.js'
import * as Store from './cache.js'
import { formatError, isExecutionError } from './error.js'
import { getDefaultTokens } from './feeToken.js'
import * as Utils from './utils.js'
import {
  extractCalls,
  getVirtualAddressTargets,
  resolveVirtualAddresses,
} from './virtualAddress.js'

export type Result = {
  tx: Record<string, unknown>
  capabilities?: Record<string, unknown> | undefined
  sponsor?: unknown
}

/** Compose middleware and execute post-fill hooks once for the selected result. */
export function compose(
  downstream: Relay.handleRequest.Handler,
  options: Relay.handleRequest.Options = {},
  resolveClient?: ((chainId: number) => { chain: { id: number } }) | undefined,
): Relay.handleRequest.Handler {
  const options_ = options
  const plugins = options.plugins ?? []
  if (plugins.length === 0) return downstream
  if (plugins.filter((plugin) => plugin.signTransaction).length > 1)
    throw new Error('Only one relay transaction signer may be configured.')

  return async (request, requestOptions = {}) => {
    const stores = new Map<Store.Store, Store.Store>()
    const tokens = new Map<number, Promise<readonly Address[]>>()
    const scoped = (store: Store.Store | undefined) => {
      if (!store) return undefined
      let result = stores.get(store)
      if (!result) {
        result = Store.scoped(store)!
        stores.set(store, result)
      }
      return result
    }

    const execute = async (
      start: number,
      request: Relay.handleRequest.Request,
      options: Relay.handleRequest.RequestOptions,
    ) => {
      const state = {
        request,
        options: { ...options },
        result: undefined as unknown,
      }
      const contexts = new Map<number, Relay.Plugin.Context>()
      const contextAt = (index: number): Relay.Plugin.Context => {
        const existing = contexts.get(index)
        if (existing) return existing
        const clients = new Map<number, Client>()
        const chainId = (id = state.options.chainId) => {
          if (id === undefined || !Number.isSafeInteger(id) || id <= 0)
            throw new RpcResponse.InvalidParamsError({
              message:
                'A chain ID is required to resolve the downstream client.',
            })
          return id
        }
        const context: Relay.Plugin.Context = {
          get request() {
            return state.request
          },
          set request(value) {
            state.request = value
          },
          get result() {
            return state.result
          },
          set result(value) {
            state.result = value
          },
          get options() {
            return state.options
          },
          set options(value) {
            state.options = value
          },
          get client() {
            return context.getClient()
          },
          getClient(id_) {
            const id = chainId(id_)
            let client = clients.get(id)
            if (client) return client
            const upstream = resolveClient?.(id)
            if (upstream?.chain && upstream.chain.id !== id)
              throw new RpcResponse.InvalidParamsError({
                message: 'Conflicting chain ids.',
              })
            client = createClient({
              chain: { ...tempo, ...upstream?.chain, id },
              batch: { multicall: { deployless: true } },
              transport: custom(
                {
                  request: async (request, options) => {
                    const child = await execute(index + 1, request, {
                      ...state.options,
                      ...options,
                      chainId: id,
                    })
                    return child.state.result
                  },
                },
                { retryCount: 0 },
              ),
            })
            clients.set(id, client)
            return client
          },
          async resolveTokens(id_) {
            const id = chainId(id_)
            let result = tokens.get(id)
            if (!result) {
              result = Promise.resolve().then(() =>
                (options_.resolveTokens ?? getDefaultTokens)(id),
              )
              tokens.set(id, result)
            }
            return result
          },
          getStore: scoped,
        }
        contexts.set(index, context)
        return context
      }
      const dispatch = async (index: number): Promise<void> => {
        if (index === plugins.length) {
          state.result = await downstream(state.request, state.options)
          return
        }
        const plugin = plugins[index]!
        const context = contextAt(index)
        if (!plugin.handleRequest) return dispatch(index + 1)
        let called = false
        const result = await plugin.handleRequest(context, async () => {
          if (called)
            throw new Error(
              'next() may only be called once per middleware invocation.',
            )
          called = true
          await dispatch(index + 1)
        })
        if (result !== undefined) state.result = result
      }
      await dispatch(start)
      return { state, contextAt }
    }

    const isFill = request.method === 'eth_fillTransaction'
    const isRaw = [
      'eth_signRawTransaction',
      'eth_sendRawTransaction',
      'eth_sendRawTransactionSync',
    ].includes(request.method)
    const parameters = request.params?.[0] as Record<string, unknown>
    let root: Awaited<ReturnType<typeof execute>> | undefined
    try {
      requestOptions.signal?.throwIfAborted()
      if (
        isFill &&
        (!parameters ||
          typeof parameters !== 'object' ||
          Array.isArray(parameters))
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a transaction object.',
        })
      if (isFill) Utils.normalizeFillTransactionRequest(parameters)
      const bodyChainId = (() => {
        if (isRaw && Utils.isSerializedTempoTransaction(request.params?.[0])) {
          try {
            return Transaction.deserialize(request.params[0]).chainId
          } catch {
            throw new RpcResponse.InvalidParamsError({
              message: 'Invalid serialized Tempo transaction.',
            })
          }
        }
        if (!isFill || parameters.chainId === undefined) return undefined
        const id = Utils.resolveChainId(parameters.chainId)
        if (id === undefined || !Number.isSafeInteger(id) || id <= 0)
          throw new RpcResponse.InvalidParamsError({
            message: 'Invalid transaction chain ID.',
          })
        return id
      })()
      if (
        bodyChainId !== undefined &&
        requestOptions.chainId !== undefined &&
        bodyChainId !== requestOptions.chainId
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'Conflicting chain ids.',
        })
      root = await execute(0, request, {
        ...requestOptions,
        ...((requestOptions.chainId ?? bodyChainId) !== undefined
          ? { chainId: requestOptions.chainId ?? bodyChainId }
          : {}),
      })
      if (!isFill) return root.state.result
      const filled = root.state.result as Result
      if (filled.capabilities?.error) return filled
      const transaction = Utils.normalizeTempoTransaction(
        Utils.mergeCallsFromRequest(
          filled.tx,
          Utils.normalizeFillTransactionRequest(parameters),
        ),
      )
      const final: Result = {
        ...filled,
        tx: Utils.formatTempoTransaction(
          transaction as core_Transaction.Transaction,
        ),
      }
      const snapshot = freeze(structuredClone(final))
      const [patches, signatures, virtualAddresses] = await Promise.all([
        Promise.all(
          plugins.map((plugin, index) =>
            plugin.afterFill?.(snapshot, root!.contextAt(index)),
          ),
        ),
        Promise.all(
          plugins.map((plugin, index) =>
            plugin.signTransaction?.(snapshot, root!.contextAt(index)),
          ),
        ),
        getVirtualAddressTargets(extractCalls(transaction)).length > 0
          ? resolveVirtualAddresses(root.contextAt(-1).client, {
              calls: extractCalls(transaction),
            }).catch(() => {
              requestOptions.signal?.throwIfAborted()
              return undefined
            })
          : undefined,
      ])
      requestOptions.signal?.throwIfAborted()
      const capabilities = { ...final.capabilities }
      const keys = new Set<string>()
      for (const patch of patches) {
        for (const [key, value] of Object.entries(patch?.capabilities ?? {})) {
          if (keys.has(key))
            throw new Error(`Conflicting relay capability: ${key}.`)
          keys.add(key)
          capabilities[key] = value
        }
      }
      const signature = signatures.find((signature) => signature !== undefined)
      if (signature) {
        delete final.tx.signature
        final.tx.feePayerSignature = signature
      }
      const sponsor = capabilities.sponsor ?? final.sponsor
      return {
        ...final,
        capabilities: {
          sponsored: !!sponsor,
          ...capabilities,
          ...(virtualAddresses ? { virtualAddresses } : {}),
        },
      }
    } catch (error) {
      requestOptions.signal?.throwIfAborted()
      if (
        isFill &&
        isExecutionError(error) &&
        (parameters.capabilities as Record<string, unknown> | undefined)
          ?.errors === true
      ) {
        // Resolve errors through a downstream-only client; never restart the plugin pipeline.
        const id =
          requestOptions.chainId ?? Utils.resolveChainId(parameters.chainId)
        const client = createClient({
          chain: { ...tempo, id: id ?? tempo.id },
          transport: custom(
            {
              request: (request, options) =>
                downstream(request, {
                  ...requestOptions,
                  ...options,
                  chainId: id,
                }),
            },
            { retryCount: 0 },
          ),
        })
        return formatError(error, parameters, client)
      }
      if (!isFill && !isRaw) throw error
      throw Utils.toRpcError(error)
    }
  }
}

/** Prevent hooks from mutating the transaction another hook signs. */
function freeze<value>(value: value): value {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child)
    Object.freeze(value)
  }
  return value
}

/** Normalize a downstream fill without discarding capabilities added by other plugins. */
export async function fill(
  client: Client,
  transaction: Record<string, unknown>,
  options: Relay.handleRequest.RequestOptions = {},
): Promise<Result> {
  const result = (await client.request(
    {
      method: 'eth_fillTransaction',
      params: [
        (transaction.type === '0x76'
          ? transaction
          : Utils.formatFillTransactionRequest(client, transaction)) as never,
      ],
    },
    options,
  )) as unknown as Result

  const error = result.capabilities?.error as
    | { message?: string; errorName?: string; data?: `0x${string}` }
    | undefined
  if (error) {
    const cause = new Error(
      error.message ?? error.errorName ?? 'UpstreamRevert',
    )
    Object.assign(cause, { name: 'UpstreamRevertError', data: error.data })
    throw cause
  }

  return { ...result, tx: Utils.mergeCallsFromRequest(result.tx, transaction) }
}
