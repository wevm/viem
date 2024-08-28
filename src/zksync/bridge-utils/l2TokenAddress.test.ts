import type { Address } from 'abitype'
import { afterAll, expect, test, vi } from 'vitest'
import {
  mockAddress,
  mockAddresses,
  mockClientPublicActionsL2,
  zkSyncClientLocalNodeWithAccountL1,
} from '../../../test/src/zksync.js'
import * as readContract from '../../actions/public/readContract.js'
import { l2TokenAddress } from './l2TokenAddress.js'

const clientL1 = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(clientL1)

const spy = vi
  .spyOn(readContract, 'readContract')
  .mockResolvedValue(mockAddress)

afterAll(() => {
  spy.mockRestore()
})

test('default', async () => {
  const address = await l2TokenAddress(clientL1, {
    token: mockAddress,
    sharedL2: mockAddresses.l1SharedDefaultBridge as Address,
  })
  expect(address).toEqual(mockAddress)
})
