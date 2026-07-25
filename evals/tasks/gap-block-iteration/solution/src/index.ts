import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  pollingInterval: 200,
  transport: http('http://anvil:8545'),
})

export async function example(): Promise<readonly bigint[]> {
  const watch = Actions.block.watch(client)
  const numbers: bigint[] = []
  try {
    for await (const { block } of watch) {
      numbers.push(block.number)
      if (numbers.length === 3) break
    }
  } finally {
    watch.off()
  }
  return numbers
}
