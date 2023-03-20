import type { TestClientArg } from '../../clients'
import type { Address } from '../../types'

export type InspectTxpoolReturnType = {
  pending: Record<Address, Record<string, string>>
  queued: Record<Address, Record<string, string>>
}

export async function inspectTxpool(
  client: TestClientArg,
): Promise<InspectTxpoolReturnType> {
  return await client.request({
    method: 'txpool_inspect',
  })
}
