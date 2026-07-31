import { Client, erc7821Actions, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = Client.create({
  chain: mainnet,
  transport: http(),
}).extend(erc7821Actions())
