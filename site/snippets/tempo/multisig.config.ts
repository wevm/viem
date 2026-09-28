// [!region setup]
import { Client, type Store } from 'viem/tempo'

// Supply an atomic store shared by every coordinating process.
declare const store: Store.Atomic

export const client = Client.create({
  experimental_multisig: { store },
})
// [!endregion setup]
