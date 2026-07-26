import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(client)
  try {
    for await (const { blockNumber } of watch) {
      numbers.push(blockNumber)
      if (numbers.length === 3) return numbers
    }
    throw new Error('Block watcher stopped.')
  } finally {
    watch.off()
  }
}
