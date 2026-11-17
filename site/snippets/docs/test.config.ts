// [!region setup]
import {
  Account,
  Client,
  http,
  publicActions,
  testActions,
  walletActions,
} from 'viem'
import { anvil } from 'viem/chains'

export const client = Client.create({
  account: Account.fromPrivateKey('0x...'),
  chain: anvil,
  transport: http(),
})
  .extend(publicActions())
  .extend(walletActions())
  .extend(testActions())
// [!endregion setup]
