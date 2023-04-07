import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Address, Chain } from '../../types/index.js'

export type StopImpersonatingAccountParameters = {
  /** The account to impersonate. */
  address: Address
}

export async function stopImpersonatingAccount<
  TChain extends Chain | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { address }: StopImpersonatingAccountParameters,
) {
  return await client.request({
    method: `${client.mode}_stopImpersonatingAccount`,
    params: [address],
  })
}
