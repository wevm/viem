// [!region remote]
import { http } from 'viem'
import { createClient } from 'viem/tempo'

// See https://viem.sh/tempo/guides/oidc/relay-api for instructions on running a Relay API.
export const client = createClient({
  transport: http('https://relay.example.com/rpc'),
})
// [!endregion remote]

// [!region local]
import { http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createClient, Relay, withRelay } from 'viem/tempo'

export const client = createClient({
  transport: withRelay(http(), {
    plugins: [
      Relay.oidc({
        audiences: ['1234567890-abc.apps.googleusercontent.com'],
        issuers: ['https://accounts.google.com'],
        prover: { apiKey: '...', url: 'https://prover.example.com' },
        publisherId: '0xa3c1274aadd82e4d12c8004c33fb244ca686dad4fcc8957fc5668588c11d9502',
        saltKey: '0x...',
      }),
      Relay.feePayer({ account: privateKeyToAccount('0x...') }),
    ],
  }),
})
// [!endregion local]
