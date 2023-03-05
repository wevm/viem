import type { TestClient } from '../../clients'
import type { Address } from '../../types'

export type StopImpersonatingAccountParameters = {
  /** The account to impersonate. */
  address: Address
}

export async function stopImpersonatingAccount(
  client: TestClient,
  { address }: StopImpersonatingAccountParameters,
) {
  return await client.request({
    method: `${client.mode}_stopImpersonatingAccount`,
    params: [address],
  })
}
