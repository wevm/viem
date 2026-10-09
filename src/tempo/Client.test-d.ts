import { createClient, http, Relay, Store, withRelay } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('account coordination is configured through the transport', () => {
  const client = createClient({
    transport: withRelay(http(), {
      plugins: [Relay.accounts({ store: Store.memory() })],
    }),
  })
  expectTypeOf(client.transport.accounts).toEqualTypeOf<true>()
  // @ts-expect-error Account coordination is configured with withRelay.
  createClient({ experimental_accounts: true })
})
