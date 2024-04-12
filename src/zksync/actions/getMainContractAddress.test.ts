import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getMainContractAddress } from './getMainContractAddress.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const address = await getMainContractAddress(client)
  expect(address).to.equal('0x9fab5aec650f1ce6e35ec60a611af0a1345927c8')
})
