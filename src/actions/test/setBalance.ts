import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Address, Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetBalanceParameters = {
  /** The account address. */
  address: Address
  /** Amount (in wei) to set */
  value: bigint
}

export async function setBalance<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { address, value }: SetBalanceParameters,
) {
  return await client.request({
    method: `${client.mode}_setBalance`,
    params: [address, numberToHex(value)],
  })
}
