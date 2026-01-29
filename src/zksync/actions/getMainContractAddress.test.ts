import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getMainContractAddress } from './getMainContractAddress.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const address = await getMainContractAddress(client)
  expect(address).toMatchInlineSnapshot(
    `"0x9fab5aec650f1ce6e35ec60a611af0a1345927c8"`,
  )
})
