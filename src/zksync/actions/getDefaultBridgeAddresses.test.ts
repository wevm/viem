import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getDefaultBridgeAddresses } from './getDefaultBridgeAddresses.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const addresses = await getDefaultBridgeAddresses(client)
  expect(addresses).toMatchInlineSnapshot(`
    {
      "erc20L1": "0xbe270c78209cfda84310230aaa82e18936310b2e",
      "sharedL1": "0x648afeaf09a3db988ac41b786001235bbdbc7640",
      "sharedL2": "0xfd61c893b903fa133908ce83dfef67c4c2350dd8",
    }
  `)
})
