// [!region setup]
import { privateKeyToAccount } from 'viem/accounts'
import { createClient } from 'viem/tempo'
import { http, zoneModerato } from 'viem/tempo/zones'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: zoneModerato(7),
  transport: http(),
})
// [!endregion setup]
