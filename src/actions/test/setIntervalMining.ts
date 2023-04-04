import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Chain } from '../../types'

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
