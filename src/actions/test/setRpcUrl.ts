import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'

export async function setRpcUrl<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  jsonRpcUrl: string,
) {
  return await client.request({
    method: `${client.mode}_setRpcUrl`,
    params: [jsonRpcUrl],
  })
}
