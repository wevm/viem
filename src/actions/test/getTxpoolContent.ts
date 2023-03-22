import type { Address } from 'abitype'
import type { TestClientArg } from '../../clients'
import type { RpcTransaction } from '../../types'

export type GetTxpoolContentReturnType = {
  pending: Record<Address, Record<string, RpcTransaction>>
  queued: Record<Address, Record<string, RpcTransaction>>
}

export async function getTxpoolContent(
  client: TestClientArg,
): Promise<GetTxpoolContentReturnType> {
  return await client.request({
    method: 'txpool_content',
  })
}
