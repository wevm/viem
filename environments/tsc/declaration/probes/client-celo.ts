import { Client, http, publicActions } from 'viem'
import { celo } from 'viem/chains'

export const client = Client.create({
  chain: celo,
  transport: http(),
}).extend(publicActions())
