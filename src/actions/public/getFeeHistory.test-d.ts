import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'

import { getFeeHistory } from './getFeeHistory.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const feeHistory = await getFeeHistory(client, {
    blockCount: 4,
    rewardPercentiles: [0, 50, 100],
  })

  expectTypeOf(feeHistory.baseFeePerBlobGas).toEqualTypeOf<
    bigint[] | undefined
  >()
  expectTypeOf(feeHistory.blobGasUsedRatio).toEqualTypeOf<
    number[] | undefined
  >()
})
