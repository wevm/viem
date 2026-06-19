import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

describe('setRpcUrl', () => {
  test('sets the backend RPC url', async () => {
    await expect(
      client.setRpcUrl({ jsonRpcUrl: anvilMainnet.forkUrl ?? '' }),
    ).resolves.toBeUndefined()
  })
})
