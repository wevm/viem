import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Address, Chain } from '../../types/index.js'

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
