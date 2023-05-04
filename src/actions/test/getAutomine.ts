import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'

export type GetAutomineReturnType = boolean

/**
 * Returns the automatic mining status of the node.
 *
 * - Docs: https://viem.sh/docs/actions/test/getAutomine.html
 *
 * @param client - Client to use
 * @returns Whether or not the node is auto mining. {@link GetAutomineReturnType}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { getAutomine } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * const isAutomining = await getAutomine(client)
 */
export async function getAutomine<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
): Promise<GetAutomineReturnType> {
  return await client.request({
    method: `${client.mode}_getAutomine`,
  })
}
