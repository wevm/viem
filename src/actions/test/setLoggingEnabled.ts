import type { TestClient } from '../../clients/index.js'

export async function setLoggingEnabled(client: TestClient, enabled: boolean) {
  return await client.request({
    method: `${client.mode}_setLoggingEnabled`,
    params: [enabled],
  })
}
