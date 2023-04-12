import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import type { Chain } from '../../types/index.js'

export type ResetParameters = {
  /** The block number to reset from. */
  blockNumber?: bigint | undefined
  /** The JSON RPC URL. */
  jsonRpcUrl?: string | undefined
}

export async function reset<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
  { blockNumber, jsonRpcUrl }: ResetParameters = {},
) {
  return await client.request({
    method: `${client.mode}_reset`,
    params: [{ forking: { blockNumber: Number(blockNumber), jsonRpcUrl } }],
  })
}
