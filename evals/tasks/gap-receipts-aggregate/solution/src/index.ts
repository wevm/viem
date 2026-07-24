import { Actions, type Client } from 'viem'

export async function getBlockGasUsed(
  client: Client.Client,
  options: getBlockGasUsed.Options,
): Promise<bigint> {
  const receipts = await Actions.block.getReceipts(client, {
    blockNumber: options.blockNumber,
  })
  return receipts.reduce((sum, receipt) => sum + receipt.gasUsed, 0n)
}

export declare namespace getBlockGasUsed {
  type Options = {
    blockNumber: bigint
  }
}
