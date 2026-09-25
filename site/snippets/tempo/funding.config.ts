// [!region setup]
import { http } from 'viem'
import { Account, createClient, withFunding } from 'viem/tempo'
import { store } from './store'

export const client = createClient({
  account: Account.fromSecp256k1('0x...'),
  transport: withFunding(http(), { store }),
  // Or use an RPC relay that handles funding discovery and transaction filling.
  // transport: http('https://your-relay.example'),
})
// [!endregion setup]
