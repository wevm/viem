import type { TestClient, TestClientMode } from '../../clients'
import type { Chain } from '../../types'

export async function setAutomine<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  enabled: boolean,
) {
  return await client.request({
    method: 'evm_setAutomine',
    params: [enabled],
  })
}
