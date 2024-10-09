const { http, createPublicClient, webSocket } = require('viem')
const { mainnet } = require('viem/chains')

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
;(async () => {
  await client.getBlockNumber()
  await webSocketClient.getBlockNumber()

  process.exit(0)
})()
