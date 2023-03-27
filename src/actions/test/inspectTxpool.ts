import type { TestClient } from '../../clients/index.js'
import type { Address } from '../../types/index.js'

export type InspectTxpoolReturnType = {
  pending: Record<Address, Record<string, string>>
  queued: Record<Address, Record<string, string>>
}

export async function inspectTxpool(
  client: TestClient,
): Promise<InspectTxpoolReturnType> {
  return await client.request({
    method: 'txpool_inspect',
  })
}
