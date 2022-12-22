import type { TestClient } from '../../clients'
import type { Address, Data } from '../../types'

export type SetCodeArgs = {
  /** The account address. */
  address: Address
  /** The bytecode to set */
  bytecode: Data
}

export async function setCode(
  client: TestClient,
  { address, bytecode }: SetCodeArgs,
) {
  return await client.request({
    method: `${client.mode}_setCode`,
    params: [address, bytecode],
  })
}
