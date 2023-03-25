import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Chain } from '../../types'

export async function setRpcUrl<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  jsonRpcUrl: string,
) {
  return await client.request({
    method: `${client.mode}_setRpcUrl`,
    params: [jsonRpcUrl],
  })
}
