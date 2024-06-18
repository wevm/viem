import { afterAll, expect, test, vi } from 'vitest'
import {
  mockIsWithdrawalFinalized,
  zkSyncClientLocalNodeWithAccountL1,
} from '../../../../test/src/zksync.js'
import * as readContract from '../../../actions/public/readContract.js'
import { isWithdrawalFinalized } from './isWithdrawalFinalized.js'

const clientL1 = { ...zkSyncClientLocalNodeWithAccountL1 }

const tokenL1 = true
const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(tokenL1)

afterAll(() => {
  spy.mockRestore()
})
test('default', async () => {
  const result = await isWithdrawalFinalized(clientL1, {} as any)
  expect(result).toBe(true)
})
