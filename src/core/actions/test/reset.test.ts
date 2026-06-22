import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, Hex, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('resets the fork', async () => {
  await client.mine({ blocks: 1 })
  await client.reset({
    blockNumber: BigInt(anvil.mainnet.forkBlockNumber ?? 0),
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  expect(
    Hex.toNumber(await client.request({ method: 'eth_blockNumber' })),
  ).toBe(Number(anvil.mainnet.forkBlockNumber))
})
