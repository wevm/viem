// [!region setup]
import { createClient } from 'viem/tempo'

export const client = createClient({
  experimental_multisig: true,
})
// [!endregion setup]
