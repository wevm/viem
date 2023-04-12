import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain, Quantity } from '../../types/index.js'

export type RevertParameters = {
  /** The snapshot ID to revert to. */
  id: Quantity
}

/**
 * Revert the state of the blockchain at the current block.
 *
 * - Docs: https://viem.sh/docs/actions/test/revert.html
 *
 * @param client - Client to use
 * @param parameters – {@link RevertParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { revert } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await revert(client, { id: '0x…' })
 */
export async function revert<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { id }: RevertParameters,
) {
  return await client.request({
    method: 'evm_revert',
    params: [id],
  })
}
