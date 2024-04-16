import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getL1BatchNumber } from './getL1BatchNumber.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const number = await getL1BatchNumber(client)
  expect(Number(number)).to.be.greaterThanOrEqual(0)
})
