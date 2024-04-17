import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { getBlockDetails } from './getBlockDetails.js'

const client = { ...zkSyncClientLocalNode }

test('default', async () => {
  const details = await getBlockDetails(client, { number: 0 })
  expect(details).to.not.be.undefined
})
