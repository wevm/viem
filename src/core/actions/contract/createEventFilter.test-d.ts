import { Actions, Client, http } from 'viem'
import { expectTypeOf, test } from 'vitest'

import * as generated from '~contracts/generated.js'

const client = Client.create({ transport: http() })

test('fromBlock/toBlock', async () => {
  const filter = await Actions.contract.createEventFilter(client, {
    abi: generated.Events.abi,
  })
  expectTypeOf(filter.fromBlock).toEqualTypeOf<undefined>()
  expectTypeOf(filter.toBlock).toEqualTypeOf<undefined>()

  const filter_fromBlock = await Actions.contract.createEventFilter(client, {
    abi: generated.Events.abi,
    fromBlock: 69n,
  })
  expectTypeOf(filter_fromBlock.fromBlock).toEqualTypeOf<69n | undefined>()
  expectTypeOf(filter_fromBlock.toBlock).toEqualTypeOf<undefined>()

  const filter_toBlock = await Actions.contract.createEventFilter(client, {
    abi: generated.Events.abi,
    toBlock: 69n,
  })
  expectTypeOf(filter_toBlock.toBlock).toEqualTypeOf<69n | undefined>()
  expectTypeOf(filter_toBlock.fromBlock).toEqualTypeOf<undefined>()
})
