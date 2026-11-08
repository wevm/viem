import { Abi, AbiError, AbiFunction } from 'ox'
import type { Hex } from 'ox'

import * as CcipRead from '../../../../utils/CcipRead.js'
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
const maxLocalBatchDepth = 4

/**
 * Caps for one CCIP Read lookup, shared across its callbacks and nested local
 * batches.
 *
 * - `concurrency`: gateway requests in flight at once.
 * - `queries`: gateway requests in total. Each contract-chosen URL counts
 *   once, and a request with none counts once.
 */
export const limits = {
  concurrency: 16,
  queries: 256,
} as const

type Query = CcipRead.request.Options

/** Query and concurrency budget shared by every gateway request of one lookup. */
export type Budget = {
  /** Gateway requests still allowed. */
  queries: number
  /** Runs a gateway request once a concurrency slot is free. */
  run: <result>(fn: () => Promise<result>) => Promise<result>
}

/** Creates the budget for one CCIP Read lookup. */
export function createBudget(): Budget {
  const scheduler = queue.createQueue<() => Promise<unknown>, unknown>({
    concurrency: limits.concurrency,
    worker: (fn) => fn(),
  })
  return {
    queries: limits.queries,
    run: (fn) => scheduler.add(fn) as ReturnType<typeof fn>,
  }
}

/**
 * Charges `urls` against the budget, returning the URLs that fit. Throws once
 * the budget is spent.
 */
export function charge(budget: Budget, urls: readonly string[]) {
  if (budget.queries <= 0)
    throw new CcipRead.LookupLimitExceededError({ limit: limits.queries })
  const urls_ = urls.slice(0, budget.queries)
  budget.queries -= Math.max(1, urls_.length)
  return urls_
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
  budget?: Budget | undefined
  data: Hex.Hex
  request: CcipRead.Request
}): Promise<Hex.Hex> {
  const { budget = createBudget(), data, request } = options
  return localBatchGatewayRequest_(data, 0, { budget, request })
}

async function localBatchGatewayRequest_(
  data: Hex.Hex,
  depth: number,
  context: { budget: Budget; request: CcipRead.Request },
): Promise<Hex.Hex> {
  if (depth >= maxLocalBatchDepth)
    throw new Error('CCIP batch gateway nesting limit exceeded.')

  const { budget, request } = context
  const [queries] = AbiFunction.decodeData(query, data) as [readonly Query[]]

  const results = await Promise.all(
    queries.map(async (query) => {
      try {
        if (query.urls.includes(localBatchGatewayUrl))
          return {
            failure: false,
            response: await localBatchGatewayRequest_(
              query.data,
              depth + 1,
              context,
            ),
          }
        const urls = charge(budget, query.urls)
        const response = await budget.run(() => request({ ...query, urls }))
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
