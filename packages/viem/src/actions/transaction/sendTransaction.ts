import { AccountProvider } from '../../providers/account'
import { TransactionRequest } from '../../types/ethereum-provider'
import { BaseError, serializeTransactionRequest } from '../../utils'

export type SendTransactionArgs = {
  request: TransactionRequest<bigint>
}

export type SendTransactionResponse = { hash: `0x${string}` }

export async function sendTransaction(
  provider: AccountProvider,
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

  const hash = await provider.request({
    method: 'eth_sendTransaction',
    params: [rpcRequest],
  })
  return { hash }
}
