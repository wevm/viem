import { createPublicClient, http, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const webSocketClient = createPublicClient({
  chain: mainnet,
  transport: webSocket('wss://ethereum-rpc.publicnode.com'),
})

await client.getBlockNumber()
await webSocketClient.getBlockNumber()

document.getElementById('app')!.innerText = 'success'
