// [!region setup]
import { http } from 'viem'
import { createClient } from 'viem/tempo'

// A Relay API with the `Relay.oidc` and `Relay.feePayer` plugins.
// See https://viem.sh/tempo/guides/oidc/relay-api for instructions on running one.
export const client = createClient({
  transport: http('https://relay.example.com/rpc'),
})
// [!endregion setup]
