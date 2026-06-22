import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

describe('setLoggingEnabled', () => {
  test('toggles logging', async () => {
    await expect(
      client.setLoggingEnabled({ enabled: false }),
    ).resolves.toBeUndefined()
    await client.setLoggingEnabled({ enabled: true })
  })
})
