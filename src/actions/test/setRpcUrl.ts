import type { TestClient } from '../../clients'

export async function setRpcUrl(client: TestClient, jsonRpcUrl: string) {
  return await client.request({
    method: `${client.mode}_setRpcUrl`,
    params: [jsonRpcUrl],
  })
}
