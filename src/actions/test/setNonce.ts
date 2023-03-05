import type { TestClient } from '../../clients'
import type { Address } from '../../types'
import { numberToHex } from '../../utils'

export type SetNonceParameters = {
  /** The account address. */
  address: Address
  /** The nonce to set. */
  nonce: number
}

export async function setNonce(
  client: TestClient,
  { address, nonce }: SetNonceParameters,
) {
  return await client.request({
    method: `${client.mode}_setNonce`,
    params: [address, numberToHex(nonce)],
  })
}
