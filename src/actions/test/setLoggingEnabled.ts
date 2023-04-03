import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Chain } from '../../types'

export async function setLoggingEnabled<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  enabled: boolean,
) {
  return await client.request({
    method: `${client.mode}_setLoggingEnabled`,
    params: [enabled],
  })
}
