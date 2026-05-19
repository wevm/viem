import { describe, expect, test, vi } from 'vp/test'

import { custom } from './custom.js'
import { fallback } from './fallback.js'

describe('fallback', () => {
  test('behavior: falls through to the next transport', async () => {
    const onResponse = vi.fn()
    const first = custom({
      async request() {
        throw Object.assign(new Error('down'), { code: -32603 })
      },
    })
    const second = custom({
      async request() {
        return '0x1'
      },
    })
    const transport = fallback([first, second])({})
    transport.value?.onResponse(onResponse)

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe('0x1')
    expect(onResponse.mock.calls.map(([value]) => value.status))
      .toMatchInlineSnapshot(`
        [
          "error",
          "success",
        ]
      `)
  })

  test('behavior: stops on non-fallback errors', async () => {
    const first = custom({
      async request() {
        throw Object.assign(new Error('rejected'), { code: 4001 })
      },
    })
    const second = custom({
      async request() {
        return '0x1'
      },
    })
    const transport = fallback([first, second])({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('rejected')
  })

  test('behavior: skips transports that cannot serve the method', async () => {
    const first = custom({
      async request() {
        throw Object.assign(new Error('down'), { code: -32603 })
      },
    })
    const second = custom(
      {
        async request() {
          return '0x1'
        },
      },
      { methods: { include: ['eth_chainId'] } },
    )
    const transport = fallback([first, second])({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('down')
  })

  test('behavior: skips transports that exclude the method', async () => {
    const first = custom({
      async request() {
        throw Object.assign(new Error('down'), { code: -32603 })
      },
    })
    const second = custom(
      {
        async request() {
          return '0x1'
        },
      },
      { methods: { exclude: ['eth_blockNumber'] } },
    )
    const transport = fallback([first, second])({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('down')
  })

  test('behavior: returns undefined for empty fallback transports', async () => {
    const transport = fallback([])({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBeUndefined()
  })

  test('behavior: throws the last fallback error', async () => {
    const transport = fallback([
      custom({
        async request() {
          throw Object.assign(new Error('down'), { code: -32603 })
        },
      }),
    ])({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('down')
  })

  test('behavior: ranks fallback transports', async () => {
    vi.useFakeTimers()
    const first = custom(
      {
        async request() {
          return 'first'
        },
      },
      { key: 'first' },
    )
    const second = custom(
      {
        async request() {
          return 'second'
        },
      },
      { key: 'second' },
    )
    const pings: string[] = []
    const transport = fallback([first, second], {
      rank: {
        interval: 1_000,
        async ping({ transport }) {
          pings.push(transport.config.key)
          if (transport.config.key === 'first') throw new Error('down')
        },
      },
    })({})

    await vi.waitFor(() => expect(pings).toEqual(['first', 'second']))
    await vi.waitFor(async () =>
      expect(await transport.request({ method: 'eth_blockNumber' })).toBe(
        'second',
      ),
    )
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  test('behavior: enables default fallback ranking', async () => {
    vi.useFakeTimers()
    const request = vi.fn(async () => true)
    const transport = fallback([custom({ request })], { rank: true })({})

    await vi.waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        { method: 'net_listening' },
        undefined,
      ),
    )
    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe(true)
    vi.clearAllTimers()
    vi.useRealTimers()
  })
})
