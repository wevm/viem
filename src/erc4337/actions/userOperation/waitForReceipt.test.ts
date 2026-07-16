import { expect, test } from 'vitest'

import { Client, http } from 'viem'
import type { UserOperationReceipt } from 'ox/erc4337'

import { createServer } from '~test/http.js'
import { WaitForUserOperationReceiptTimeoutError } from '../../errors.js'
import { waitForReceipt } from './waitForReceipt.js'

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

test('polls and shares an observer', async () => {
  let result: UserOperationReceipt.Rpc<'0.7'> | null = null
  const server = await createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ result }))
  })
  const client = Client.create({
    pollingInterval: 5,
    transport: http(server.url),
  })
  const timer = setTimeout(() => {
    result = rpcReceipt
  }, 30)

  try {
    const [first, second] = await Promise.all([
      waitForReceipt<'0.7'>(client, { hash, timeout: 1_000 }),
      waitForReceipt<'0.7'>(client, { hash, timeout: 1_000 }),
    ])

    expect({
      sameReceipt: first === second,
      success: first.success,
      userOpHash: first.userOpHash,
    }).toMatchInlineSnapshot(`
      {
        "sameReceipt": true,
        "success": true,
        "userOpHash": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      }
    `)
  } finally {
    clearTimeout(timer)
    await server.close()
  }
})

test('error: retry count, timeout, and observer cleanup', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ result: null }))
  })
  const client = Client.create({
    pollingInterval: 5,
    transport: http(server.url),
  })

  try {
    await expect(
      waitForReceipt(client, {
        hash,
        retryCount: 1,
        timeout: 1_000,
      }),
    ).rejects.toBeInstanceOf(WaitForUserOperationReceiptTimeoutError)

    await expect(
      waitForReceipt(client, {
        hash,
        timeout: 20,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [WaitForUserOperationReceiptTimeoutError: Timed out while waiting for User Operation with hash "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" to be confirmed.

        Version: viem@2.52.1]
      `)
  } finally {
    await server.close()
  }
})

test('error: rejects non-not-found errors', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: { code: -32000, message: 'Bundler unavailable.' },
      }),
    )
  })
  const client = Client.create({
    pollingInterval: 5,
    retryCount: 0,
    transport: http(server.url),
  })

  try {
    await expect(waitForReceipt(client, { hash, timeout: 1_000 })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [RpcResponse.InvalidInputError: Bundler unavailable.]
    `)
  } finally {
    await server.close()
  }
})
