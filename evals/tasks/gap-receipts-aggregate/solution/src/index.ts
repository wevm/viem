import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const receipts = await Actions.block.getReceipts(client)
  return receipts.reduce((sum, receipt) => sum + receipt.gasUsed, 0n)
}
