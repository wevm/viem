import type { ServerResponse } from 'node:http'
import { Actions, Client, http } from 'viem/tempo'
import { expect, test } from 'vitest'
import { createServer } from '~test/http.js'

function respond(res: ServerResponse, result: unknown) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ id: 1, jsonrpc: '2.0', result }))
}

test('returns zone info to concurrent callers after importing the block', async () => {
  const responses = [
    {
      chainId: '0x1',
      sequencers: ['0x0000000000000000000000000000000000000001'],
      tempoBlockNumber: '0x29',
      zoneId: '0x2',
      zoneTokens: [],
    },
    {
      chainId: '0x1',
      sequencers: ['0x0000000000000000000000000000000000000001'],
      tempoBlockNumber: '0x2a',
      zoneId: '0x2',
      zoneTokens: [],
    },
  ]
  const server = await createServer((_req, res) => {
    respond(
      res,
      responses.shift() ?? {
        chainId: '0x1',
        sequencers: ['0x0000000000000000000000000000000000000001'],
        tempoBlockNumber: '0x63',
        zoneId: '0x2',
        zoneTokens: [],
      },
    )
  })

  try {
    const client = Client.create({
      chain: undefined,
      pollingInterval: 10,
      transport: http(server.url),
    })
    const [info, concurrentInfo] = await Promise.all([
      Actions.zone.waitForTempoBlock(client, {
        tempoBlockNumber: 42n,
        timeout: 0,
      }),
      Actions.zone.waitForTempoBlock(client, {
        tempoBlockNumber: 42n,
        timeout: 1_000,
      }),
    ])

    expect(info).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "sequencers": [
          "0x0000000000000000000000000000000000000001",
        ],
        "tempoBlockNumber": 42n,
        "zoneId": 2,
        "zoneTokens": [],
      }
    `)
    expect(concurrentInfo).toEqual(info)
  } finally {
    await server.close()
  }
})

test('throws when the timeout elapses', async () => {
  const server = await createServer((_req, res) => {
    respond(res, {
      chainId: '0x1',
      sequencers: ['0x0000000000000000000000000000000000000001'],
      tempoBlockNumber: '0x29',
      zoneId: '0x2',
      zoneTokens: [],
    })
  })

  try {
    const client = Client.create({
      chain: undefined,
      pollingInterval: 10,
      transport: http(server.url),
    })
    const pending = Actions.zone.waitForTempoBlock(client, {
      tempoBlockNumber: 42n,
      timeout: 25,
    })
    await expect(pending).rejects.toThrow(
      Actions.zone.Errors.WaitForTempoBlockTimeoutError,
    )
    await expect(pending).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Actions.zone.waitForTempoBlock.TimeoutError: Timed out while waiting for Tempo block "42" to be imported by the zone.

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
      Actions.zone.waitForTempoBlock(client, {
        tempoBlockNumber: 42n,
      }),
    ).rejects.toThrow('HTTP request failed')
  } finally {
    await server.close()
  }
})
