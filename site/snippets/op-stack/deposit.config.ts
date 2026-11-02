// [!region setup]
import { Account, Client, http, publicActions } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { opStackL1Actions, opStackL2Actions } from 'viem/op-stack'

export const account = Account.fromPrivateKey('0x...')

export const l1Client = Client.create({
  account,
  chain: mainnet,
  transport: http(),
})
  .extend(publicActions())
  .extend(opStackL1Actions())

export const l2Client = Client.create({
  chain: optimism,
  transport: http(),
})
  .extend(publicActions())
  .extend(opStackL2Actions())

// [!endregion setup]
