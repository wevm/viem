import type { TestClient } from '../../clients'
import type { Hash } from '../../types'

export type DropTransactionArgs = {
  /** The hash of the transaction to drop. */
  hash: Hash
}

export async function dropTransaction(
  client: TestClient,
  { hash }: DropTransactionArgs,
) {
  return await client.request({
    method: `${client.mode}_dropTransaction`,
    params: [hash],
  })
}
