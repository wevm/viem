import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Chain } from '../../types'

export type GetAutomineReturnType = boolean

export async function getAutomine<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
): Promise<GetAutomineReturnType> {
  return await client.request({
    method: `${client.mode}_getAutomine`,
  })
}
