import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getTestnetPaymasterAddress } from './getTestnetPaymasterAddress.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const address = await getTestnetPaymasterAddress(client)
  expect(address).to.equal('0x59067204f2789ffcb6eadb6be6c7cbb7be9fdc7c')
})
