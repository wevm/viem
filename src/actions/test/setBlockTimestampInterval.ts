import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'

export type SetBlockTimestampIntervalParameters = {
  /** The interval (in seconds). */
  interval: number
}

export async function setBlockTimestampInterval<
  TChain extends Chain | undefined,
>(
  client: TestClient<TestClientMode, TChain>,
  { interval }: SetBlockTimestampIntervalParameters,
) {
  return await client.request({
    method: `${client.mode}_setBlockTimestampInterval`,
    params: [interval],
  })
}
