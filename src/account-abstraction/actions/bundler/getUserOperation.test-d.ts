import { expectTypeOf, test } from 'vitest'
import { bundlerMainnet } from '~test/bundler.js'
import type { Hash } from '../../../types/misc.js'
import { getUserOperation } from './getUserOperation.js'

const bundlerClient = bundlerMainnet.getBundlerClient()

test('default', async () => {
  const result = await getUserOperation(bundlerClient, { hash: '0x' })

  expectTypeOf(result.blockHash).toEqualTypeOf<Hash | null>()
  expectTypeOf(result.blockNumber).toEqualTypeOf<bigint | null>()
  expectTypeOf(result.transactionHash).toEqualTypeOf<Hash | null>()
})
