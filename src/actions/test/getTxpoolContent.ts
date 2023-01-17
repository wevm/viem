import type { TestClient } from '../../clients'

export async function getTxpoolContent(client: TestClient) {
  return await client.request({
    method: 'txpool_content',
  })
}
