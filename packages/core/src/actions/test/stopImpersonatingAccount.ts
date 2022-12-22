import type { TestClient } from '../../clients'
import type { Address } from '../../types'

export type StopImpersonatingAccountArgs = {
  /** The account to impersonate. */
  address: Address
}

export async function stopImpersonatingAccount(
  client: TestClient,
  { address }: StopImpersonatingAccountArgs,
) {
  return await client.request({
    method: `${client.mode}_stopImpersonatingAccount`,
    params: [address],
  })
}
