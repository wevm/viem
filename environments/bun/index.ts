import { createPublicClient, http, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com'),
})

const webSocketClient = createPublicClient({
  chain: mainnet,
  transport: webSocket('wss://ethereum-rpc.publicnode.com'),
})

await client.getBlockNumber()
await webSocketClient.getBlockNumber()

process.exit(0)
