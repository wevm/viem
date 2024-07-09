import { afterAll, expect, test, vi } from 'vitest'
import { zkSyncClientLocalNodeWithAccountL1 } from '~test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockWithdrawSpecification,
} from '~test/src/zksyncPublicActionsL2MockData.js'
import * as readContract from '../../../actions/public/readContract.js'
import { getWithdrawArgs } from './getWithdrawTxArgs.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue('0x123')

afterAll(() => {
  spy.mockRestore()
})

test('getWithdrawTxArgs', async () => {
  const txArgs = await getWithdrawArgs(client, mockWithdrawSpecification)
  expect(txArgs).toMatchInlineSnapshot(`
  {
    "data": "0x51cff8d9000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "to": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "value": 1n,
  }
  `)
})
