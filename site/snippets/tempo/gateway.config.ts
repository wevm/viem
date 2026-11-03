// [!region setup]
import { privateKeyToAccount } from 'viem/accounts'
import { createClient, gatewayActions } from 'viem/tempo'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
}).extend(gatewayActions())
// [!endregion setup]
