// [!region setup]
import { http } from 'viem'
import { Account, createClient, withFunding } from 'viem/tempo'

export const client = createClient({
  account: Account.fromSecp256k1('0x...'),
  transport: withFunding(http()),
})
// [!endregion setup]
