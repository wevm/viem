import type { TestClient } from '../../clients'
import type { Address } from '../../types'
import { numberToHex } from '../../utils'

export type SetBalanceParameters = {
  /** The account address. */
  address: Address
  /** Amount (in wei) to set */
  value: bigint
}

export async function setBalance(
  client: TestClient,
  { address, value }: SetBalanceParameters,
) {
  return await client.request({
    method: `${client.mode}_setBalance`,
    params: [address, numberToHex(value)],
  })
}
