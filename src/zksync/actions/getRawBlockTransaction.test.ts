import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getBlockNumber } from '~viem/actions/index.js'
import { getRawBlockTransaction } from './getRawBlockTransaction.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const blockNumber = await getBlockNumber(client)
  const result = await getRawBlockTransaction(client, {
    number: Number(blockNumber),
  })
  expect(result).to.not.be.undefined
})
