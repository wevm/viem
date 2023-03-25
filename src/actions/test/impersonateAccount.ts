import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Address, Chain } from '../../types'

export type ImpersonateAccountParameters = {
  /** The account to impersonate. */
  address: Address
}

export async function impersonateAccount<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { address }: ImpersonateAccountParameters,
) {
  return await client.request({
    method: `${client.mode}_impersonateAccount`,
    params: [address],
  })
}
