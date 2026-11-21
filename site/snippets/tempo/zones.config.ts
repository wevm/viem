// [!region setup]
import { privateKeyToAccount } from 'viem/accounts'
import { createClient, http, Zone } from 'viem/tempo'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: Zone.a,
  transport: http(),
})
// [!endregion setup]
