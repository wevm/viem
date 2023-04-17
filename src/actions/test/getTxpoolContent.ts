import type { Address } from 'abitype'
import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain, RpcTransaction } from '../../types/index.js'

export type GetTxpoolContentReturnType = {
  /** Pending transactions in the pool */
  pending: Record<Address, Record<string, RpcTransaction>>
  /** Queued transactions in the pool */
  queued: Record<Address, Record<string, RpcTransaction>>
}

/**
 * Returns the details of all transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only.
 *
 * - Docs: https://viem.sh/docs/actions/test/getTxpoolContent.html
 *
 * @param client - Client to use
 * @returns Transaction pool content. {@link GetTxpoolContentReturnType}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { getTxpoolContent } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * const content = await getTxpoolContent(client)
 */
export async function getTxpoolContent<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
): Promise<GetTxpoolContentReturnType> {
  return await client.request({
    method: 'txpool_content',
  })
}
