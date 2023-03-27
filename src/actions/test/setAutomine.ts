import type { TestClient } from '../../clients/index.js'

export async function setAutomine(client: TestClient, enabled: boolean) {
  return await client.request({
    method: 'evm_setAutomine',
    params: [enabled],
  })
}
