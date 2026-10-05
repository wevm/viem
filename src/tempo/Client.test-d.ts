import { Client as TempoClient_ } from 'viem/tempo'
import { http, Relay, Store, withRelay } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('multisig coordination is configured through the transport', () => {
  const client = TempoClient_.create({
    transport: withRelay(http(), {
      plugins: [Relay.multisig({ store: Store.memory() })],
    }),
  })
  expectTypeOf(client.transport.multisig).toEqualTypeOf<true>()
  // @ts-expect-error Multisig coordination is configured with withRelay.
  TempoClient_.create({ experimental_multisig: true })
})
