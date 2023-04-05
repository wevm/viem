import type { TestClient, TestClientMode } from '../../clients'
import type { Address, Chain } from '../../types'

export type InspectTxpoolReturnType = {
  pending: Record<Address, Record<string, string>>
  queued: Record<Address, Record<string, string>>
}

export async function inspectTxpool<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
): Promise<InspectTxpoolReturnType> {
  return await client.request({
    method: 'txpool_inspect',
  })
}
