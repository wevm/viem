import * as Abi from 'ox/Abi'
import * as AbiError from 'ox/AbiError'
import * as AbiFunction from 'ox/AbiFunction'
import type * as Hex from 'ox/Hex'

import { HttpError } from '../../../../utils/RpcClient.js'
import type { ccipRequest } from '../../internal/ccip.js'

/**
 * Sentinel gateway URL resolved client-side: batch queries fan out through
 * `ccipRequest` locally instead of a hosted batch gateway.
 */
export const localBatchGatewayUrl = 'x-batch-gateway:true'

export const batchGatewayAbi = /*#__PURE__*/ Abi.from([
  'function query((address sender, string[] urls, bytes data)[] queries) view returns (bool[] failures, bytes[] responses)',
  'error HttpError(uint16 status, string message)',
])

const solidityError = /*#__PURE__*/ AbiError.from('error Error(string message)')

/**
 * Resolves a batch-gateway `query` payload locally, fanning each sub-query
 * out through `ccipRequest` (recursing for nested local batch URLs).
 */
export async function localBatchGatewayRequest(options: {
  ccipRequest: (options: ccipRequest.Options) => Promise<Hex.Hex>
  data: Hex.Hex
}): Promise<Hex.Hex> {
  const { ccipRequest, data } = options

  const queryFn = AbiFunction.fromAbi(batchGatewayAbi, 'query')
  const [queries] = AbiFunction.decodeData(queryFn, data) as [
    readonly { data: Hex.Hex; sender: Hex.Hex; urls: readonly string[] }[],
  ]

  const failures: boolean[] = []
  const responses: Hex.Hex[] = []
  await Promise.all(
    queries.map(async (query, i) => {
      try {
        responses[i] = query.urls.includes(localBatchGatewayUrl)
          ? await localBatchGatewayRequest({ ccipRequest, data: query.data })
          : await ccipRequest(query)
        failures[i] = false
      } catch (err) {
        failures[i] = true
        responses[i] = encodeError(err as Error)
      }
    }),
  )

  return AbiFunction.encodeResult(queryFn, [failures, responses])
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
