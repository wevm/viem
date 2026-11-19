import { batchGatewayAbi } from '../../constants/abis.js'
import { solidityError } from '../../constants/solidity.js'
import { HttpRequestError } from '../../errors/request.js'
import type { Hex } from '../../types/misc.js'
import { decodeFunctionData } from '../abi/decodeFunctionData.js'
import { encodeErrorResult } from '../abi/encodeErrorResult.js'
import { encodeFunctionResult } from '../abi/encodeFunctionResult.js'
import type {
  CcipRequestErrorType,
  CcipRequestParameters,
  CcipRequestReturnType,
} from '../ccip.js'
import { size } from '../data/size.js'

export const localBatchGatewayUrl = 'x-batch-gateway:true'

/**
 * Caps for one CCIP-Read lookup.
 *
 * - `bytes`: local batch response bytes in total, across callbacks and nested
 *   batches. Going over it fails the lookup.
 * - `concurrency`: gateway requests in flight at once, across nested batches.
 * - `depth`: nested callbacks, and separately, nested local batches.
 * - `queries`: gateway requests in total, across callbacks and nested batches.
 *   Each contract-chosen URL counts once, and a query with none counts once.
 *   Gateways a custom `ccipRead.request` adds (such as `ccipReadTunnel`'s
 *   `batchGateways`) are the caller's own and are not counted separately.
 */
export const ccipReadLimit = {
  bytes: 10_485_760,
  concurrency: 16,
  depth: 4,
  queries: 256,
} as const

/** Byte, query and concurrency budget shared by every request of one lookup. */
export type CcipReadBudget = {
  /** Local batch response bytes still allowed. */
  bytes: number
  /** Gateway requests still allowed. */
  queries: number
  /** Runs a gateway request once a concurrency slot is free. */
  run: <result>(fn: () => Promise<result>) => Promise<result>
}

/** Creates the budget for one CCIP-Read lookup. */
export function createCcipReadBudget(): CcipReadBudget {
  let active = 0
  const queue: (() => void)[] = []
  return {
    bytes: ccipReadLimit.bytes,
    queries: ccipReadLimit.queries,
    async run(fn) {
      if (active >= ccipReadLimit.concurrency)
        await new Promise<void>((resolve) => queue.push(resolve))
      else active++
      try {
        return await fn()
      } finally {
        // Hand the slot straight to the next waiter so a new caller cannot
        // take it in between.
        const next = queue.shift()
        if (next) next()
        else active--
      }
    },
  }
}

export async function localBatchGatewayRequest(parameters: {
  data: Hex
  ccipRequest: (
    parameters: CcipRequestParameters,
  ) => Promise<CcipRequestReturnType>
  budget?: CcipReadBudget | undefined
  depth?: number | undefined
}): Promise<Hex> {
  const {
    data,
    ccipRequest,
    budget = createCcipReadBudget(),
    depth = 0,
  } = parameters

  const {
    args: [queries],
  } = decodeFunctionData({ abi: batchGatewayAbi, data })

  const failures: boolean[] = []
  const responses: Hex[] = []
  await Promise.all(
    queries.map(async (query, i) => {
      try {
        const nested = query.urls.includes(localBatchGatewayUrl)
        if (nested && depth + 1 >= ccipReadLimit.depth)
          throw new HttpRequestError({
            details: `CCIP Read exceeded the maximum batch depth (${ccipReadLimit.depth}).`,
            url: localBatchGatewayUrl,
          })
        if (nested)
          responses[i] = await localBatchGatewayRequest({
            data: query.data,
            ccipRequest,
            budget,
            depth: depth + 1,
          })
        else {
          if (budget.queries <= 0)
            throw new HttpRequestError({
              details: `CCIP Read exceeded the maximum number of queries (${ccipReadLimit.queries}).`,
              url: query.urls[0] ?? '',
            })
          // Each URL is a gateway request, so each one draws from the budget.
          // A query with no URLs still costs one, since a custom request (such
          // as `ccipReadTunnel`) may send it elsewhere.
          const urls = query.urls.slice(0, budget.queries)
          budget.queries -= Math.max(1, urls.length)
          // Requests still queued once the batch is over budget are skipped.
          const response = await budget.run(async () =>
            budget.bytes < 0 ? '0x' : ccipRequest({ ...query, urls }),
          )
          budget.bytes -= size(response)
          if (budget.bytes < 0)
            throw new HttpRequestError({
              details: `CCIP Read exceeded the maximum response size (${ccipReadLimit.bytes} bytes).`,
              url: localBatchGatewayUrl,
            })
          responses[i] = response
        }
        failures[i] = false
      } catch (err) {
        // Over the byte budget, the whole batch fails rather than one query.
        if (budget.bytes < 0) throw err
        failures[i] = true
        responses[i] = encodeError(err as CcipRequestErrorType)
      }
    }),
  )

  return encodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    result: [failures, responses],
  })
}

function encodeError(error: CcipRequestErrorType): Hex {
  if (error.name === 'HttpRequestError' && error.status)
    return encodeErrorResult({
      abi: batchGatewayAbi,
      errorName: 'HttpError',
      args: [error.status, error.shortMessage],
    })
  return encodeErrorResult({
    abi: [solidityError],
    errorName: 'Error',
    args: ['shortMessage' in error ? error.shortMessage : error.message],
  })
}
