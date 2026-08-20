// [!region setup]
import { createClient } from 'viem/tempo'
import { store } from './store.db'

export const client = createClient({
  experimental_multisig: { store },
})
// [!endregion setup]
