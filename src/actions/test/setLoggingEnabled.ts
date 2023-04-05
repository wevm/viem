import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'

export async function setLoggingEnabled<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  enabled: boolean,
) {
  return await client.request({
    method: `${client.mode}_setLoggingEnabled`,
    params: [enabled],
  })
}
