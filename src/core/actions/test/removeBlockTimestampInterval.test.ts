import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('removeBlockTimestampInterval', () => {
  test('removes the block timestamp interval', async () => {
    await client.setBlockTimestampInterval({ interval: 5 })
    await expect(client.removeBlockTimestampInterval()).resolves.toBeUndefined()
  })
})
