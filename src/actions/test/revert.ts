import type { TestClient, TestClientMode } from '../../clients'
import type { Chain, Quantity } from '../../types'

export type RevertParameters = {
  /** The snapshot ID to revert to. */
  id: Quantity
}

export async function revert<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  { id }: RevertParameters,
) {
  return await client.request({
    method: 'evm_revert',
    params: [id],
  })
}
