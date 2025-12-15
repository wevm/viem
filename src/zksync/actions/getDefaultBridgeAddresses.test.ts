import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '~test/zksync.js'
import { getDefaultBridgeAddresses } from './getDefaultBridgeAddresses.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const addresses = await getDefaultBridgeAddresses(client)
  expect(addresses).toMatchInlineSnapshot(`
    {
      "erc20L1": "0xbe270c78209cfda84310230aaa82e18936310b2e",
      "l1NativeTokenVault": "0xeC1D6d4A357bd65226eBa599812ba4fDA5514F47",
      "l1Nullifier": "0xFb2fdA7D9377F98a6cbD7A61C9f69575c8E947b6",
      "sharedL1": "0x648afeaf09a3db988ac41b786001235bbdbc7640",
      "sharedL2": "0xfd61c893b903fa133908ce83dfef67c4c2350dd8",
    }
  `)
})
