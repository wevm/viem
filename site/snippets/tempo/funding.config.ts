// [!region setup]
import { http } from 'viem'
import { Account, createClient, Relay, withRelay } from 'viem/tempo'
import { store } from './store'

export const client = createClient({
  account: Account.fromSecp256k1('0x...'),
  transport: withRelay(http(), { plugins: [Relay.funding({ store })] }),
})
// [!endregion setup]
