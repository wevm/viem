import { batchGatewayAbi } from '../constants/abis.js'
import { solidityError } from '../constants/solidity.js'
import { HttpRequestError } from '../errors/request.js'
import { decodeErrorResult } from './abi/decodeErrorResult.js'
import { decodeFunctionResult } from './abi/decodeFunctionResult.js'
import { encodeFunctionData } from './abi/encodeFunctionData.js'
import { ccipRequest as ccipRequest_ } from './ccip.js'
import { localBatchGatewayUrl } from './ens/localBatchGatewayRequest.js'

export type CcipReadTunnelParameters = {
  batchGateways: string[]
  ccipRequest?: typeof ccipRequest_
}

export function createCcipReadTunnel({
  batchGateways,
  ccipRequest = ccipRequest_,
}: CcipReadTunnelParameters): { request: typeof ccipRequest_ } {
  return {
    async request({ data, sender, urls }) {
      if (urls.includes(localBatchGatewayUrl)) {
        return ccipRequest({
          data,
          sender,
          urls: batchGateways,
        })
      } else {
        const [failures, responses] = decodeFunctionResult({
          abi: batchGatewayAbi,
          functionName: 'query',
          data: await ccipRequest({
            data: encodeFunctionData({
              abi: batchGatewayAbi,
              functionName: 'query',
              args: [[{ sender, data, urls }]],
            }),
            sender,
            urls: batchGateways,
          }),
        })
        if (failures[0]) {
          try {
            const {
              args: [status, message],
            } = decodeErrorResult({
              abi: batchGatewayAbi,
              data: responses[0],
            })
            throw new HttpRequestError({
              body: { message },
              status,
              url: urls.join(' | '),
            })
          } catch {
            let message: string | undefined
            try {
              ;({
                args: [message],
              } = decodeErrorResult({
                abi: [solidityError],
                data: responses[0],
              }))
            } catch {}
            throw new Error(message ?? 'An unknown error occurred.')
          }
        }
        return responses[0]
      }
    },
  }
}
