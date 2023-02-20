import type { TestClient } from '../../clients'
import { hexToNumber } from '../../utils'

export type GetTxPoolStatusResponse = {
  pending: number
  queued: number
}

export async function getTxpoolStatus(
  client: TestClient,
): Promise<GetTxPoolStatusResponse> {
  const { pending, queued } = await client.request({
    method: 'txpool_status',
  })
  return {
    pending: hexToNumber(pending),
    queued: hexToNumber(queued),
  }
}
