import type { TestClient } from '../../clients/index.js'
import type { Address } from '../../types/index.js'

export type ImpersonateAccountParameters = {
  /** The account to impersonate. */
  address: Address
}

export async function impersonateAccount(
  client: TestClient,
  { address }: ImpersonateAccountParameters,
) {
  return await client.request({
    method: `${client.mode}_impersonateAccount`,
    params: [address],
  })
}
