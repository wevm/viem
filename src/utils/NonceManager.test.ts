import { describe, expect, test, vi } from 'vp/test'

import * as NonceManager from './NonceManager.js'

const address = '0x0000000000000000000000000000000000000000'
const client = {} as NonceManager.Client

describe('create', () => {
  test('behavior: gets a nonce from the source', async () => {
    const source = {
      get: vi.fn().mockResolvedValue(7),
    } satisfies NonceManager.Source
    const manager = NonceManager.create({ source })

    const nonce = await manager.get({ address, chainId: 1n, client })

    expect({
      calls: source.get.mock.calls.length,
      nonce,
    }).toMatchInlineSnapshot(`
      {
        "calls": 1,
        "nonce": 7,
      }
    `)
  })

  test('behavior: consumes and persists a nonce', async () => {
    const source = {
      get: vi.fn().mockResolvedValue(7),
      set: vi.fn(),
    } satisfies NonceManager.Source
    const manager = NonceManager.create({ source })

    const nonce = await manager.consume({ address, chainId: 1n, client })

    expect({
      nonce,
      set: source.set.mock.calls,
    }).toMatchInlineSnapshot(`
      {
        "nonce": 7,
        "set": [
          [
            {
              "address": "0x0000000000000000000000000000000000000000",
              "chainId": 1n,
            },
            7,
          ],
        ],
      }
    `)
  })

  test('behavior: dedupes parallel reads and tracks deltas', async () => {
    let resolve: ((value: number) => void) | undefined
    const source = {
      get: vi.fn(
        () =>
          new Promise<number>((resolve_) => {
            resolve = resolve_
          }),
      ),
    } satisfies NonceManager.Source
    const manager = NonceManager.create({ source })

    const promise = Promise.all([
      manager.get({ address, chainId: 1n, client }),
      manager.consume({ address, chainId: 1n, client }),
      manager.get({ address, chainId: 1n, client }),
      manager.consume({ address, chainId: 1n, client }),
      manager.get({ address, chainId: 1n, client }),
      manager.consume({ address, chainId: 1n, client }),
      manager.get({ address, chainId: 1n, client }),
    ])

    resolve?.(5)
    const nonces = await promise

    expect({
      calls: source.get.mock.calls.length,
      nonces,
    }).toMatchInlineSnapshot(`
      {
        "calls": 1,
        "nonces": [
          5,
          5,
          6,
          6,
          7,
          7,
          8,
        ],
      }
    `)
  })

  test('behavior: advances stale source nonces after consume', async () => {
    const source = {
      get: vi.fn().mockResolvedValue(5),
    } satisfies NonceManager.Source
    const manager = NonceManager.create({ source })

    const first = await manager.consume({ address, chainId: 1n, client })
    const second = await manager.get({ address, chainId: 1n, client })

    expect({ first, second }).toMatchInlineSnapshot(`
      {
        "first": 5,
        "second": 6,
      }
    `)
  })

  test('behavior: separates addresses and chain ids', async () => {
    const source = {
      get: vi.fn(({ address, chainId }: NonceManager.GetOptions) =>
        address === '0x0000000000000000000000000000000000000000' &&
        chainId === 1n
          ? 5
          : 10,
      ),
    } satisfies NonceManager.Source
    const manager = NonceManager.create({ source })

    const first = await manager.consume({ address, chainId: 1n, client })
    const second = await manager.consume({ address, chainId: 2n, client })

    expect({ first, second }).toMatchInlineSnapshot(`
      {
        "first": 5,
        "second": 10,
      }
    `)
  })

  test('behavior: reset clears local delta state', async () => {
    const source = {
      get: vi.fn().mockResolvedValue(5),
    } satisfies NonceManager.Source
    const manager = NonceManager.create({ source })

    manager.increment({ address, chainId: 1n })
    manager.reset({ address, chainId: 1n })
    const nonce = await manager.get({ address, chainId: 1n, client })

    expect(nonce).toMatchInlineSnapshot(`5`)
  })
})

describe('jsonRpc', () => {
  test('behavior: requests the pending transaction count', async () => {
    const requests: unknown[] = []
    const client = {
      async request(options) {
        requests.push(options)
        return '0xa'
      },
    } satisfies NonceManager.Client
    const source = NonceManager.jsonRpc()

    const nonce = await source.get({ address, chainId: 1n, client })

    expect({ nonce, requests }).toMatchInlineSnapshot(`
      {
        "nonce": 10,
        "requests": [
          {
            "method": "eth_getTransactionCount",
            "params": [
              "0x0000000000000000000000000000000000000000",
              "pending",
            ],
          },
        ],
      }
    `)
  })

  test('behavior: normalizes numberish responses', async () => {
    const source = NonceManager.jsonRpc()
    const numberClient = {
      async request() {
        return 10
      },
    } satisfies NonceManager.Client
    const bigintClient = {
      async request() {
        return 10n
      },
    } satisfies NonceManager.Client

    const number = await source.get({
      address,
      chainId: 1n,
      client: numberClient,
    })
    const bigint = await source.get({
      address,
      chainId: 1n,
      client: bigintClient,
    })

    expect({ bigint, number }).toMatchInlineSnapshot(`
      {
        "bigint": 10,
        "number": 10,
      }
    `)
  })
})
