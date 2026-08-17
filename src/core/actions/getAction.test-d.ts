import type { Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, type Chain, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({ chain: mainnet, transport: http() })

test('fallback preserves the instantiated action signature', () => {
  const send = Actions.getAction(
    client,
    Actions.transaction.send<typeof mainnet>,
    'transaction.send',
  )
  expectTypeOf(send)
    .parameter(0)
    .toEqualTypeOf<Actions.transaction.send.Options<typeof mainnet>>()
  expectTypeOf(send).returns.toEqualTypeOf<Promise<Hex.Hex>>()
})

test('uninstantiated actions stay generic', () => {
  const send = Actions.getAction(
    client,
    Actions.transaction.send,
    'transaction.send',
  )
  expectTypeOf(send<typeof mainnet>)
    .parameter(0)
    .toEqualTypeOf<Actions.transaction.send.Options<typeof mainnet>>()
  expectTypeOf(send<typeof mainnet>).returns.toEqualTypeOf<Promise<Hex.Hex>>()
})

test('explicit instantiation forwards type arguments', () => {
  function action<chain extends Chain.Chain | undefined>(
    client: Client.Client<chain>,
  ) {
    return Actions.getAction(
      client,
      Actions.transaction.send<chain>,
      'transaction.send',
    )
  }
  expectTypeOf(action(client))
    .parameter(0)
    .toEqualTypeOf<Actions.transaction.send.Options<typeof mainnet>>()
  expectTypeOf(action(client)).returns.toEqualTypeOf<Promise<Hex.Hex>>()
})

test('client-attached override does not widen the resolved signature', () => {
  const extended = client.extend((client) => ({
    transaction: {
      send: (options: Actions.transaction.send.Options<typeof mainnet>) =>
        Actions.transaction.send(client, options),
    },
  }))
  const send = Actions.getAction(
    extended,
    Actions.transaction.send<typeof mainnet>,
    'transaction.send',
  )
  expectTypeOf(send)
    .parameter(0)
    .toEqualTypeOf<Actions.transaction.send.Options<typeof mainnet>>()
  expectTypeOf(send).returns.toEqualTypeOf<Promise<Hex.Hex>>()
})

test('custom fallback infers options and return type', () => {
  const fn = Actions.getAction(
    client,
    (_client, options: { foo: bigint }) => options.foo,
    'foo.bar',
  )
  expectTypeOf(fn).toEqualTypeOf<(options: { foo: bigint }) => bigint>()
})
