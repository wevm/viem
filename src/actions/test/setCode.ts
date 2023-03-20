import type { TestClientArg } from '../../clients'
import type { Address, Hex } from '../../types'

export type SetCodeParameters = {
  /** The account address. */
  address: Address
  /** The bytecode to set */
  bytecode: Hex
}

export async function setCode(
  client: TestClientArg,
  { address, bytecode }: SetCodeParameters,
) {
  return await client.request({
    method: `${client.mode}_setCode`,
    params: [address, bytecode],
  })
}
