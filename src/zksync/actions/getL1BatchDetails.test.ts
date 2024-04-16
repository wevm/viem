import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getL1BatchDetails } from './getL1BatchDetails.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const details = await getL1BatchDetails(client, { number: 0 })
  expect(details).to.not.be.undefined
  expect(details.baseSystemContractsHashes.bootloader).toBeDefined()
  expect(details.baseSystemContractsHashes.default_aa).toBeDefined()
})
