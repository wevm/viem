import { afterAll, expect, test, vi } from 'vitest'
import {
  getL2GasLimitMockData,
  zkSyncClientLocalNodeWithAccountL1,
} from '~test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockedGasEstimation,
} from '~test/src/zksyncPublicActionsL2MockData.js'
import * as readContract from '../../actions/public/readContract.js'
import { getL2GasLimit } from './getL2GasLimit.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue('0x123')

afterAll(() => {
  spy.mockRestore()
})

test('getBaseCostFromFeeData', async () => {
  const gasLimit = await getL2GasLimit(client, getL2GasLimitMockData)
  expect(gasLimit).toEqual(mockedGasEstimation)
})
