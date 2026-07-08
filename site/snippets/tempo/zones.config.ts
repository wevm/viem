// [!region setup]
import { Account, Client } from 'viem/tempo'
import { http, zoneModerato } from 'viem/tempo/zones'

export const client = Client.create({
  account: Account.fromSecp256k1('0x...'),
  chain: zoneModerato(7),
  transport: http(),
})
// [!endregion setup]
