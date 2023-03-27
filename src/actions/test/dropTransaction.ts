import type { TestClient } from '../../clients/index.js'
import type { Hash } from '../../types/index.js'

export type DropTransactionParameters = {
  /** The hash of the transaction to drop. */
  hash: Hash
}

export async function dropTransaction(
  client: TestClient,
  { hash }: DropTransactionParameters,
) {
  return await client.request({
    method: `${client.mode}_dropTransaction`,
    params: [hash],
  })
}
