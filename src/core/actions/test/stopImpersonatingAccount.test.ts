import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

const address = '0x1a1e021a302c237453d3d45c7b82b19ceeb7e2e6'

describe('stopImpersonatingAccount', () => {
  test('stops impersonating an account', async () => {
    await client.impersonateAccount({ address })
    await expect(
      client.stopImpersonatingAccount({ address }),
    ).resolves.toBeUndefined()
  })
})
