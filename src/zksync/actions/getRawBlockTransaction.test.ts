import { expect, test } from 'vitest'
import { getBlockNumber } from '~viem/actions/index.js'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { getRawBlockTransaction } from './getRawBlockTransaction.js'

const client = { ...zkSyncClientLocalNode }

test('default', async () => {
  const blockNumber = await getBlockNumber(client)
  const result = await getRawBlockTransaction(client, {
    number: Number(blockNumber),
  })
  expect(result).to.not.be.undefined
})
