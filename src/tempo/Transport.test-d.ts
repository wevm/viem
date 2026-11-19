import { createClient, http, rpcSchema } from 'viem'
import { Relay, Store, withRelay } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('local relay preserves transport attributes, capabilities, and RPC schemas', () => {
  const transport = http('https://rpc.example', {
    rpcSchema:
      rpcSchema<
        [{ Method: 'example_echo'; Parameters: [number]; ReturnType: string }]
      >(),
  })
  const wrapped = withRelay(transport, {})
  const request = wrapped({}).request
  const plain = createClient({ transport: wrapped })
  expectTypeOf(plain.transport.type).toEqualTypeOf<'http'>()
  expectTypeOf(plain.transport.url).toEqualTypeOf<string | undefined>()
  expectTypeOf(request({ method: 'example_echo', params: [1] })).toEqualTypeOf<
    Promise<string>
  >()
  // @ts-expect-error Empty plugins do not advertise accounts.
  plain.transport.accounts
  // @ts-expect-error Empty plugins do not advertise key authorization storage.
  plain.transport.keyAuthorization
  // @ts-expect-error RPC parameters are preserved.
  request({ method: 'example_echo', params: ['1'] })
  const local = createClient({
    transport: withRelay(transport, {
      plugins: [Relay.accounts({ store: Store.memory() })],
    }),
  })
  expectTypeOf(local.transport.accounts).toEqualTypeOf<true>()
  expectTypeOf(local.transport.type).toEqualTypeOf<'http'>()
  // @ts-expect-error Accounts alone do not advertise key authorization storage.
  local.transport.keyAuthorization
  const stored = createClient({
    transport: withRelay(transport, {
      plugins: [
        Relay.keyAuthorization(),
        Relay.accounts({ store: Store.memory() }),
      ],
    }),
  })
  expectTypeOf(stored.transport.keyAuthorization).toEqualTypeOf<true>()
  expectTypeOf(stored.transport.accounts).toEqualTypeOf<true>()
  const nested = createClient({
    transport: withRelay(withRelay(http(), http('https://relay.example')), {}),
  })
  expectTypeOf(nested.transport.accounts).toEqualTypeOf<true>()
  // @ts-expect-error Remote relays advertise key authorization storage only when enabled.
  nested.transport.keyAuthorization
  const remote = createClient({
    transport: withRelay(http(), http('https://relay.example'), {
      keyAuthorization: true,
    }),
  })
  expectTypeOf(remote.transport.accounts).toEqualTypeOf<true>()
  expectTypeOf(remote.transport.keyAuthorization).toEqualTypeOf<true>()
  expectTypeOf(remote.transport.type).toEqualTypeOf<'relay'>()
  expectTypeOf(nested.transport.type).toEqualTypeOf<'relay'>()
  // @ts-expect-error Sponsorship policy belongs to remote mode.
  withRelay(http(), { plugins: [], policy: 'sign-only' })
})
