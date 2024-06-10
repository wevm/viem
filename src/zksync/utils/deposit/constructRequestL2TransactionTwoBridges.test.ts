import { afterAll, expect, test, vi } from 'vitest'
import {
  mockRequestTwoBridgesParamters,
  zkSyncClientLocalNodeWithAccountL1,
} from '~test/src/zksync.js'
import { mockClientPublicActionsL2 } from '~test/src/zksyncPublicActionsL2MockData.js'
import * as readContract from '../../../actions/public/readContract.js'
import { requestL2TransactionTwoBridges } from '../../actions/requestL2TransactionTwoBridges.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue('0x123')

afterAll(() => {
  spy.mockRestore()
})

test('constructRequestL2TransactionDirectParameters', async () => {
  const depositSpecification = await requestL2TransactionTwoBridges(
    client,
    mockRequestTwoBridgesParamters,
  )
  expect(depositSpecification).toMatchInlineSnapshot('0x123')
})
