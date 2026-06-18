import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import * as Http from '~test/http.js'
import * as http from './http.js'
import * as loadBalance from './loadBalance.js'

const url = anvilMainnet.rpcUrl.http

/** A real JSON-RPC server that returns `result` and counts requests. */
function createCountingServer(result: string) {
  let count = 0
  return Http.createServer((_req, res) => {
    count++
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ result }))
  }).then((server) => Object.assign(server, { count: () => count }))
}

describe('loadBalance', () => {
  test('routes a request to the single transport', async () => {
    const transport = loadBalance.loadBalance([http.http(url)]).setup()
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('round-robins requests across transports', async () => {
    const a = await createCountingServer('0xa')
    const b = await createCountingServer('0xb')
    try {
      const transport = loadBalance
        .loadBalance([http.http(a.url), http.http(b.url)])
        .setup({ chain: undefined })

      const results: unknown[] = []
      for (let i = 0; i < 4; i++)
        results.push(await transport.request({ method: 'eth_chainId' }))

      expect(results).toEqual(['0xa', '0xb', '0xa', '0xb'])
      expect(a.count()).toBe(2)
      expect(b.count()).toBe(2)
    } finally {
      await a.close()
      await b.close()
    }
  })

  test('exposes the inner transport instances', () => {
    const transport = loadBalance
      .loadBalance([http.http(url), http.http(url)])
      .setup()
    expect(transport.transports).toHaveLength(2)
  })

  test('uses default key and name', () => {
    const transport = loadBalance.loadBalance([http.http(url)])
    expect(transport.key).toBe('loadBalance')
    expect(transport.name).toBe('Load Balance')
  })

  test('honors custom key, name, and retry options', () => {
    const transport = loadBalance
      .loadBalance([http.http(url)], {
        key: 'lb',
        name: 'LB',
        retryCount: 5,
        retryDelay: 10,
      })
      .setup()
    expect(transport.retryCount).toBe(5)
    expect(transport.retryDelay).toBe(10)
  })

  test('applies method filtering', async () => {
    const transport = loadBalance
      .loadBalance([http.http(url)], {
        methods: { exclude: ['eth_chainId'] },
        retryCount: 0,
      })
      .setup()
    await expect(
      transport.request({ method: 'eth_chainId' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.MethodNotSupportedError: Method "eth_chainId" is not supported.]`,
    )
  })
})
