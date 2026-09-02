import { Multisig, Store } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('handleRequest exposes the resolved chain', async () => {
  const handle = Multisig.handleRequest(
    async (_request, options) => {
      expectTypeOf(options?.chainId).toEqualTypeOf<number | undefined>()
    },
    { store: Store.memory() },
  )

  await handle({ method: 'eth_blockNumber' }, { chainId: 4217 })
})
