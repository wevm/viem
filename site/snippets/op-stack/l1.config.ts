// [!region setup]
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { opStackL1Actions } from 'viem/op-stack'

export const client = Client.create({
  chain: mainnet,
  transport: http(),
}).extend(opStackL1Actions())

// [!endregion setup]
