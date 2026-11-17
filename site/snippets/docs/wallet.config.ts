// [!region setup]
import { Client, custom, publicActions, walletActions } from 'viem'
import 'viem/window'

export const client = Client.create({
  transport: custom(window.ethereum!),
})
  .extend(publicActions())
  .extend(walletActions())
// [!endregion setup]
