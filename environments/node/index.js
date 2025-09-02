const { http, createPublicClient, webSocket } = require('viem')
const { mainnet } = require('viem/chains')

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const webSocketClient = createPublicClient({
  chain: mainnet,
  transport: webSocket('wss://eth.drpc.org'),
})
;(async () => {
  await client.getBlockNumber()
  await webSocketClient.getBlockNumber()

  process.exit(0)
})()
