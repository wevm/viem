import * as RpcResponse from 'ox/RpcResponse'
import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { http, HttpError } from './Transport.js'

const url = anvilMainnet.rpcUrl.http

describe('http', () => {
  test('request returns the result', async () => {
    const transport = http(url).setup({})
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('batches concurrent requests', async () => {
    const transport = http(url, { batch: true }).setup({})
    const [chainId, blockNumber] = await Promise.all([
      transport.request({ method: 'eth_chainId' }),
      transport.request({ method: 'eth_blockNumber' }),
    ])
    expect(chainId).toBe('0x1')
    expect(typeof blockNumber).toBe('string')
  })

  test('maps a JSON-RPC error via ox', async () => {
    const transport = http(url, { retryCount: 0 }).setup({})
    await expect(
      transport.request({ method: 'eth_thisDoesNotExist' }),
    ).rejects.toBeInstanceOf(RpcResponse.BaseError)
  })

  test('honors the method filter', async () => {
    const transport = http(url, {
      methods: { exclude: ['eth_accounts'] },
    }).setup({})
    await expect(
      transport.request({ method: 'eth_accounts' }),
    ).rejects.toBeInstanceOf(RpcResponse.MethodNotSupportedError)
  })

  test('throws HttpError when the endpoint is unreachable', async () => {
    const transport = http('http://127.0.0.1:1', { retryCount: 0 }).setup({})
    await expect(
      transport.request({ method: 'eth_chainId' }),
    ).rejects.toBeInstanceOf(HttpError)
  })
})
