import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getBridgehubContractAddress } from './getBridgehubContractAddress.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const bridgeHubContractAddress = await getBridgehubContractAddress(client)
  expect(bridgeHubContractAddress).toMatchInlineSnapshot(
    `"0x173999892363ba18c9dc60f8c57152fc914bce89"`,
  )
})
