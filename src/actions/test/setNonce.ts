import type { TestClient, TestClientMode } from '../../clients'
import type { Address, Chain } from '../../types'
import { numberToHex } from '../../utils'

export type SetNonceParameters = {
  /** The account address. */
  address: Address
  /** The nonce to set. */
  nonce: number
}

export async function setNonce<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, TChain>,
  { address, nonce }: SetNonceParameters,
) {
  return await client.request({
    method: `${client.mode}_setNonce`,
    params: [address, numberToHex(nonce)],
  })
}
