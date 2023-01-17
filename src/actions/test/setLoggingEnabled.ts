import type { TestClient } from '../../clients'

export async function setLoggingEnabled(client: TestClient, enabled: boolean) {
  return await client.request({
    method: `${client.mode}_setLoggingEnabled`,
    params: [enabled],
  })
}
