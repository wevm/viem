import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const [latest, finalized] = await Promise.all([
    Actions.block.get(client),
    Actions.block.get(client, { blockTag: 'finalized' }),
  ])
  return {
    finalized,
    latest,
    transactionCount: latest.transactions.length,
  }
}
