import type { TestClient } from '../../clients'

export async function removeBlockTimestampInterval(client: TestClient) {
  return await client.request({
    method: `${client.mode}_removeBlockTimestampInterval`,
  })
}
