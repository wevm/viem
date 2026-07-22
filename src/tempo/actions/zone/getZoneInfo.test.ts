import type { IncomingMessage, ServerResponse } from 'node:http'
import { Client, http } from 'viem/tempo'
import { expect, test } from 'vitest'
import { createServer } from '~test/http.js'

import { getZoneInfo } from './getZoneInfo.js'

async function readRequest(req: IncomingMessage) {
  let body = ''
  req.setEncoding('utf8')
  for await (const chunk of req) body += chunk
  return JSON.parse(body) as {
    id: number
    method: string
    params: readonly unknown[]
  }
}

function respond(res: ServerResponse, id: number, result: unknown) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ id, jsonrpc: '2.0', result }))
}

test('normalizes legacy zone metadata', async () => {
  const server = await createServer(async (req, res) => {
    const request = await readRequest(req)
    if (request.method === 'zone_getZoneInfo')
      return respond(res, request.id, {
        chainId: '0x1922a1a1',
        sequencer: '0x0000000000000000000000000000000000000001',
        zoneId: '0x1',
        zoneTokens: ['0x20c0000000000000000000000000000000000000'],
      })
    if (
      request.method === 'zone_getDepositStatus' &&
      request.params.length === 1 &&
      request.params[0] === '0x0'
    )
      return respond(res, request.id, { zoneProcessedThrough: '0x2a' })
    res.writeHead(400)
    res.end()
  })

  try {
    const client = Client.create({ transport: http(server.url) })
    await expect(getZoneInfo(client)).resolves.toMatchInlineSnapshot(`
      {
        "chainId": 421700001,
        "sequencers": [
          "0x0000000000000000000000000000000000000001",
        ],
        "tempoBlockNumber": 42n,
        "zoneId": 1,
        "zoneTokens": [
          "0x20c0000000000000000000000000000000000000",
        ],
      }
    `)
  } finally {
    await server.close()
  }
})

test('returns current zone metadata', async () => {
  const server = await createServer(async (req, res) => {
    const request = await readRequest(req)
    respond(res, request.id, {
      chainId: '0x2',
      sequencers: [
        '0x0000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000002',
      ],
      tempoBlockNumber: '0x2a',
      zoneId: '0x3',
      zoneTokens: [],
    })
  })

  try {
    const client = Client.create({ transport: http(server.url) })
    await expect(getZoneInfo(client)).resolves.toMatchInlineSnapshot(`
      {
        "chainId": 2,
        "sequencers": [
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000002",
        ],
        "tempoBlockNumber": 42n,
        "zoneId": 3,
        "zoneTokens": [],
      }
    `)
  } finally {
    await server.close()
  }
})
