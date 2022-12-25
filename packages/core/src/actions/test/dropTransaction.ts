import type { TestClient } from '../../clients'
import type { Data } from '../../types'

export type DropTransactionArgs = {
  /** The hash of the transaction to drop. */
  hash: Data
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
