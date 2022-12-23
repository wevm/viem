import type { TestClient } from '../../clients'

export async function setAutomine(client: TestClient, enabled: boolean) {
  return await client.request({
    method: 'evm_setAutomine',
    params: [enabled],
  })
}
