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
  const transactionCount = await Actions.block.getTransactionCount(client, {
    blockNumber: latest.number,
  })
  return { finalized, latest, transactionCount }
}
