import type { TestClient, TestClientMode } from '../../clients'
import type { Address, Chain } from '../../types'

export type ImpersonateAccountParameters = {
  /** The account to impersonate. */
  address: Address
}

export async function impersonateAccount<TChain extends Chain | undefined,>(
  client: TestClient<TestClientMode, TChain>,
  { address }: ImpersonateAccountParameters,
) {
  return await client.request({
    method: `${client.mode}_impersonateAccount`,
    params: [address],
  })
}
