import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

const address = '0x1a1e021a302c237453d3d45c7b82b19ceeb7e2e6'

test('stops impersonating an account', async () => {
  await client.impersonateAccount({ address })
  await expect(
    client.stopImpersonatingAccount({ address }),
  ).resolves.toBeUndefined()
})
