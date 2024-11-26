import { http, createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.drpc.org'),
})

const webSocketClient = createPublicClient({
  chain: mainnet,
  transport: webSocket(
    'wss://eth-mainnet.g.alchemy.com/v2/WV-bLot1hKjjCfpPq603Ro-jViFzwYX8',
  ),
})

await client.getBlockNumber()
await webSocketClient.getBlockNumber()

document.getElementById('app')!.innerText = 'success'
