// [!region setup]
import { http } from 'viem'
import { Account, createClient, withRelay } from 'viem/tempo'

export const client = createClient({
  account: Account.fromSecp256k1('0x...'),
  transport: withRelay(http(), http('/relay')),
})
// [!endregion setup]
