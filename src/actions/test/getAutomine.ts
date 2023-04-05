import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'

export type GetAutomineReturnType = boolean

export async function getAutomine<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
): Promise<GetAutomineReturnType> {
  return await client.request({
    method: `${client.mode}_getAutomine`,
  })
}
