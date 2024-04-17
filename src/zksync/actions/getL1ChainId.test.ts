import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { getL1ChainId } from './getL1ChainId.js'

const client = { ...zkSyncClientLocalNode }

test('default', async () => {
  const chainId = await getL1ChainId(client)
  expect(chainId).to.equal('0x9')
})
