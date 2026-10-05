import { Client, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = Client.create({
  chain: mainnet,
  transport: http(),
}).extend(publicActions())
