import { describe, expect, test, vi } from 'vp/test'

import * as Transport from './Transport.js'

describe('create', () => {
  test('behavior: creates concrete transport instances', async () => {
    const request = vi.fn(async () => '0x1')
    const transport = Transport.create(
      {
        key: 'mock',
        name: 'Mock',
        request,
        type: 'mock',
      },
      { url: 'https://example.com' },
    )

    expect({
      config: transport.config,
      value: transport.value,
    }).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock",
          "request": [MockFunction],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "value": {
          "url": "https://example.com",
        },
      }
    `)
    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe('0x1')
  })

  test('behavior: applies method filters', async () => {
    const request = vi.fn(async () => '0x1')
    const transport = Transport.create({
      key: 'mock',
      methods: { include: ['eth_chainId'] },
      name: 'Mock',
      request,
      type: 'mock',
    })

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.MethodNotSupportedError: Method "eth_blockNumber" is not supported.]`,
    )
    expect(request).toHaveBeenCalledTimes(0)
  })
})

describe('shouldThrow', () => {
  test('behavior: identifies non-fallback errors', () => {
    expect({
      executionReverted: Transport.shouldThrow(
        Object.assign(new Error('execution reverted'), { code: 3 }),
      ),
      internal: Transport.shouldThrow(
        Object.assign(new Error('internal'), { code: -32603 }),
      ),
      plain: Transport.shouldThrow(new Error('plain')),
      caipRejected: Transport.shouldThrow(
        Object.assign(new Error('rejected'), { code: 5000 }),
      ),
      rejected: Transport.shouldThrow(
        Object.assign(new Error('rejected'), { code: 4001 }),
      ),
      transactionRejected: Transport.shouldThrow(
        Object.assign(new Error('rejected'), { code: -32003 }),
      ),
      walletConnect: Transport.shouldThrow(
        Object.assign(new Error('settlement failed'), { code: 7000 }),
      ),
    }).toMatchInlineSnapshot(`
      {
        "caipRejected": true,
        "executionReverted": true,
        "internal": false,
        "plain": false,
        "rejected": true,
        "transactionRejected": true,
        "walletConnect": true,
      }
    `)
  })
})
