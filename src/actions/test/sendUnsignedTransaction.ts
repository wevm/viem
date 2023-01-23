import type { TestClient } from '../../clients'
import type { Hash, TransactionRequest } from '../../types'
import { formatTransactionRequest } from '../../utils'

export type SendUnsignedTransactionArgs = TransactionRequest

export type SendUnsignedTransactionResponse = Hash

export async function sendUnsignedTransaction(
  client: TestClient,
  request: SendUnsignedTransactionArgs,
): Promise<SendUnsignedTransactionResponse> {
  const request_ = formatTransactionRequest(request)
  const hash = await client.request({
    method: 'eth_sendUnsignedTransaction',
    params: [request_],
  })
  return hash
}
