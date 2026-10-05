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
  // @ts-expect-error Empty plugins do not advertise multisig.
  plain.transport.multisig
  // @ts-expect-error RPC parameters are preserved.
  request({ method: 'example_echo', params: ['1'] })
  const local = CoreClient_.create({
    transport: withRelay(transport, {
      plugins: [Relay.multisig({ store: Store.memory() })],
    }),
  })
  expectTypeOf(local.transport.multisig).toEqualTypeOf<true>()
  expectTypeOf(
    withRelay(transport, {
      plugins: [Relay.multisig({ store: Store.memory() })],
    }).type,
  ).toEqualTypeOf<'http'>()
  const nested = CoreClient_.create({
    transport: withRelay(withRelay(http(), http('https://relay.example')), {}),
  })
  expectTypeOf(nested.transport.multisig).toEqualTypeOf<true>()
  expectTypeOf(
    withRelay(withRelay(http(), http('https://relay.example')), {}).type,
  ).toEqualTypeOf<'relay'>()
  // @ts-expect-error Sponsorship policy belongs to remote mode.
  withRelay(http(), { plugins: [], policy: 'sign-only' })
})
