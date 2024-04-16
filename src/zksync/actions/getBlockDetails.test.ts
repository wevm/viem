import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getBlockDetails } from './getBlockDetails.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const details = await getBlockDetails(client, { number: 0 })
  expect(details).to.not.be.undefined
})
