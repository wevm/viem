import type { TestClient } from '../../clients'
import { hexToNumber } from '../../utils'

export type GetTxpoolStatusReturnType = {
  pending: number
  queued: number
}

export async function getTxpoolStatus(
  client: TestClient,
): Promise<GetTxpoolStatusReturnType> {
  const { pending, queued } = await client.request({
    method: 'txpool_status',
  })
  return {
    pending: hexToNumber(pending),
    queued: hexToNumber(queued),
  }
}
