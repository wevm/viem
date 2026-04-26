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
          let error: Error | undefined
          try {
            const res = decodeErrorResult({
              abi: [...batchGatewayAbi, solidityError],
              data: responses[0],
            })
            if (res.errorName === 'HttpError') {
              error = new HttpRequestError({
                body: { message: res.args[1] },
                status: res.args[0],
                url: urls.join(' | '),
              })
            } else {
              const message = res.args[0]
              if (message) {
                error = new Error(message)
              }
            }
          } catch {}
          throw error ?? new Error('An unknown error occurred.')
        }
        return responses[0]
      }
    },
  }
}
