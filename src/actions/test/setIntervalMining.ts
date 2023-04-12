import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'

export type SetIntervalMiningParameters = {
  /** The mining interval. */
  interval: number
}

/**
 * Sets the automatic mining interval (in seconds) of blocks. Setting the interval to 0 will disable automatic mining.
 *
 * - Docs: https://viem.sh/docs/actions/test/setIntervalMining.html
 *
 * @param client - Client to use
 * @param parameters – {@link SetIntervalMiningParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setIntervalMining } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setIntervalMining(client, { interval: 5 })
 */
export async function setIntervalMining<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { interval }: SetIntervalMiningParameters,
) {
  return await client.request({
    method: 'evm_setIntervalMining',
    params: [interval],
  })
}
