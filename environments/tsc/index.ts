import { createPublicClient, defineChain, http, webSocket } from 'viem'
import { mainnet, tempo, tempoDevnet, tempoModerato } from 'viem/chains'
import { Zone } from 'viem/tempo'
import { tempoTestnet } from 'viem/tempo/chains'

export const tempoChain = tempoTestnet
export const tempoChains = [tempo, tempoDevnet, tempoModerato, tempoTestnet]
export const customTempoChain = defineChain({
  ...tempoTestnet,
  id: 123,
  name: 'Custom Tempo Chain',
})

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
