import { expect, test } from 'vitest'
import { mockAddress } from '~test/src/zksyncPublicActionsL2MockData.js'
import { getERC20BridgeCalldata } from './getErc20BridgeCalldata.js'

test('getBaseCostFromFeeData', async () => {
  const baseCost = await getERC20BridgeCalldata({
    l1TokenAddress: mockAddress,
    l1Sender: mockAddress,
    l2Receiver: mockAddress,
    amount: 10n,
    bridgeData: '0x',
  })
  expect(baseCost).toMatchInlineSnapshot(`
  "0xcfe7af7c000000000000000000000000173999892363ba18c9dc60f8c57152fc914bce89000000000000000000000000173999892363ba18c9dc60f8c57152fc914bce89000000000000000000000000173999892363ba18c9dc60f8c57152fc914bce89000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000"
  `)
})
