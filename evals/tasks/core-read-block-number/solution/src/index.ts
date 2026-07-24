import { Actions, type Client } from 'viem'

export async function getLatestBlockNumber(
  client: Client.Client,
): Promise<bigint> {
  return Actions.block.getNumber(client)
}
