import { TestRpc } from '../../rpcs'
import { Address } from '../../types'
import { numberToHex } from '../../utils'

export type SetBalanceArgs = {
  /** The account address. */
  address: Address
  /** Amount (in wei) to set */
  value: bigint
}

export async function setBalance(
  rpc: TestRpc,
  { address, value }: SetBalanceArgs,
) {
  return await rpc.request({
    method: `${rpc.key}_setBalance`,
    params: [address, numberToHex(value)],
  })
}
