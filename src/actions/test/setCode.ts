import type { TestClient } from '../../clients/index.js'
import type { Address, Hex } from '../../types/index.js'

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
