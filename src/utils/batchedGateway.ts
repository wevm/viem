import type { Hex } from '~viem/types/misc.js'
import type { ccipRequest } from './ccip.js'
import { decodeFunctionData } from './abi/decodeFunctionData.js'
import { encodeErrorResult } from './abi/encodeErrorResult.js'
import { encodeFunctionResult } from './abi/encodeFunctionResult.js'
import { HttpRequestError } from '../errors/request.js'
import { batchedGatewayAbi } from '../constants/abis.js'

export const viemBatchedGateway = 'viem://batchedGateway'

export async function batchedGateway(
  data: Hex,
  ccipRequest_: typeof ccipRequest,
): Promise<Hex> {
  const {
    args: [queries],
  } = decodeFunctionData({ abi: batchedGatewayAbi, data })
  const failures: boolean[] = []
  const responses: Hex[] = []
  await Promise.all(
    queries.map(async (query, i) => {
      try {
        responses[i] = await ccipRequest_(query)
      } catch (err) {
        failures[i] = true
        responses[i] = encodeErrorResult({
          abi: batchedGatewayAbi,
          errorName: 'HttpError',
          args: [
            (err instanceof HttpRequestError && err.status) || 500,
            err instanceof Error ? err.message : String(err),
          ],
        })
      }
    }),
  )
  return encodeFunctionResult({
    abi: batchedGatewayAbi,
    functionName: 'query',
    result: [failures, responses],
  })
}
