import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Address, Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetNonceParameters = {
  /** The account address. */
  address: Address
  /** The nonce to set. */
  nonce: number
}

export async function setNonce<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { address, nonce }: SetNonceParameters,
) {
  return await client.request({
    method: `${client.mode}_setNonce`,
    params: [address, numberToHex(nonce)],
  })
}
