import { Address } from 'abitype'
import type { TestClient } from '../../clients'
import { RpcTransaction } from '../../types'

export type GetTxpoolContentResponse = {
  pending: Record<Address, Record<string, RpcTransaction>>
  queued: Record<Address, Record<string, RpcTransaction>>
}

export async function getTxpoolContent(
  client: TestClient,
): Promise<GetTxpoolContentResponse> {
  return await client.request({
    method: 'txpool_content',
  })
}
