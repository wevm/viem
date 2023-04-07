import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Address, Chain } from '../../types/index.js'

export type InspectTxpoolReturnType = {
  pending: Record<Address, Record<string, string>>
  queued: Record<Address, Record<string, string>>
}

export async function inspectTxpool<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
): Promise<InspectTxpoolReturnType> {
  return await client.request({
    method: 'txpool_inspect',
  })
}
