import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zkSyncClientLocalNodeWithAccount,
} from '../../../test/src/zksync.js'
import { getIsEthBasedChain } from './isEthBasedChain.js'

const client = { ...zkSyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)

test('default', async () => {
  const isEthBased = await getIsEthBasedChain(client)
  expect(isEthBased).toEqual(false)
})
