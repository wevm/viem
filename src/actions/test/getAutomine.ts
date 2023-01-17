import type { TestClient } from '../../clients'

export type GetAutomineResponse = boolean

export async function getAutomine(
  client: TestClient,
): Promise<GetAutomineResponse> {
  return await client.request({
    method: `${client.mode}_getAutomine`,
  })
}
