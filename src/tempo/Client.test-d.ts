import { Client as TempoClient_ } from 'viem/tempo'
import { http, Relay, Store, withRelay } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('account coordination is configured through the transport', () => {
  const client = TempoClient_.create({
    transport: withRelay(http(), {
      plugins: [Relay.accounts({ store: Store.memory() })],
    }),
  })
  expectTypeOf(client.transport.accounts).toEqualTypeOf<true>()
  // @ts-expect-error Account coordination is configured with withRelay.
  TempoClient_.create({ experimental_accounts: true })
})
