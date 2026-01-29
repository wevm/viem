import { expect, test } from 'vitest'
import {
  mockChainId,
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getL1ChainId } from './getL1ChainId.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const chainId = await getL1ChainId(client)
  expect(chainId).to.equal(mockChainId)
})
