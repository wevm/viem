import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import * as custom from './custom.js'
import * as http from './http.js'

describe('custom', () => {
  test('request delegates to the provider', async () => {
    const provider = http.http(anvilMainnet.rpcUrl.http).setup({})
    const transport = custom.custom(provider).setup({})
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('propagates provider errors', async () => {
    const provider = http
      .http(anvilMainnet.rpcUrl.http, { retryCount: 0 })
      .setup({})
    const transport = custom.custom(provider, { retryCount: 0 }).setup({})
    await expect(
      transport.request({ method: 'eth_thisDoesNotExist' }),
    ).rejects.toThrow()
  })

  test('respects identity and options', async () => {
    const provider = http.http(anvilMainnet.rpcUrl.http).setup({})
    const transport = custom.custom(provider, {
      key: 'my-custom',
      methods: { include: ['eth_chainId'] },
      name: 'My Custom',
      retryCount: 1,
      retryDelay: 10,
    })
    expect(transport.key).toBe('my-custom')
    expect(transport.name).toBe('My Custom')
    expect(await transport.setup({}).request({ method: 'eth_chainId' })).toBe(
      '0x1',
    )
  })
})
