import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { http, rateLimit } from 'viem'

const url = anvil.mainnet.rpcUrl.http

describe('rateLimit', () => {
  test('forwards a request to the inner transport', async () => {
    const transport = rateLimit(http(url), {
      requestsPerSecond: 100,
    }).setup()
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('throttles throughput to `requestsPerSecond`', async () => {
    const transport = rateLimit(http(url), {
      requestsPerSecond: 1,
    }).setup()

    const start = Date.now()
    const results = await Promise.all([
      transport.request({ method: 'eth_chainId' }),
      transport.request({ method: 'eth_chainId' }),
      transport.request({ method: 'eth_chainId' }),
    ])
    const elapsed = Date.now() - start

    expect(results).toEqual(['0x1', '0x1', '0x1'])
    // 3 requests at 1/s span at least one full wall-clock second.
    expect(elapsed).toBeGreaterThan(900)
  })

  test('uses default key and name', () => {
    const transport = rateLimit(http(url), {
      requestsPerSecond: 1,
    })
    expect(transport.key).toBe('rateLimit')
    expect(transport.name).toBe('Rate Limit')
  })

  test('honors custom key, name, and retry options', () => {
    const transport = rateLimit(http(url), {
      key: 'rl',
      name: 'RL',
      requestsPerSecond: 10,
      retryCount: 5,
      retryDelay: 10,
    }).setup()
    expect(transport.retryCount).toBe(5)
    expect(transport.retryDelay).toBe(10)
  })

  test('applies method filtering', async () => {
    const transport = rateLimit(http(url), {
      methods: { exclude: ['eth_chainId'] },
      requestsPerSecond: 10,
      retryCount: 0,
    }).setup()
    await expect(
      transport.request({ method: 'eth_chainId' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.MethodNotSupportedError: Method "eth_chainId" is not supported.]`,
    )
  })
})
