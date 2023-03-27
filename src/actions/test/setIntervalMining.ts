import type { TestClient } from '../../clients/index.js'

export type SetIntervalMiningParameters = {
  /** The mining interval. */
  interval: number
}

export async function setIntervalMining(
  client: TestClient,
  { interval }: SetIntervalMiningParameters,
) {
  return await client.request({
    method: 'evm_setIntervalMining',
    params: [interval],
  })
}
