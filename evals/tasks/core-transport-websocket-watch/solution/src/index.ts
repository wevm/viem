import { Actions, Client, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: webSocket('ws://anvil:8545'),
})

export async function example(): Promise<bigint[]> {
  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(client)

  try {
    for await (const { blockNumber } of watch) {
      numbers.push(blockNumber)
      if (numbers.length === 3) return numbers
    }
    return numbers
  } finally {
    watch.off()
    const rpcClient = await client.transport.getRpcClient()
    rpcClient.close()
  }
}
