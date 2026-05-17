import { createPublicClient, http, webSocket } from 'viem'
import { mainnet } from 'viem/chains'
;(async () => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http('https://ethereum-rpc.publicnode.com'),
  })

  const webSocketClient = createPublicClient({
    chain: mainnet,
    transport: webSocket('wss://mainnet.gateway.tenderly.co'),
  })

  await client.getBlockNumber()
  await webSocketClient.getBlockNumber()

  process.exit(0)
})()
