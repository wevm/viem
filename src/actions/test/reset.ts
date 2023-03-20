import type { TestClientArg } from '../../clients'

export type ResetParameters = {
  /** The block number to reset from. */
  blockNumber?: bigint
  /** The JSON RPC URL. */
  jsonRpcUrl?: string
}

export async function reset(
  client: TestClientArg,
  { blockNumber, jsonRpcUrl }: ResetParameters = {},
) {
  return await client.request({
    method: `${client.mode}_reset`,
    params: [{ forking: { blockNumber: Number(blockNumber), jsonRpcUrl } }],
  })
}
