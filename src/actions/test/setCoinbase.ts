import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Address, Chain } from '../../types'

export type SetCoinbaseParameters = {
  /** The coinbase address. */
  address: Address
}

export async function setCoinbase<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { address }: SetCoinbaseParameters,
) {
  return await client.request({
    method: `${client.mode}_setCoinbase`,
    params: [address],
  })
}
