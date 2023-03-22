import type { TestClient, TestClientMode, Transport } from '../../clients'
import type { Chain } from '../../types'

export type ResetParameters = {
  /** The block number to reset from. */
  blockNumber?: bigint
  /** The JSON RPC URL. */
  jsonRpcUrl?: string
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
