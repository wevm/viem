import { Abi, AbiError, AbiFunction } from 'ox'
import type { Hex } from 'ox'

import type * as CcipRead from '../../../../utils/CcipRead.js'
import { HttpError } from '../../../../utils/RpcClient.js'
import { getUrlOrigin } from '../../../internal/errors.js'
import * as queue from '../../../internal/queue.js'

/**
 * Sentinel gateway URL resolved client-side: batch queries fan out through
 * gateway requests locally instead of a hosted batch gateway.
 */
export const localBatchGatewayUrl = 'x-batch-gateway:true'

const batchGatewayAbi = /*#__PURE__*/ Abi.from([
  'function query((address sender, string[] urls, bytes data)[] queries) view returns (bool[] failures, bytes[] responses)',
  'error HttpError(uint16 status, string message)',
])

const solidityError = /*#__PURE__*/ AbiError.from('error Error(string message)')
const query = /*#__PURE__*/ AbiFunction.fromAbi(batchGatewayAbi, 'query')
const httpError = /*#__PURE__*/ AbiError.fromAbi(batchGatewayAbi, 'HttpError')
const maxLocalBatchConcurrency = 4
const maxLocalBatchDepth = 4
const maxLocalBatchQueries = 64

type Query = CcipRead.request.Options
type LocalBatchContext = {
  queryCount: number
  scheduler: queue.Queue<Query, Hex.Hex>
}

/** Routes one CCIP request through a hosted batch gateway. @internal */
export async function tunnelRequest(
  options: CcipRead.request.Options & {
    batchGateways: readonly string[]
    request: CcipRead.Request
  },
): Promise<Hex.Hex> {
  const {
    allowUnsafeUrls,
    batchGateways,
    data,
    maxResponseBodySize,
    request,
    requestOptions,
    sender,
    timeout,
    urls,
  } = options

  if (urls.includes(localBatchGatewayUrl))
    return await request({
      allowUnsafeUrls,
      data,
      maxResponseBodySize,
      requestOptions,
      sender,
      timeout,
      urls: batchGateways,
    })

  const result = await request({
    allowUnsafeUrls,
    data: AbiFunction.encodeData(query, [[{ data, sender, urls }]]),
    maxResponseBodySize,
    requestOptions,
    sender,
    timeout,
    urls: batchGateways,
  })
  const [failures, responses] = AbiFunction.decodeResult(query, result)
  const failure = failures[0]
  const response = responses[0]
  if (failure === undefined || response === undefined)
    throw new Error('An unknown error occurred.')
  if (!failure) return response

  let error: Error | undefined
  try {
    if (response.startsWith(AbiError.getSelector(httpError))) {
      const [status] = AbiError.decode(httpError, response)
      error = new HttpError({
        status,
        url: batchGateways.map(getUrlOrigin).join(' | '),
      })
    }
  } catch {}
  throw error ?? new Error('CCIP batch gateway request failed.')
}

/**
 * Resolves a batch-gateway `query` payload locally, fanning each sub-query
 * out through gateway requests (recursing for nested local batch URLs).
 */
export async function localBatchGatewayRequest(options: {
  data: Hex.Hex
  request: CcipRead.Request
}): Promise<Hex.Hex> {
  const { data, request } = options
  return localBatchGatewayRequest_(data, 0, {
    queryCount: 0,
    scheduler: queue.createQueue({
      concurrency: maxLocalBatchConcurrency,
      worker: async (options) => request(options),
    }),
  })
}

async function localBatchGatewayRequest_(
  data: Hex.Hex,
  depth: number,
  context: LocalBatchContext,
): Promise<Hex.Hex> {
  if (depth >= maxLocalBatchDepth)
    throw new Error('CCIP batch gateway nesting limit exceeded.')

  const [queries] = AbiFunction.decodeData(query, data) as [readonly Query[]]
  const queryCount = context.queryCount + queries.length
  if (queryCount > maxLocalBatchQueries)
    throw new Error('CCIP batch gateway query limit exceeded.')
  context.queryCount = queryCount

  const results = await Promise.all(
    queries.map(async (query) => {
      try {
        const response = query.urls.includes(localBatchGatewayUrl)
          ? await localBatchGatewayRequest_(query.data, depth + 1, context)
          : await context.scheduler.add(query)
        return { failure: false, response }
      } catch (err) {
        return { failure: true, response: encodeError(err as Error) }
      }
    }),
  )

  return AbiFunction.encodeResult(query, [
    results.map(({ failure }) => failure),
    results.map(({ response }) => response),
  ])
}

function encodeError(error: Error): Hex.Hex {
  if (error instanceof HttpError && error.status)
    return AbiError.encode(AbiError.fromAbi(batchGatewayAbi, 'HttpError'), [
      error.status,
      error.shortMessage,
    ])
  return AbiError.encode(solidityError, [
    'shortMessage' in error ? (error.shortMessage as string) : error.message,
  ])
}
