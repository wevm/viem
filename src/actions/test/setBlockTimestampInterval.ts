import type { Chain } from '@wagmi/chains'
import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'

export type SetBlockTimestampIntervalParameters = {
  /** The interval (in seconds). */
  interval: number
}

export async function setBlockTimestampInterval<
  TChain extends Chain | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { interval }: SetBlockTimestampIntervalParameters,
) {
  return await client.request({
    method: `${client.mode}_setBlockTimestampInterval`,
    params: [interval],
  })
}
