import { afterAll, expect, test, vi } from 'vitest'
import {
  mockAddress,
  mockClientPublicActionsL2,
  zkSyncClientLocalNodeWithAccountL1,
} from '~test/src/zksync.js'
import * as readContract from '../../../actions/public/readContract.js'
import { l1Bridge } from './l1Bridge.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

const spy = vi
  .spyOn(readContract, 'readContract')
  .mockResolvedValue(mockAddress)

afterAll(() => {
  spy.mockRestore()
})

test('getBaseCostFromFeeData', async () => {
  const address = await l1Bridge(client, { l2BridgeAddress: mockAddress })
  expect(address).equal(mockAddress)
})
