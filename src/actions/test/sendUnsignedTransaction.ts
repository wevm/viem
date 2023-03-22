import type { TestClientArg } from '../../clients'
import type { Hash, TransactionRequest } from '../../types'
import { formatTransactionRequest } from '../../utils'

export type SendUnsignedTransactionParameters = TransactionRequest

export type SendUnsignedTransactionReturnType = Hash

export async function sendUnsignedTransaction(
  client: TestClientArg,
  request: SendUnsignedTransactionParameters,
): Promise<SendUnsignedTransactionReturnType> {
  const request_ = formatTransactionRequest(request)
  const hash = await client.request({
    method: 'eth_sendUnsignedTransaction',
    params: [request_],
  })
  return hash
}
