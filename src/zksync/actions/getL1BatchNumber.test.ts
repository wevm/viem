import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { getL1BatchNumber } from './getL1BatchNumber.js'

const client = { ...zkSyncClientLocalNode }

test('default', async () => {
  const number = await getL1BatchNumber(client)
  expect(Number(number)).to.be.greaterThanOrEqual(0)
})
