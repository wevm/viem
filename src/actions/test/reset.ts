import type { TestClient } from '../../clients'

export type ResetArgs = {
  /** The block number to reset from. */
  blockNumber?: bigint
  /** The JSON RPC URL. */
  jsonRpcUrl?: string
}

export async function reset(
  client: TestClient,
  { blockNumber, jsonRpcUrl }: ResetArgs = {},
) {
  return await client.request({
    method: `${client.mode}_reset`,
    params: [{ forking: { blockNumber: Number(blockNumber), jsonRpcUrl } }],
  })
}
