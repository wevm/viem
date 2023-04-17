import type { Chain } from '@wagmi/chains'
import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'

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
  return await client.request({
    method: `${client.mode}_removeBlockTimestampInterval`,
  })
}
