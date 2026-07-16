// [!region setup]
import { Client, http } from 'viem'
import { optimism } from 'viem/chains'
import { opStackL2Actions } from 'viem/op-stack'

export const client = Client.create({
  chain: optimism,
  transport: http(),
}).extend(opStackL2Actions())

// [!endregion setup]
