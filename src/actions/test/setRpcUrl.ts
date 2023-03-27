import type { TestClient } from '../../clients/index.js'

export async function setRpcUrl(client: TestClient, jsonRpcUrl: string) {
  return await client.request({
    method: `${client.mode}_setRpcUrl`,
    params: [jsonRpcUrl],
  })
}
