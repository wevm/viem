import { Address } from 'abitype'
import type { TestClient } from '../../clients'
import { RpcTransaction } from '../../types'

export type GetTxPoolContentResponse = {
  pending: Record<Address, Record<string, RpcTransaction>>
  queued: Record<Address, Record<string, RpcTransaction>>
}

export async function getTxpoolContent(
  client: TestClient,
): Promise<GetTxPoolContentResponse> {
  return await client.request({
    method: 'txpool_content',
  })
}
