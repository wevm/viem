import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('setLoggingEnabled', () => {
  test('toggles logging', async () => {
    await expect(
      client.setLoggingEnabled({ enabled: false }),
    ).resolves.toBeUndefined()
    await client.setLoggingEnabled({ enabled: true })
  })
})
