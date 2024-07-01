import { expect, test } from 'vitest'
import { zkSyncChainL2 } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/clients/transports/http.js'
import { mockClientPublicActionsL2 } from '../../../test/src/zksync.js'
import { getConfirmedTokens } from './getConfirmedTokens.js'

const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
})

mockClientPublicActionsL2(clientL2)

test('default', async () => {
  const confirmedTokens = await getConfirmedTokens(clientL2)

  expect(confirmedTokens).toMatchInlineSnapshot(`
    [
      {
        "decimals": 18,
        "l1Address": "0x0000000000000000000000000000000000000000",
        "l2Address": "0x0000000000000000000000000000000000000000",
        "name": "Ether",
        "symbol": "ETH",
      },
    ]
  `)
})
