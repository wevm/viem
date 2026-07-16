import type { UserOperationReceipt } from 'ox/erc4337'
import { expect, test } from 'vitest'

import { Client, http } from 'viem'

import { bundler } from '~test/bundler.js'
import { createServer } from '~test/http.js'
import { getReceipt } from './getReceipt.js'

const client = Client.create({ transport: http(bundler.rpcUrl.http) })
const hash =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const rpcReceipt = {
  actualGasCost: '0x1',
  actualGasUsed: '0x2',
  entryPoint: '0x0000000071727de22e5e9d8baf0edac6f37da032',
  logs: [],
  nonce: '0x3',
  receipt: {
    blockHash:
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    blockNumber: '0x4',
    contractAddress: null,
    cumulativeGasUsed: '0x5',
    effectiveGasPrice: '0x6',
    from: '0x1111111111111111111111111111111111111111',
    gasUsed: '0x7',
    logs: [],
    logsBloom: '0x00',
    status: '0x1',
    to: '0x2222222222222222222222222222222222222222',
    transactionHash:
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    transactionIndex: '0x8',
    type: '0x2',
  },
  sender: '0x3333333333333333333333333333333333333333',
  success: true,
  userOpHash: hash,
} satisfies UserOperationReceipt.Rpc<'0.7'>

test('formats the receipt', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ result: rpcReceipt }))
  })

  try {
    const receipt = await getReceipt<'0.7'>(
      Client.create({ transport: http(server.url) }),
      { hash },
    )

    expect(receipt).toMatchInlineSnapshot(`
      {
        "actualGasCost": 1n,
        "actualGasUsed": 2n,
        "entryPoint": "0x0000000071727de22e5e9d8baf0edac6f37da032",
        "logs": [],
        "nonce": 3n,
        "receipt": {
          "blobGasPrice": undefined,
          "blobGasUsed": undefined,
          "blockHash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "blockNumber": 4n,
          "contractAddress": null,
          "cumulativeGasUsed": 5n,
          "effectiveGasPrice": 6n,
          "from": "0x1111111111111111111111111111111111111111",
          "gasUsed": 7n,
          "logs": [],
          "logsBloom": "0x00",
          "status": "success",
          "to": "0x2222222222222222222222222222222222222222",
          "transactionHash": "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          "transactionIndex": 8,
          "type": "eip1559",
        },
        "sender": "0x3333333333333333333333333333333333333333",
        "success": true,
        "userOpHash": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      }
    `)
  } finally {
    await server.close()
  }
})

test(
  'error: User Operation receipt not found',
  { timeout: 15_000 },
  async () => {
    await expect(getReceipt(client, { hash })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
    [UserOperationReceiptNotFoundError: User Operation receipt with hash "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" could not be found. The User Operation may not have been processed yet.

    Version: viem@2.52.1]
  `)
  },
)
