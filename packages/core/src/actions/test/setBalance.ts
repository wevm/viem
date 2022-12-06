import type { TestClient } from '../../clients'
import type { Address } from '../../types'
import { numberToHex } from '../../utils'

export type SetBalanceArgs = {
  /** The account address. */
  address: Address
  /** Amount (in wei) to set */
  value: bigint
}

export async function setBalance(
  rpc: TestClient,
  { address, value }: SetBalanceArgs,
) {
  return await rpc.request({
    method: `${rpc.key}_setBalance`,
    params: [address, numberToHex(value)],
  })
}
