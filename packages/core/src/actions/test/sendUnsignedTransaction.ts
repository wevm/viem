import type { TestClient } from '../../clients'
import type { TransactionRequest } from '../../types'
import { formatTransactionRequest } from '../../utils'

export type SendUnsignedTransactionArgs = {
  request: TransactionRequest
}

export type SendUnsignedTransactionResponse = { hash: `0x${string}` }

export async function sendUnsignedTransaction(
  client: TestClient,
  { request }: SendUnsignedTransactionArgs,
): Promise<SendUnsignedTransactionResponse> {
  const request_ = formatTransactionRequest(request)
  const hash = await client.request({
    method: 'eth_sendUnsignedTransaction',
    params: [request_],
  })
  return { hash }
}
