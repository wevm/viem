import { describe, expect, test, vi } from 'vp/test'

import { custom } from './custom.js'

describe('custom', () => {
  test('behavior: creates provider transports', async () => {
    const provider = {
      request: vi.fn(async ({ method }) => `${method}:result`),
    }
    const transport = custom(provider, {
      key: 'provider',
      name: 'Provider',
      retryCount: 1,
    })({})

    await expect(transport.request({ method: 'eth_chainId' })).resolves.toBe(
      'eth_chainId:result',
    )
    expect(transport.config).toMatchInlineSnapshot(`
      {
        "key": "provider",
        "methods": undefined,
        "name": "Provider",
        "request": [Function],
        "retryCount": 1,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "custom",
      }
    `)
  })
})
