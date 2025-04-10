import { http, createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'
;(async () => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  })

  const webSocketClient = createPublicClient({
    chain: mainnet,
    transport: webSocket(
      'wss://eth-mainnet.g.alchemy.com/v2/WV-bLot1hKjjCfpPq603Ro-jViFzwYX8',
    ),
  })

  await client.getBlockNumber()
  await webSocketClient.getBlockNumber()

  process.exit(0)
})()
