import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'

export async function setAutomine<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  enabled: boolean,
) {
  return await client.request({
    method: 'evm_setAutomine',
    params: [enabled],
  })
}
