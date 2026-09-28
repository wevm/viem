import { Client, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

export const client = Client.create({
  chain: mainnet,
  transport: webSocket('wss://mainnet.example'),
})
