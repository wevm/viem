import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain, Hash, TransactionRequest } from '../../types/index.js'
import { formatTransactionRequest } from '../../utils/index.js'

export type SendUnsignedTransactionParameters = TransactionRequest

export type SendUnsignedTransactionReturnType = Hash

export async function sendUnsignedTransaction<
  TChain extends Chain | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain>,
  request: SendUnsignedTransactionParameters,
): Promise<SendUnsignedTransactionReturnType> {
  const request_ = formatTransactionRequest(request)
  const hash = await client.request({
    method: 'eth_sendUnsignedTransaction',
    params: [request_],
  })
  return hash
}
