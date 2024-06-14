import { http, createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.drpc.org'),
})

const webSocketClient = createPublicClient({
  chain: mainnet,
  transport: webSocket(
    'wss://eth-mainnet.g.alchemy.com/v2/4iIl6mDHqX3GFrpzmfj2Soirf3MPoAcH',
  ),
})

await client.getBlockNumber()
await webSocketClient.getBlockNumber()

process.exit(0)
