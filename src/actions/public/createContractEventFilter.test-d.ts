import { expectTypeOf, test } from 'vitest'
import { usdcContractConfig } from '~test/src/abis.js'
import { publicClient } from '~test/src/utils.js'
import { createContractEventFilter } from './createContractEventFilter.js'

test('fromBlock/toBlock', async () => {
  const filter = await createContractEventFilter(publicClient, {
    abi: usdcContractConfig.abi,
  })
  expectTypeOf(filter.fromBlock).toBeUndefined()
  expectTypeOf(filter.toBlock).toBeUndefined()

  const filter_fromBlock = await createContractEventFilter(publicClient, {
    abi: usdcContractConfig.abi,
    fromBlock: 69n,
  })
  expectTypeOf(filter_fromBlock.fromBlock).toMatchTypeOf<69n | undefined>()
  expectTypeOf(filter_fromBlock.toBlock).toBeUndefined()

  const filter_toBlock = await createContractEventFilter(publicClient, {
    abi: usdcContractConfig.abi,
    toBlock: 69n,
  })
  expectTypeOf(filter_toBlock.toBlock).toMatchTypeOf<69n | undefined>()
  expectTypeOf(filter_toBlock.fromBlock).toBeUndefined()
})
