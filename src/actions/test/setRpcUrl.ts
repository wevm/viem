import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'

export async function setRpcUrl<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  jsonRpcUrl: string,
) {
  return await client.request({
    method: `${client.mode}_setRpcUrl`,
    params: [jsonRpcUrl],
  })
}
