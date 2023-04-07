import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'

export async function setLoggingEnabled<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  enabled: boolean,
) {
  return await client.request({
    method: `${client.mode}_setLoggingEnabled`,
    params: [enabled],
  })
}
