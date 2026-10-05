import { Client, http, publicActions } from 'viem'
import { zksync } from 'viem/chains'

export const client = Client.create({
  chain: zksync,
  transport: http(),
}).extend(publicActions())
