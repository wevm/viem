import type { TestClient } from '../../clients'
import type { Address } from '../../types'

export type SetCoinbaseArgs = {
  /** The coinbase address. */
  address: Address
}

export async function setCoinbase(
  client: TestClient,
  { address }: SetCoinbaseArgs,
) {
  return await client.request({
    method: `${client.mode}_setCoinbase`,
    params: [address],
  })
}
