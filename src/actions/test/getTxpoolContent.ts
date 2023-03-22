import type { Address } from 'abitype'
import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Chain, RpcTransaction } from '../../types'

export type GetTxpoolContentReturnType = {
  pending: Record<Address, Record<string, RpcTransaction>>
  queued: Record<Address, Record<string, RpcTransaction>>
}

export async function getTxpoolContent<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
): Promise<GetTxpoolContentReturnType> {
  return await client.request({
    method: 'txpool_content',
  })
}
