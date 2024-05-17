import { expectTypeOf, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'

import { createEventFilter } from './createEventFilter.js'

const client = anvilMainnet.getClient()

test('fromBlock/toBlock', async () => {
  const filter = await createEventFilter(client)
  expectTypeOf(filter.fromBlock).toBeUndefined()
  expectTypeOf(filter.toBlock).toBeUndefined()

  const filter_fromBlock = await createEventFilter(client, {
    fromBlock: 69n,
  })
  expectTypeOf(filter_fromBlock.fromBlock).toMatchTypeOf<69n | undefined>()
  expectTypeOf(filter_fromBlock.toBlock).toBeUndefined()

  const filter_toBlock = await createEventFilter(client, {
    toBlock: 69n,
  })
  expectTypeOf(filter_toBlock.toBlock).toMatchTypeOf<69n | undefined>()
  expectTypeOf(filter_toBlock.fromBlock).toBeUndefined()
})
