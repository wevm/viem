import type { TestClient } from '../../clients'
import { hexToNumber } from '../../utils'

export async function getTxpoolStatus(client: TestClient) {
  const { pending, queued } = await client.request({
    method: 'txpool_status',
  })
  return {
    pending: hexToNumber(pending),
    queued: hexToNumber(queued),
  }
}
