import { createPublicClient, http, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const webSocketClient = createPublicClient({
  chain: mainnet,
  transport: webSocket('wss://eth.drpc.org'),
})

await client.getBlockNumber()
await webSocketClient.getBlockNumber()

process.exit(0)
