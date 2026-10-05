import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'

export const baseClient = Client.create({
  chain: mainnet,
  transport: http(),
})
