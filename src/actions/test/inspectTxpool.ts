import type { TestClient } from '../../clients'

export async function inspectTxpool(client: TestClient) {
  return await client.request({
    method: 'txpool_inspect',
  })
}
