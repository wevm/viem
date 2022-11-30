import { WalletRpc } from '../../rpcs'
import { TransactionRequest } from '../../types'
import { BaseError, serializeTransactionRequest } from '../../utils'

export type SendTransactionArgs = {
  request: TransactionRequest
}

export type SendTransactionResponse = { hash: `0x${string}` }

export async function sendTransaction(
  rpc: WalletRpc,
  { request }: SendTransactionArgs,
): Promise<SendTransactionResponse> {
  if (
    request.maxFeePerGas !== undefined &&
    request.maxPriorityFeePerGas !== undefined &&
    request.maxFeePerGas < request.maxPriorityFeePerGas
  )
    throw new BaseError({
      humanMessage: 'Gas values provided are invalid.',
      details: 'maxFeePerGas cannot be less than maxPriorityFeePerGas',
    })

  const rpcRequest = serializeTransactionRequest(request)

  const hash = await rpc.request({
    method: 'eth_sendTransaction',
    params: [rpcRequest],
  })
  return { hash }
}
