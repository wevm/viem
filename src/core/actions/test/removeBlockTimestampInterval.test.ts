import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

describe('removeBlockTimestampInterval', () => {
  test('removes the block timestamp interval', async () => {
    await client.setBlockTimestampInterval({ interval: 5 })
    await expect(client.removeBlockTimestampInterval()).resolves.toBeUndefined()
  })
})
