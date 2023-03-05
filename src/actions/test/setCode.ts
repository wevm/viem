import type { TestClient } from '../../clients'
import type { Address, Hex } from '../../types'

export type SetCodeParameters = {
  /** The account address. */
  address: Address
  /** The bytecode to set */
  bytecode: Hex
}

export async function setCode(
  client: TestClient,
  { address, bytecode }: SetCodeParameters,
) {
  return await client.request({
    method: `${client.mode}_setCode`,
    params: [address, bytecode],
  })
}
