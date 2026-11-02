import { RpcSchema } from 'ox'
import { Client as CoreClient_ } from 'viem'
import { http } from 'viem'
import { Relay, Store, withRelay } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('local relay preserves transport attributes, capabilities, and RPC schemas', () => {
  const transport = http('https://rpc.example')
  const wrapped = withRelay(transport, {})

  const plain = CoreClient_.create({
    transport: wrapped,
    schema: RpcSchema.from<{
      Request: { method: 'example_echo'; params: [number] }
      ReturnType: string
    }>(),
  })
  const request = plain.request
  expectTypeOf(wrapped.type).toEqualTypeOf<'http'>()
  expectTypeOf(plain.transport.url).toEqualTypeOf<string>()
  expectTypeOf(request({ method: 'example_echo', params: [1] })).toEqualTypeOf<
    Promise<string>
  >()
  // @ts-expect-error Empty plugins do not advertise accounts.
  plain.transport.accounts
  // @ts-expect-error Empty plugins do not advertise key authorization storage.
  plain.transport.keyAuthorization
  // @ts-expect-error RPC parameters are preserved.
  request({ method: 'example_echo', params: ['1'] })
  const local = CoreClient_.create({
    transport: withRelay(transport, {
      plugins: [Relay.accounts({ store: Store.memory() })],
    }),
  })
  expectTypeOf(local.transport.accounts).toEqualTypeOf<true>()
  // @ts-expect-error Accounts alone do not advertise key authorization storage.
  local.transport.keyAuthorization
  const stored = CoreClient_.create({
    transport: withRelay(transport, {
      plugins: [
        Relay.keyAuthorization(),
        Relay.accounts({ store: Store.memory() }),
      ],
    }),
  })
  expectTypeOf(stored.transport.keyAuthorization).toEqualTypeOf<true>()
  expectTypeOf(stored.transport.accounts).toEqualTypeOf<true>()
  expectTypeOf(
    withRelay(transport, {
      plugins: [Relay.accounts({ store: Store.memory() })],
    }).type,
  ).toEqualTypeOf<'http'>()
  const nested = CoreClient_.create({
    transport: withRelay(withRelay(http(), http('https://relay.example')), {}),
  })
  expectTypeOf(nested.transport.accounts).toEqualTypeOf<true>()
  // @ts-expect-error Remote relays advertise key authorization storage only when enabled.
  nested.transport.keyAuthorization
  const remote = CoreClient_.create({
    transport: withRelay(http(), http('https://relay.example'), {
      keyAuthorization: true,
    }),
  })
  expectTypeOf(remote.transport.accounts).toEqualTypeOf<true>()
  expectTypeOf(remote.transport.keyAuthorization).toEqualTypeOf<true>()
  expectTypeOf(
    withRelay(http(), http('https://relay.example'), {
      keyAuthorization: true,
    }).type,
  ).toEqualTypeOf<'relay'>()
  expectTypeOf(
    withRelay(withRelay(http(), http('https://relay.example')), {}).type,
  ).toEqualTypeOf<'relay'>()
  // @ts-expect-error Sponsorship policy belongs to remote mode.
  withRelay(http(), { plugins: [], policy: 'sign-only' })
})
