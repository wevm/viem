import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'

/**
 * Removes [`setBlockTimestampInterval`](https://viem.sh/docs/actions/test/setBlockTimestampInterval.html) if it exists.
 *
 * - Docs: https://viem.sh/docs/actions/test/removeBlockTimestampInterval.html
 *
 * @param client - Client to use
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { removeBlockTimestampInterval } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await removeBlockTimestampInterval(client)
 */
export async function removeBlockTimestampInterval<
  TChain extends Chain | undefined,
>(client: TestClient<TestClientMode, Transport, TChain>) {
  await client.request({
    method: `${client.mode}_removeBlockTimestampInterval`,
  })
}
