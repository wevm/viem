// [!region setup]
import { createClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoActions } from 'viem/tempo'
import { http, zoneModerato } from 'viem/tempo/zones'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: zoneModerato(7),
  transport: http(),
}).extend(tempoActions())
// [!endregion setup]
