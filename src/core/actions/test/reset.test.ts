import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, Hex, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('reset', () => {
  test('resets the fork', async () => {
    await client.mine({ blocks: 1 })
    await client.reset({
      blockNumber: BigInt(anvilMainnet.forkBlockNumber ?? 0),
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
    expect(
      Hex.toNumber(await client.request({ method: 'eth_blockNumber' })),
    ).toBe(Number(anvilMainnet.forkBlockNumber))
  })
})
