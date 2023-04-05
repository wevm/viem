import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'

export async function removeBlockTimestampInterval<
  TChain extends Chain | undefined,
>(client: TestClient<TestClientMode, TChain>) {
  return await client.request({
    method: `${client.mode}_removeBlockTimestampInterval`,
  })
}
