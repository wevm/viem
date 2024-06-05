import { afterAll, expect, test, vi } from 'vitest'
import {
  mockRequestDirectParameters,
  zkSyncClientLocalNodeWithAccountL1,
} from '~test/src/zksync.js'
import { mockClientPublicActionsL2 } from '~test/src/zksyncPublicActionsL2MockData.js'
import * as readContract from '../../actions/public/readContract.js'
import { constructRequestL2TransactionDirectParameters } from './constructRequestL2TransactionDirectParameters.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue('0x123')

afterAll(() => {
  spy.mockRestore()
})

test('constructRequestL2TransactionDirectParameters', async () => {
  const depositSpecification =
    await constructRequestL2TransactionDirectParameters(
      client,
      mockRequestDirectParameters,
    )
  console.info(depositSpecification)
  expect(depositSpecification).toMatchInlineSnapshot(`
  {
    "maxFeePerGas": 150000000100n,
    "maxPriorityFeePerGas": 150000000000n,
    "value": 1689594001422817n,
    "to": "0x2773932f30c98edf27a5f0b7089219fd80300d77",
    "data": "0xd52471c10000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000010e000000000000000000000000000000000000000000000000000600ad4244f9e100000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc0490000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000069f701e0000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000014000000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
  }
  `)
})
