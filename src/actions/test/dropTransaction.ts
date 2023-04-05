import type { TestClient, TestClientMode } from '../../clients'
import type { Chain, Hash } from '../../types'

export type DropTransactionParameters = {
  /** The hash of the transaction to drop. */
  hash: Hash
}

export async function dropTransaction<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  { hash }: DropTransactionParameters,
) {
  return await client.request({
    method: `${client.mode}_dropTransaction`,
    params: [hash],
  })
}
