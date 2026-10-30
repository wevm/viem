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

export const localBatchGatewayUrl = 'x-batch-gateway:true'

/**
 * Caps for one CCIP-Read lookup.
 *
 * Callbacks and nested batch gateways share this depth.
 */
export const ccipReadLimit = {
  depth: 4,
} as const

type CcipBatchBudget = {
  depth: number
  maxDepth: number
  /** Highest depth reached on this lookup. Shared with the caller. */
  deepest: { n: number }
}

export async function localBatchGatewayRequest(parameters: {
  data: Hex
  ccipRequest: (
    parameters: CcipRequestParameters,
  ) => Promise<CcipRequestReturnType>
  budget?: CcipBatchBudget | undefined
}): Promise<Hex> {
  const { data, ccipRequest } = parameters
  const budget = parameters.budget ?? {
    depth: 0,
    maxDepth: ccipReadLimit.depth,
    deepest: { n: 0 },
  }

  if (budget.depth >= budget.maxDepth)
    throw new HttpRequestError({
      details: `CCIP Read exceeded the maximum callback depth (${budget.maxDepth}).`,
      url: '',
    })

  if (budget.depth > budget.deepest.n) budget.deepest.n = budget.depth

  const {
    args: [queries],
  } = decodeFunctionData({ abi: batchGatewayAbi, data })

  const failures: boolean[] = []
  const responses: Hex[] = []
  const tasks: Promise<void>[] = []

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i]
    if (!query) continue
    const index = i
    const url = query.urls[0] ?? ''

    if (
      query.urls.includes(localBatchGatewayUrl) &&
      budget.depth + 1 >= budget.maxDepth
    ) {
      failures[index] = true
      responses[index] = encodeError(
        limitError(
          `CCIP Read exceeded the maximum callback depth (${budget.maxDepth}).`,
          url,
        ),
      )
      continue
    }

    if (query.urls.includes(localBatchGatewayUrl)) {
      tasks.push(
        settle(index, failures, responses, () =>
          localBatchGatewayRequest({
            data: query.data,
            ccipRequest,
            budget: {
              depth: budget.depth + 1,
              maxDepth: budget.maxDepth,
              deepest: budget.deepest,
            },
          }),
        ),
      )
      continue
    }

    tasks.push(settle(index, failures, responses, () => ccipRequest(query)))
  }

  await Promise.all(tasks)

  return encodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    result: [failures, responses],
  })
}

function limitError(details: string, url: string): CcipRequestErrorType {
  return new HttpRequestError({ details, url }) as CcipRequestErrorType
}

function settle(
  index: number,
  failures: boolean[],
  responses: Hex[],
  run: () => Promise<Hex>,
) {
  return run().then(
    (result) => {
      responses[index] = result
      failures[index] = false
    },
    (err: unknown) => {
      failures[index] = true
      responses[index] = encodeError(err as CcipRequestErrorType)
    },
  )
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
