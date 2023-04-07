import type { Chain } from '@wagmi/chains'
import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'

export async function removeBlockTimestampInterval<
  TChain extends Chain | undefined,
>(client: TestClient<TestClientMode, Transport, TChain>) {
  return await client.request({
    method: `${client.mode}_removeBlockTimestampInterval`,
  })
}
