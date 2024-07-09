import { expect, test } from 'vitest'
import { zkSyncClientLocalNodeWithAccountL1 } from '~test/src/zksync.js'
import { mockClientPublicActionsL2 } from '~test/src/zksyncPublicActionsL2MockData.js'
import { ethAddressInContracts } from '../../../zksync/constants/address.js'
import { createWithdrawSpecification } from './createWithdrawSpecification.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

test('createWithdrawSpecification', async () => {
  const specification = await createWithdrawSpecification(client, {
    token: ethAddressInContracts,
    amount: 1n,
    from: client.account.address,
  })
  expect(specification).toMatchInlineSnapshot(`
    {
      "amount": 1n,
      "baseTokenAddress": "0x0000000000000000000000000000000000000000",
      "bridgeAddresses": {
        "erc20L1": "0xbe270c78209cfda84310230aaa82e18936310b2e",
        "sharedL1": "0x648afeaf09a3db988ac41b786001235bbdbc7640",
        "sharedL2": "0xfd61c893b903fa133908ce83dfef67c4c2350dd8",
      },
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "isBaseToken": false,
      "isEthBasedChain": false,
      "token": "0x0000000000000000000000000000000000000001",
    }
  `)
})
