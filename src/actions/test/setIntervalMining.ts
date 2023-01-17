import type { TestClient } from '../../clients'

export type SetIntervalMiningArgs = {
  /** The mining interval. */
  interval: number
}

export async function setIntervalMining(
  client: TestClient,
  { interval }: SetIntervalMiningArgs,
) {
  return await client.request({
    method: 'evm_setIntervalMining',
    params: [interval],
  })
}
