import { batchGatewayAbi } from '../../constants/abis.js'
import { solidityError } from '../../constants/solidity.js'
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

export async function localBatchGatewayRequest(parameters: {
  data: Hex
  ccipRequest: (
    parameters: CcipRequestParameters,
  ) => Promise<CcipRequestReturnType>
}): Promise<Hex> {
  const { data, ccipRequest } = parameters

  const {
    args: [queries],
  } = decodeFunctionData({ abi: batchGatewayAbi, data })

  const failures: boolean[] = []
  const responses: Hex[] = []
  await Promise.all(
    queries.map(async (query, i) => {
      try {
        responses[i] = await ccipRequest(query)
        failures[i] = false
      } catch (err) {
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
