const { Client, http, publicActions, webSocket } = require('viem')
const { mainnet } = require('viem/chains')

const client = Client.create({
  chain: mainnet,
  transport: http('https://ethereum-rpc.publicnode.com'),
}).extend(publicActions())

const webSocketClient = Client.create({
  chain: mainnet,
  transport: webSocket('wss://mainnet.gateway.tenderly.co'),
}).extend(publicActions())
;(async () => {
  await client.block.getNumber()
  await webSocketClient.block.getNumber()

  process.exit(0)
})()
