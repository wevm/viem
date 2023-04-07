import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain, Hash } from '../../types/index.js'

export type DropTransactionParameters = {
  /** The hash of the transaction to drop. */
  hash: Hash
}

export async function dropTransaction<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { hash }: DropTransactionParameters,
) {
  return await client.request({
    method: `${client.mode}_dropTransaction`,
    params: [hash],
  })
}
