import type { Hex } from '../types/misc.js'
import type { ccipRequest } from './ccip.js'
import { localBatchedGatewayAbi } from '../constants/abis.js'
import { BaseError } from '../errors/base.js'
import { HttpRequestError } from '../errors/request.js'
import { decodeFunctionData } from './abi/decodeFunctionData.js'
import { encodeFunctionResult } from './abi/encodeFunctionResult.js'
import { encodeErrorResult } from './abi/encodeErrorResult.js'

export const localBatchedGatewayURL = 'x-batched-gateway:true'

export async function localBatchedGateway(
  data: Hex,
  ccipRequest_: typeof ccipRequest,
): Promise<Hex> {
  const {
    args: [queries],
  } = decodeFunctionData({ abi: localBatchedGatewayAbi, data })
  const failures: boolean[] = []
  const responses: Hex[] = []
  await Promise.all(
    queries.map(async (query, i) => {
      try {
        responses[i] = await ccipRequest_(query)
        failures[i] = false
      } catch (err) {
        failures[i] = true
        responses[i] = encodeError(err)
      }
    }),
  )
  return encodeFunctionResult({
    abi: localBatchedGatewayAbi,
    functionName: 'query',
    result: [failures, responses],
  })
}

function encodeError(err: unknown): Hex {
  if (err instanceof HttpRequestError && err.status) {
    return encodeErrorResult({
      abi: localBatchedGatewayAbi,
      errorName: 'HttpError',
      args: [err.status, err.shortMessage],
    })
  }
  return encodeErrorResult({
    abi: localBatchedGatewayAbi,
    errorName: 'Error',
    args: [
      err instanceof Error
        ? err instanceof BaseError
          ? err.shortMessage
          : err.message
        : String(err),
    ],
  })
}
