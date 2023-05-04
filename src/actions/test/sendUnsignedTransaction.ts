import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import { formatTransactionRequest } from '../../utils/formatters/transactionRequest.js'

export type SendUnsignedTransactionParameters = TransactionRequest

export type SendUnsignedTransactionReturnType = Hash

/**
 * Returns the details of all transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only.
 *
 * - Docs: https://viem.sh/docs/actions/test/getTxpoolContent.html
 *
 * @param client - Client to use
 * @param parameters – {@link SendUnsignedTransactionParameters}
 * @returns The transaction hash. {@link SendUnsignedTransactionReturnType}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { sendUnsignedTransaction } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * const hash = await sendUnsignedTransaction(client, {
 *   from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
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
