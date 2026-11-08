// [!region setup]
import { Account } from 'viem'
import { Client, http, Zone } from 'viem/tempo'

export const client = Client.create({
  account: Account.fromPrivateKey('0x...'),
  chain: Zone.a,
  transport: http(),
})
// [!endregion setup]
