import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

const address = '0x1a1e021a302c237453d3d45c7b82b19ceeb7e2e6'

describe('impersonateAccount', () => {
  test('impersonates an account', async () => {
    await expect(
      client.impersonateAccount({ address }),
    ).resolves.toBeUndefined()
    await client.stopImpersonatingAccount({ address })
  })
})
