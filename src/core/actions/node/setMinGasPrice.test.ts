import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

// `setMinGasPrice` errors on EIP-1559 chains (the anvil mainnet fork), so we
// only assert that the request is issued.
test('issues the request', async () => {
  await expect(client.node.setMinGasPrice({ gasPrice: 1n })).rejects.toThrow()
})
