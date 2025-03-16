import { batchGatewayAbi } from '../constants/abis.js'
import { solidityError } from '..//constants/solidity.js'
import { BaseError } from '../errors/base.js'
import { HttpRequestError } from '../errors/request.js'
import type { Hex } from '../types/misc.js'
import { decodeFunctionData } from './abi/decodeFunctionData.js'
import { encodeErrorResult } from './abi/encodeErrorResult.js'
import { encodeFunctionResult } from './abi/encodeFunctionResult.js'
import type { ccipRequest } from './ccip.js'

export const localBatchGatewayUrl = 'x-batch-gateway:true'

export async function localBatchGateway(
  data: Hex,
  ccipRequest_: typeof ccipRequest,
): Promise<Hex> {
  const {
    args: [queries],
  } = decodeFunctionData({ abi: batchGatewayAbi, data })
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
    abi: batchGatewayAbi,
    functionName: 'query',
    result: [failures, responses],
  })
}

function encodeError(err: unknown): Hex {
  if (err instanceof HttpRequestError && err.status) {
    return encodeErrorResult({
      abi: batchGatewayAbi,
      errorName: 'HttpError',
      args: [err.status, err.shortMessage],
    })
  }
  return encodeErrorResult({
    abi: [solidityError],
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
