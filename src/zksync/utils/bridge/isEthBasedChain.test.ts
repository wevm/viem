import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNodeWithAccount,
} from '../../../../test/src/zksync.js'
import { getIsEthBasedChain } from './isEthBasedChain.js'

const client = { ...zksyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)

test('default', async () => {
  const isEthBased = await getIsEthBasedChain(client)
  expect(isEthBased).toEqual(false)
})
