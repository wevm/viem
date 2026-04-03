const { http, createPublicClient, webSocket } = require('viem')
const { mainnet } = require('viem/chains')

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com'),
})

const webSocketClient = createPublicClient({
  chain: mainnet,
  transport: webSocket('wss://ethereum-rpc.publicnode.com'),
})
;(async () => {
  await client.getBlockNumber()
  await webSocketClient.getBlockNumber()

  process.exit(0)
})()
