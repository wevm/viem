import { Relay, Store } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('handleRequest exposes the resolved chain', async () => {
  const handle = Relay.handleRequest(
    async (_request, options) => {
      expectTypeOf(options?.chainId).toEqualTypeOf<number | undefined>()
    },
    { plugins: [Relay.accounts({ store: Store.memory() })] },
  )

  await handle({ method: 'eth_blockNumber' }, { chainId: 4217 })
})

test('accounts passes the lookup to resolveConfig', () => {
  Relay.accounts({
    resolveConfig(options) {
      expectTypeOf(
        options,
      ).toEqualTypeOf<Relay.accounts.resolveConfig.Options>()
      expectTypeOf(options.chainId).toEqualTypeOf<number>()
      return null
    },
    store: Store.memory(),
  })
})
