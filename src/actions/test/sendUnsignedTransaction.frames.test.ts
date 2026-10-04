import { createTestClient, http, type RpcTransactionRequest } from 'viem'
import { sendUnsignedTransaction } from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts, chain } from '~test/frames/config.js'
import { rpcUrl } from '~test/frames/prool.js'

describe('frames: Frame', () => {
  test('resolves builders in unsigned RPC requests', async () => {
    const requests: RpcTransactionRequest[] = []
    const client = createTestClient({
      chain,
      mode: 'anvil',
      transport: http(rpcUrl, {
        onFetchRequest: async (request) => {
          const body = await request.clone().json()
          if (body.method === 'eth_sendUnsignedTransaction')
            requests.push(body.params[0])
        },
      }),
    })
    // Reth does not implement this test RPC; inspect the real outgoing request.
    await expect(
      sendUnsignedTransaction(client, {
        from: accounts[0].address,
        nonceKeys: [123n, 456n],
        frames: [
          Frame.expiry(1_800_000_000),
          Frame.calls([{ value: 1n }, { value: 2n }]),
        ],
      }),
    ).rejects.toThrow()
    expect(requests[0]?.nonceKeys).toMatchInlineSnapshot(`
      [
        "0x7b",
        "0x1c8",
      ]
    `)
    expect(requests[0]?.frames).toMatchInlineSnapshot(`
      [
        {
          "data": "0x000000006b49d200",
          "flags": "0x0",
          "mode": "0x1",
          "stateGas": "0x0",
          "target": "0x0000000000000000000000000000000000008141",
          "value": "0x0",
        },
        {
          "data": "0x",
          "flags": "0x4",
          "mode": "0x2",
          "value": "0x1",
        },
        {
          "data": "0x",
          "flags": "0x0",
          "mode": "0x2",
          "value": "0x2",
        },
      ]
    `)
  })
})
