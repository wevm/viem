// [!region setup]
import { Account, Client, http, publicActions, walletActions } from 'viem'
import { mainnet } from 'viem/chains'

export const client = Client.create({
  account: Account.fromPrivateKey('0x...'),
  chain: mainnet,
  transport: http(),
})
  .extend(publicActions())
  .extend(walletActions())
// [!endregion setup]
