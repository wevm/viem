// [!region setup]
import { Client, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'

export const client = Client.create({
  chain: mainnet,
  transport: http(),
}).extend(publicActions())
// [!endregion setup]
