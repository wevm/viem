import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

describe('setMinGasPrice', () => {
  // `setMinGasPrice` errors on EIP-1559 chains (the anvil mainnet fork), so we
  // only assert that the request is issued.
  test('issues the request', async () => {
    await expect(client.setMinGasPrice({ gasPrice: 1n })).rejects.toThrow()
  })
})
