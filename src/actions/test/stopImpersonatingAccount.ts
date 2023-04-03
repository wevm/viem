import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Address, Chain } from '../../types'

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
