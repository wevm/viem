import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'

export type DropTransactionParameters = {
  /** The hash of the transaction to drop. */
  hash: Hash
}

/**
 * Removes a transaction from the mempool.
 *
 * - Docs: https://viem.sh/docs/actions/test/dropTransaction.html
 *
 * @param client - Client to use
 * @param parameters - {@link DropTransactionParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { dropTransaction } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await dropTransaction(client, {
 *   hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364'
 * })
 */
export async function dropTransaction<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { hash }: DropTransactionParameters,
) {
  await client.request({
    method: `${client.mode}_dropTransaction`,
    params: [hash],
  })
}
