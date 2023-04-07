import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Address, Chain, Hex } from '../../types/index.js'

export type SetCodeParameters = {
  /** The account address. */
  address: Address
  /** The bytecode to set */
  bytecode: Hex
}

export async function setCode<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { address, bytecode }: SetCodeParameters,
) {
  return await client.request({
    method: `${client.mode}_setCode`,
    params: [address, bytecode],
  })
}
