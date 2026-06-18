import * as RpcResponse from 'ox/RpcResponse'
import { describe, expect, test, vi } from 'vitest'

import { wrap } from './request.js'

describe('wrap', () => {
  test('passes through a successful request', async () => {
    const request = wrap(async () => '0x1')
    expect(await request({ method: 'eth_blockNumber' })).toBe('0x1')
  })

  test('retries a retryable error code, then succeeds', async () => {
    let count = 0
    const fn = vi.fn(async () => {
      if (count++ < 2) throw Object.assign(new Error('boom'), { code: -32603 })
      return '0x2'
    })
    const request = wrap(fn, { retryCount: 3, retryDelay: 0 })
    expect(await request({ method: 'eth_call' })).toBe('0x2')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  test('does not retry a non-retryable error code', async () => {
    const fn = vi.fn(async () => {
      throw Object.assign(new Error('bad params'), { code: -32602 })
    })
    const request = wrap(fn, { retryCount: 3, retryDelay: 0 })
    await expect(request({ method: 'eth_call' })).rejects.toThrow('bad params')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('retries a retryable HTTP status, then succeeds', async () => {
    let count = 0
    const fn = vi.fn(async () => {
      if (count++ < 1) throw Object.assign(new Error('busy'), { status: 503 })
      return '0x4'
    })
    const request = wrap(fn, { retryCount: 3, retryDelay: 0 })
    expect(await request({ method: 'eth_call' })).toBe('0x4')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('does not retry a non-retryable HTTP status', async () => {
    const fn = vi.fn(async () => {
      throw Object.assign(new Error('bad request'), { status: 400 })
    })
    const request = wrap(fn, { retryCount: 3, retryDelay: 0 })
    await expect(request({ method: 'eth_call' })).rejects.toThrow('bad request')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('rejects an excluded method', async () => {
    const request = wrap(async () => '0x', {
      methods: { exclude: ['eth_sendTransaction'] },
    })
    await expect(
      request({ method: 'eth_sendTransaction' }),
    ).rejects.toBeInstanceOf(RpcResponse.MethodNotSupportedError)
  })

  test('rejects a method outside the include list', async () => {
    const request = wrap(async () => '0x', {
      methods: { include: ['eth_blockNumber'] },
    })
    await expect(request({ method: 'eth_call' })).rejects.toBeInstanceOf(
      RpcResponse.MethodNotSupportedError,
    )
  })

  test('dedupes concurrent identical requests', async () => {
    const fn = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return '0x3'
    })
    const request = wrap(fn, { dedupe: true, uid: 'request-wrap-test' })
    const [a, b] = await Promise.all([
      request({ method: 'eth_chainId' }),
      request({ method: 'eth_chainId' }),
    ])
    expect(a).toBe('0x3')
    expect(b).toBe('0x3')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
