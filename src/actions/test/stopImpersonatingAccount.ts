import type { TestClient } from '../../clients/index.js'
import type { Address } from '../../types/index.js'

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
