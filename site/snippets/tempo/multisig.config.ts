// [!region setup]
import { Client, http, Relay, type Store, withRelay } from 'viem/tempo'

// Supply an atomic store shared by every coordinating process.
declare const store: Store.Atomic

export const client = Client.create({
  transport: withRelay(http(), { plugins: [Relay.multisig({ store })] }),
})
// [!endregion setup]
