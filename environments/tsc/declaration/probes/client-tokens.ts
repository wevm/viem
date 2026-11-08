// Tokens thread through the Client's generics (`tokens` parameter).
import { Client, http, Token } from 'viem'
import { mainnet } from 'viem/chains'

const usdc = Token.from({
  addresses: { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  decimals: 6,
  symbol: 'usdc',
})

export const client = Client.create({
  chain: mainnet,
  tokens: [usdc],
  transport: http(),
})
