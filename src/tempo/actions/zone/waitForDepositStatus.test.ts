import type { ServerResponse } from 'node:http'
import { Actions, Client, http } from 'viem/tempo'
import { expect, test } from 'vitest'
import { createServer } from '~test/http.js'

function respond(res: ServerResponse, result: unknown) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ id: 1, jsonrpc: '2.0', result }))
}

test('returns a processed deposit status to concurrent callers', async () => {
  const responses = [
    {
      deposits: [],
      processed: false,
      tempoBlockNumber: '0x2a',
      zoneProcessedThrough: '0x29',
    },
    {
      deposits: [],
      processed: true,
      tempoBlockNumber: '0x2a',
      zoneProcessedThrough: '0x2b',
    },
  ]
  const server = await createServer((_req, res) => {
    respond(
      res,
      responses.shift() ?? {
        deposits: [],
        processed: true,
        tempoBlockNumber: '0x63',
        zoneProcessedThrough: '0x63',
      },
    )
  })

  try {
    const client = Client.create({
      chain: undefined,
      pollingInterval: 10,
      transport: http(server.url),
    })
    const [status, concurrentStatus] = await Promise.all([
      Actions.zone.waitForDepositStatus(client, {
        tempoBlockNumber: 42n,
        timeout: 0,
      }),
      Actions.zone.waitForDepositStatus(client, {
        tempoBlockNumber: 42n,
        timeout: 1_000,
      }),
    ])

    expect(status).toMatchInlineSnapshot(`
      {
        "deposits": [],
        "processed": true,
        "tempoBlockNumber": 42n,
        "zoneProcessedThrough": 43n,
      }
    `)
    expect(concurrentStatus).toEqual(status)
  } finally {
    await server.close()
  }
})

test('throws when the timeout elapses', async () => {
  const server = await createServer((_req, res) => {
    respond(res, {
      deposits: [],
      processed: false,
      tempoBlockNumber: '0x2a',
      zoneProcessedThrough: '0x29',
    })
  })

  try {
    const client = Client.create({
      chain: undefined,
      pollingInterval: 10,
      transport: http(server.url),
    })
    const pending = Actions.zone.waitForDepositStatus(client, {
      tempoBlockNumber: 42n,
      timeout: 25,
    })
    await expect(pending).rejects.toThrow(
      Actions.zone.Errors.WaitForDepositStatusTimeoutError,
    )
    await expect(pending).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Actions.zone.waitForDepositStatus.TimeoutError: Timed out while waiting for deposits from Tempo block "42" to be processed.

      Version: viem@2.52.1]
    `)
  } finally {
    await server.close()
  }
})

test('propagates zone RPC errors', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(500)
    res.end()
  })

  try {
    const client = Client.create({
      chain: undefined,
      pollingInterval: 10,
      transport: http(server.url, { retryCount: 0 }),
    })
    await expect(
      Actions.zone.waitForDepositStatus(client, {
        tempoBlockNumber: 42n,
      }),
    ).rejects.toThrow('HTTP request failed')
  } finally {
    await server.close()
  }
})
