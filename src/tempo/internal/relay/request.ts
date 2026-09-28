import type { Address } from 'abitype'
import { RpcResponse } from 'ox'
import type { Transaction as core_Transaction } from 'ox/tempo'
import { tempo } from '../../../chains/index.js'
import { type Client, createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import type { Call } from '../../../types/calls.js'
import type * as Relay from '../../Relay.js'
import * as Transaction from '../../Transaction.js'
import * as Store from './cache.js'
import { formatError, isExecutionError } from './error.js'
import type { SponsorshipDetails } from './feePayer.js'
import { getDefaultTokens } from './feeToken.js'
import * as Utils from './utils.js'
import { extractCalls, resolveVirtualAddresses } from './virtualAddress.js'

export const response = Symbol('relay.response')
export const tokens = Symbol('relay.tokens')
const resolveClient = Symbol('relay.client')
const processing = Symbol('relay.processing')
export const deferred = Symbol('relay.deferred')
export const swap = Symbol('relay.swap')
const pending = Symbol('relay.pending')
const tokenLists = Symbol('relay.tokenLists')
const stores = Symbol('relay.stores')

type TokenResolver = (
  chainId: number,
  signal?: AbortSignal,
) => Promise<readonly Address[]>

type Options = Relay.handleRequest.RequestOptions & {
  [processing]?: true | undefined
  [stores]?: Map<Store.Store, Store.Store> | undefined
  [tokenLists]?:
    | Map<TokenResolver, Map<number, Promise<readonly Address[]>>>
    | undefined
  [response]?:
    | { sponsorship_details?: SponsorshipDetails | undefined }
    | undefined
}

export type Handler = Relay.handleRequest.Handler & {
  [deferred]?: Relay.handleRequest.Handler | undefined
  [resolveClient]?: ((chainId: number) => { chain: { id: number } }) | undefined
  [tokens]?:
    | ((chainId: number, signal?: AbortSignal) => Promise<readonly Address[]>)
    | undefined
}

export type Result = {
  [pending]?: readonly (() => Promise<Partial<Result>>)[] | undefined
  [swap]?:
    | { calls: readonly Call[]; tokenIn: Address; tokenOut: Address }
    | undefined
  tx: Record<string, unknown>
  capabilities?: Record<string, unknown> | undefined
  sponsor?: unknown
}

type Context = {
  client: Client
  getStore: (store: Store.Store | undefined) => Store.Store | undefined
  getTokens: (resolver?: TokenResolver) => Promise<readonly Address[]>
  getClient: (chainId?: number) => Client
  chainId: number | undefined
  options: Options
}

export function withClient(
  next: Handler,
  getClient: NonNullable<Handler[typeof resolveClient]>,
): Handler {
  return Object.assign(next, { [resolveClient]: getClient })
}

/** Preserve downstream client and token resolvers through custom middleware. */
export function inherit(next: Handler, handler: Handler): Handler {
  const keys = [resolveClient, tokens].filter(
    (key) => !(key in handler) && key in next,
  )
  if (keys.length === 0) return handler

  return Object.assign(
    (request: Relay.handleRequest.Request, options?: Options) =>
      handler(request, options),
    handler,
    Object.fromEntries(keys.map((key) => [key, next[key as keyof Handler]])),
  )
}

export function wrap(
  next: Handler,
  handle: (
    request: Relay.handleRequest.Request,
    context: Context,
  ) => Promise<unknown>,
): Handler {
  const handleDeferred: Handler = async (request, options: Options = {}) => {
    const outer = !options[processing]
    const isFill = request.method === 'eth_fillTransaction'
    const isRaw =
      request.method === 'eth_signRawTransaction' ||
      request.method === 'eth_sendRawTransaction' ||
      request.method === 'eth_sendRawTransactionSync'

    let client: Client | undefined
    const parameters = request.params?.[0] as Record<string, unknown>

    try {
      if (!isFill && !isRaw) return await next(request, options)

      if (
        isFill &&
        (!parameters ||
          typeof parameters !== 'object' ||
          Array.isArray(parameters))
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a transaction object.',
        })

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
        options.chainId !== undefined &&
        bodyChainId !== options.chainId
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'Conflicting chain ids.',
        })

      const chainId = options.chainId ?? bodyChainId
      const requestOptions: Options = {
        ...options,
        chainId,
        [processing]: true,
        [stores]: options[stores] ?? new Map(),
        [tokenLists]: options[tokenLists] ?? new Map(),
      }

      const getClient = (id = chainId): Client => {
        if (id === undefined || !Number.isSafeInteger(id) || id <= 0)
          throw new RpcResponse.InvalidParamsError({
            message: 'A chain ID is required to resolve the downstream client.',
          })

        const upstream = next[resolveClient]?.(id)
        if (upstream && upstream.chain.id !== id)
          throw new RpcResponse.InvalidParamsError({
            message: 'Conflicting chain ids.',
          })

        return createClient({
          chain: { ...tempo, ...upstream?.chain, id },
          batch: { multicall: { deployless: true } },
          transport: custom(
            {
              request: (request, options) =>
                (next[deferred] ?? next)(request, {
                  ...requestOptions,
                  ...options,
                  chainId: id,
                }),
            },
            { retryCount: 0 },
          ),
        })
      }

      client = getClient()
      const result = await handle(request, {
        client,
        getStore: (store) => {
          if (!store) return undefined
          const scoped = requestOptions[stores]!
          let result = scoped.get(store)
          if (!result) {
            result = Store.scoped(store)!
            scoped.set(store, result)
          }
          return result
        },
        getTokens: (resolver = next[tokens] ?? getDefaultTokens) => {
          const lists = requestOptions[tokenLists]!
          let chains = lists.get(resolver)
          if (!chains) {
            chains = new Map()
            lists.set(resolver, chains)
          }
          let result = chains.get(chainId!)
          if (!result) {
            result = resolver(chainId!, requestOptions.signal)
            chains.set(chainId!, result)
          }
          return result
        },
        getClient,
        chainId,
        options: requestOptions,
      })
      if (!isFill || !outer) return result

      const filled = result as Result
      if (filled.capabilities?.error) return filled

      const transaction = Utils.normalizeTempoTransaction(
        Utils.mergeCallsFromRequest(
          filled.tx,
          Utils.normalizeFillTransactionRequest(parameters),
        ),
      )
      const [resolved, virtualAddresses] = await Promise.all([
        resolve(filled),
        resolveVirtualAddresses(client, { calls: extractCalls(transaction) }),
      ])
      const sponsor = resolved.capabilities?.sponsor ?? resolved.sponsor

      return {
        ...resolved,
        tx: Utils.formatTempoTransaction(
          Utils.normalizeTempoTransaction(
            Utils.mergeCallsFromRequest(
              resolved.tx,
              Utils.normalizeFillTransactionRequest(parameters),
            ),
          ) as core_Transaction.Transaction,
        ),
        capabilities: {
          sponsored: !!sponsor,
          ...resolved.capabilities,
          ...(virtualAddresses ? { virtualAddresses } : {}),
        },
      }
    } catch (error) {
      if (!outer) throw error

      if (
        isFill &&
        client &&
        isExecutionError(error) &&
        (parameters.capabilities as Record<string, unknown> | undefined)
          ?.errors === true
      )
        return formatError(error, parameters, client)

      throw Utils.toRpcError(error)
    }
  }
  // Custom middleware and public callers always receive completed results.
  const handler: Handler = async (request, options) => {
    const result = await handleDeferred(request, options)
    return request.method === 'eth_fillTransaction'
      ? resolve(result as Result)
      : result
  }
  handler[deferred] = handleDeferred
  return inherit(next, handler)
}

/** Defers response work until the final fill is selected, then runs it concurrently. */
export function enrich(
  result: Result,
  task: () => Promise<Partial<Result>>,
): Result {
  return { ...result, [pending]: [...(result[pending] ?? []), task] }
}

async function resolve(result: Result): Promise<Result> {
  const { [pending]: tasks, [swap]: _, ...base } = result
  if (!tasks) return base
  for (const patch of await Promise.all(tasks.map((task) => task()))) {
    const capabilities = { ...base.capabilities, ...patch.capabilities }
    // Replace the transaction so signing can remove the node's placeholder sender signature.
    Object.assign(base, patch, { capabilities })
  }
  return base
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
