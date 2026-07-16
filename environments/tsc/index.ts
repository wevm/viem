import { Client, http, publicActions, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

;(async () => {
  const client = Client.create({
    chain: mainnet,
    transport: http('https://ethereum-rpc.publicnode.com'),
  }).extend(publicActions())

  const webSocketClient = Client.create({
    chain: mainnet,
    transport: webSocket('wss://mainnet.gateway.tenderly.co'),
  }).extend(publicActions())

  await client.block.getNumber()
  await webSocketClient.block.getNumber()

  process.exit(0)
})()
