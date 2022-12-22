import type { TestClient } from '../../clients'
import type { Address } from '../../types'

export type ImpersonateAccountArgs = {
  /** The account to impersonate. */
  address: Address
}

export async function impersonateAccount(
  client: TestClient,
  { address }: ImpersonateAccountArgs,
) {
  return await client.request({
    method: `${client.mode}_impersonateAccount`,
    params: [address],
  })
}
