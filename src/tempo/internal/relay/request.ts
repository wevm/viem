import type { Address } from 'abitype'
import { RpcResponse } from 'ox'
import { Transaction as core_Transaction } from 'ox/tempo'
import { tempo } from '../../../chains/index.js'
import { type Client, createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import type * as Relay from '../../Relay.js'
import * as Transaction from '../../Transaction.js'
import { formatError } from './error.js'
import type { SponsorshipDetails } from './feePayer.js'
import * as Utils from './utils.js'
import { extractCalls, resolveVirtualAddresses } from './virtualAddress.js'

export const response = Symbol('relay.response')
export const tokens = Symbol('relay.tokens')
const resolveClient = Symbol('relay.client')
const processing = Symbol('relay.processing')

export type Options = Relay.handleRequest.RequestOptions & {
  [processing]?: true | undefined
  [response]?:
    | { sponsorship_details?: SponsorshipDetails | undefined }
    | undefined
}

export type Handler = Relay.handleRequest.Handler & {
  [resolveClient]?: ((chainId: number) => { chain: { id: number } }) | undefined
  [tokens]?:
    | ((chainId: number, signal?: AbortSignal) => Promise<readonly Address[]>)
    | undefined
}

export type Result = {
  tx: Record<string, unknown>
  capabilities?: Record<string, unknown> | undefined
  sponsor?: unknown
}

export type Context = {
  client: Client
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
  return inherit(next, async (request, options: Options = {}) => {
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

      const bodyChainId =
        isRaw && Utils.isSerializedTempoTransaction(request.params?.[0])
          ? Transaction.deserialize(request.params[0]).chainId
          : isFill
            ? Utils.resolveChainId(parameters.chainId)
            : undefined

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
          transport: custom({
            request: (request, options) =>
              next(request, { ...requestOptions, ...options, chainId: id }),
          }),
        })
      }

      client = getClient()
      const result = await handle(request, {
        client,
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
      const virtualAddresses = await resolveVirtualAddresses(client, {
        calls: extractCalls(transaction),
      })
      const sponsor = filled.capabilities?.sponsor ?? filled.sponsor

      return {
        ...filled,
        tx: core_Transaction.toRpc(transaction as core_Transaction.Transaction),
        capabilities: {
          sponsored: !!sponsor,
          ...filled.capabilities,
          ...(virtualAddresses ? { virtualAddresses } : {}),
        },
      }
    } catch (error) {
      if (!outer) throw error

      if (
        isFill &&
        client &&
        error instanceof Error &&
        (parameters.capabilities as Record<string, unknown> | undefined)
          ?.errors === true
      )
        return formatError(error, parameters, client)

      throw Utils.toRpcError(error)
    }
  })
}

/** Normalize a downstream fill without discarding capabilities added by other plugins. */
export async function fill(
  client: Client,
  transaction: Record<string, unknown>,
): Promise<Result> {
  const result = (await client.request({
    method: 'eth_fillTransaction',
    params: [
      (transaction.type === '0x76'
        ? transaction
        : Utils.formatFillTransactionRequest(client, transaction)) as never,
    ],
  })) as unknown as Result

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
