import type { TestClientArg } from '../../clients'
import type { Quantity } from '../../types'

export type RevertParameters = {
  /** The snapshot ID to revert to. */
  id: Quantity
}

export async function revert(client: TestClientArg, { id }: RevertParameters) {
  return await client.request({
    method: 'evm_revert',
    params: [id],
  })
}
