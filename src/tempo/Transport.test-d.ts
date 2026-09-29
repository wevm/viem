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
  // @ts-expect-error Empty plugins do not advertise multisig.
  plain.transport.multisig
  // @ts-expect-error Empty plugins do not advertise funding.
  plain.transport.funding
  // @ts-expect-error RPC parameters are preserved.
  request({ method: 'example_echo', params: ['1'] })
  const local = createClient({
    transport: withRelay(transport, {
      plugins: [Relay.multisig({ store: Store.memory() }), Relay.funding()],
    }),
  })
  expectTypeOf(local.transport.multisig).toEqualTypeOf<true>()
  expectTypeOf(local.transport.funding).toEqualTypeOf<true>()
  expectTypeOf(local.transport.type).toEqualTypeOf<'http'>()
  const nested = createClient({
    transport: withRelay(withRelay(http(), http('https://relay.example')), {}),
  })
  expectTypeOf(nested.transport.multisig).toEqualTypeOf<true>()
  expectTypeOf(nested.transport.type).toEqualTypeOf<'relay'>()
  // @ts-expect-error Sponsorship policy belongs to remote mode.
  withRelay(http(), { plugins: [], policy: 'sign-only' })
})

test('plugin transport metadata is inferred and merged in order', () => {
  const client = createClient({
    transport: withRelay(http(), {
      plugins: [
        { transport: { service: 'first', version: 1 } },
        Relay.funding(),
        { transport: { service: 'second' } },
      ],
    }),
  })
  expectTypeOf(client.transport.service).toEqualTypeOf<'second'>()
  expectTypeOf(client.transport.version).toEqualTypeOf<1>()
  expectTypeOf(client.transport.funding).toEqualTypeOf<true>()
  const plugins = [Relay.funding()]
  const dynamic = createClient({ transport: withRelay(http(), { plugins }) })
  expectTypeOf(dynamic.transport.funding).toEqualTypeOf<true | undefined>()
})

test('plugin metadata overrides attributes from an underlying relay', () => {
  const client = createClient({
    transport: withRelay(withRelay(http(), { plugins: [Relay.funding()] }), {
      plugins: [{ transport: { funding: false } }],
    }),
  })
  expectTypeOf(client.transport.funding).toEqualTypeOf<false>()
})
