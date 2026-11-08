// [!region setup]
import { Account, Client, gatewayActions } from 'viem/tempo'

export const client = Client.create({
  account: Account.fromSecp256k1('0x...'),
}).extend(gatewayActions())
// [!endregion setup]
