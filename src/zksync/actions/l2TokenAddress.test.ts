import type { Address } from 'abitype'
import { afterAll, expect, test, vi } from 'vitest'
import { mockAddresses } from '~test/src/zksyncPublicActionsL2MockData.js'
import {
  mockAddress,
  mockClientPublicActionsL2,
  zkSyncClientLocalNodeL1,
} from '../../../test/src/zksync.js'
import * as readContract from '../../actions/public/readContract.js'
import { l2TokenAddress } from './l2TokenAddress.js'

const clientL1 = { ...zkSyncClientLocalNodeL1 }

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
