import type { TestClient } from '../../clients'
import { Address } from '../../types'

export type InspectTxpoolResponse = {
  pending: Record<Address, Record<string, string>>
  queued: Record<Address, Record<string, string>>
}

export async function inspectTxpool(
  client: TestClient,
): Promise<InspectTxpoolResponse> {
  return await client.request({
    method: 'txpool_inspect',
  })
}
