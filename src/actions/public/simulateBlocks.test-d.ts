import { expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { createPublicClient, http } from '../../index.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import { simulateBlocks } from './simulateBlocks.js'

const client = anvilMainnet.getClient()

test('action: call properties', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiContractConfig.abi,
            functionName: 'name',
            to: wagmiContractConfig.address,
          },
        ],
      },
    ],
  })

  const call = result[0].calls[0]
  expectTypeOf(call.data).toEqualTypeOf<Hex>()
  expectTypeOf(call.gasUsed).toEqualTypeOf<bigint>()
  expectTypeOf(call.logs).toEqualTypeOf<Log[] | undefined>()
  expectTypeOf(call.maxUsedGas).toEqualTypeOf<bigint | undefined>()
})

test('decorator: call properties', async () => {
  const client = createPublicClient({ transport: http() })

  const result = await client.simulateBlocks({
    blocks: [
      {
        calls: [
          {
            abi: wagmiContractConfig.abi,
            functionName: 'name',
            to: wagmiContractConfig.address,
          },
        ],
      },
    ],
  })

  expectTypeOf(result[0].calls[0].maxUsedGas).toEqualTypeOf<
    bigint | undefined
  >()
})
