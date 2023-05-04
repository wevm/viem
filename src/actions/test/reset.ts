import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'

export type ResetParameters = {
  /** The block number to reset from. */
  blockNumber?: bigint
  /** The JSON RPC URL. */
  jsonRpcUrl?: string
}

/**
 * Resets fork back to its original state.
 *
 * - Docs: https://viem.sh/docs/actions/test/reset.html
 *
 * @param client - Client to use
 * @param parameters – {@link ResetParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { reset } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await reset(client, { blockNumber: 69420n })
 */
export async function reset<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { blockNumber, jsonRpcUrl }: ResetParameters = {},
) {
  await client.request({
    method: `${client.mode}_reset`,
    params: [{ forking: { blockNumber: Number(blockNumber), jsonRpcUrl } }],
  })
}
