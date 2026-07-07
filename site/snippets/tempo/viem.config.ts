// [!region setup]
import { Account, Client } from 'viem/tempo'

export const client = Client.create({
  account: Account.fromSecp256k1('0x...'),
})

// [!endregion setup]
