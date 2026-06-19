import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('increaseTime', () => {
  test('jumps time forward', async () => {
    await expect(
      client.increaseTime({ seconds: 86_400 }),
    ).resolves.toBeDefined()
    await client.mine({ blocks: 1 })
  })
})
