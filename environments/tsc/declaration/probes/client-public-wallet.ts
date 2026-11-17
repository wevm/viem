// Chained extends: the `extended` intersection accumulates across decorators.
import { Account, Client, http, publicActions, walletActions } from 'viem'
import { mainnet } from 'viem/chains'

const account = Account.fromPrivateKey(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

export const client = Client.create({
  account,
  chain: mainnet,
  transport: http(),
})
  .extend(publicActions())
  .extend(walletActions())
