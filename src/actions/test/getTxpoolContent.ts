import type { Address } from 'abitype'
import type { TestClient } from '../../clients/index.js'
import type { RpcTransaction } from '../../types/index.js'

export type GetTxpoolContentReturnType = {
  pending: Record<Address, Record<string, RpcTransaction>>
  queued: Record<Address, Record<string, RpcTransaction>>
}

export async function getTxpoolContent(
  client: TestClient,
): Promise<GetTxpoolContentReturnType> {
  return await client.request({
    method: 'txpool_content',
  })
}
