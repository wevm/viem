import { createPublicClient, http, webSocket } from 'viem'
import { mainnet } from 'viem/chains'
import { Zone } from 'viem/tempo'

export const zone = Zone.from({
  id: 123,
  name: 'Custom Zone',
  sourceId: 1,
})

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
