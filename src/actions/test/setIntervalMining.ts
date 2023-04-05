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

export async function setIntervalMining<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { interval }: SetIntervalMiningParameters,
) {
  return await client.request({
    method: 'evm_setIntervalMining',
    params: [interval],
  })
}
