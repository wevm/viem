import { Client, http, publicActions, Token, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

// Minimal token (no optional metadata): must satisfy `tokens` without
// `exactOptionalPropertyTypes`, unlike Viem's own tsconfig.
const usdc = Token.from({
  addresses: { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  decimals: 6,
  symbol: 'usdc',
})

;(async () => {
  const client = Client.create({
    chain: mainnet,
    tokens: [usdc],
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
