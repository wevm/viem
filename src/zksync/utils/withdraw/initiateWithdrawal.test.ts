import { afterAll, expect, test, vi } from 'vitest'
import {
  mockClientPublicActionsL2,
  mockWithdrawTx,
  zkSyncClientLocalNodeWithAccount,
  zkSyncClientLocalNodeWithAccountL1,
} from '../../../../test/src/zksync.js'
import * as readContract from '../../../actions/public/readContract.js'
import { initiateWithdrawal } from './initiateWithdrawal.js'

const client = { ...zkSyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)

const clientL1 = { ...zkSyncClientLocalNodeWithAccountL1 }

const tokenL1 = '0x53844F9577C2334e541Aec7Df7174ECe5dF1fCf0'
const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(tokenL1)

afterAll(() => {
  spy.mockRestore()
})

test('default', async () => {
  const result = await initiateWithdrawal(clientL1, client, mockWithdrawTx)
  expect(result).toBeDefined()
})
