import type { TestClient } from '../../clients/index.js'

export async function removeBlockTimestampInterval(client: TestClient) {
  return await client.request({
    method: `${client.mode}_removeBlockTimestampInterval`,
  })
}
