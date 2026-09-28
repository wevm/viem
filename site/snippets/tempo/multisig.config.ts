// [!region setup]
import { createClient, http, Relay, withRelay } from 'viem/tempo'
import { store } from './store.db'

export const client = createClient({
  transport: withRelay(http(), {
    plugins: [Relay.multisig({ store })],
  }),
})
// [!endregion setup]
