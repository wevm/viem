import type { TestClient } from '../../clients'

export async function snapshot(client: TestClient) {
  return await client.request({
    method: 'evm_snapshot',
  })
}
