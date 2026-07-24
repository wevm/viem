import { Actions, type Client } from 'viem'

export async function getLatestBlock(client: Client.Client) {
  return Actions.block.get(client)
}

export async function getFinalizedBlock(client: Client.Client) {
  return Actions.block.get(client, { blockTag: 'finalized' })
}

export async function countBlockTransactions(
  client: Client.Client,
  options: countBlockTransactions.Options,
): Promise<number> {
  return Actions.block.getTransactionCount(client, {
    blockNumber: options.blockNumber,
  })
}

export declare namespace countBlockTransactions {
  type Options = {
    blockNumber: bigint
  }
}
