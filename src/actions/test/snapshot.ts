import type { TestClient } from '../../clients/index.js'

export async function snapshot(client: TestClient) {
  return await client.request({
    method: 'evm_snapshot',
  })
}
