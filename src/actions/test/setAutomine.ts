import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'

/**
 * Enables or disables the automatic mining of new blocks with each new transaction submitted to the network.
 *
 * - Docs: https://viem.sh/docs/actions/test/setAutomine.html
 *
 * @param client - Client to use
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setAutomine } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setAutomine(client)
 */
export async function setAutomine<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  enabled: boolean,
) {
  return await client.request({
    method: 'evm_setAutomine',
    params: [enabled],
  })
}
