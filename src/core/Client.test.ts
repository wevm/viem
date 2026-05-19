import { describe, expect, test, vi } from 'vp/test'

import * as Account from './Account.js'
import * as Chain from './Chain.js'
import * as Client from './Client.js'
import * as Transport from './Transport.js'

const address = '0x0000000000000000000000000000000000000000'

function defineChain(options: Partial<Chain.Chain> = {}) {
  return Chain.define({
    id: 1n,
    name: 'Test',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: ['https://example.com'] } },
    ...options,
  })
}

function mockTransport(options: { value?: boolean } = {}) {
  return (() =>
    Transport.create(
      {
        key: 'mock',
        name: 'Mock',
        request: vi.fn(async () => '0x1'),
        type: 'mock',
      },
      options.value ? { url: 'https://example.com' } : undefined,
    )) satisfies Transport.Transport
}

describe('create', () => {
  test('behavior: creates a base client', async () => {
    const client = Client.create({
      transport: mockTransport({ value: true }),
    })

    expect(client).toMatchObject({
      account: undefined,
      batch: undefined,
      cacheTime: 4000,
      ccipRead: undefined,
      chain: undefined,
      dataSuffix: undefined,
      key: 'base',
      name: 'Base Client',
      pollingInterval: 4000,
      transport: {
        key: 'mock',
        name: 'Mock',
        retryCount: 3,
        retryDelay: 150,
        timeout: undefined,
        type: 'mock',
        url: 'https://example.com',
      },
      type: 'base',
    })
    expect(client.uid).toMatch(/^0x[0-9a-f]+$/)
    await expect(client.request({ method: 'eth_blockNumber' })).resolves.toBe(
      '0x1',
    )
  })

  test('behavior: normalizes account strings', () => {
    const client = Client.create({
      account: address,
      transport: mockTransport(),
    })

    expect(client.account).toEqual({
      address,
      type: 'json-rpc',
    })
  })

  test('behavior: preserves local accounts', () => {
    const account = Account.fromLocal({
      address,
      async sign() {
        return '0x'
      },
    })
    const client = Client.create({
      account,
      transport: mockTransport(),
    })

    expect(client.account).toBe(account)
  })

  test('behavior: passes scoped options to the transport factory', () => {
    const chain = defineChain()
    const transport = vi.fn(({ account, chain, pollingInterval }) =>
      Transport.create({
        key: 'mock',
        name: 'Mock',
        request: vi.fn(async () => ({ account, chain, pollingInterval })),
        type: 'mock',
      }),
    )

    Client.create({
      account: address,
      batch: { multicall: true },
      blockTag: 'safe',
      cacheTime: 1,
      ccipRead: false,
      chain,
      dataSuffix: '0x1234',
      key: 'wallet',
      name: 'Wallet Client',
      pollingInterval: 2,
      transport,
      type: 'walletClient',
    })

    expect(transport).toHaveBeenCalledExactlyOnceWith({
      account: { address, type: 'json-rpc' },
      chain,
      pollingInterval: 2,
    })
  })

  test('behavior: resolves timing defaults from chain block time', () => {
    const client = Client.create({
      chain: defineChain({ blockTime: 1_000 }),
      transport: mockTransport(),
    })

    expect(client.cacheTime).toBe(500)
    expect(client.pollingInterval).toBe(500)
  })

  test('behavior: clamps default polling interval to four seconds', () => {
    const client = Client.create({
      chain: defineChain({ blockTime: 20_000 }),
      transport: mockTransport(),
    })

    expect(client.cacheTime).toBe(4000)
    expect(client.pollingInterval).toBe(4000)
  })

  test('behavior: uses explicit cache and polling options', () => {
    const client = Client.create({
      cacheTime: 123,
      pollingInterval: 456,
      transport: mockTransport(),
    })

    expect(client.cacheTime).toBe(123)
    expect(client.pollingInterval).toBe(456)
  })

  test('behavior: stores explicit metadata and config', () => {
    const ccipRead = {
      async request() {
        return '0x' as const
      },
    }
    const client = Client.create({
      batch: { multicall: { batchSize: 128, deployless: true, wait: 1 } },
      ccipRead,
      dataSuffix: '0x1234',
      key: 'wallet',
      name: 'Wallet Client',
      transport: mockTransport(),
      type: 'walletClient',
    })

    expect(client.batch).toEqual({
      multicall: { batchSize: 128, deployless: true, wait: 1 },
    })
    expect(client.ccipRead).toBe(ccipRead)
    expect(client.dataSuffix).toBe('0x1234')
    expect(client.key).toBe('wallet')
    expect(client.name).toBe('Wallet Client')
    expect(client.type).toBe('walletClient')
  })

  test('behavior: sets explicit block tag', () => {
    const client = Client.create({
      blockTag: 'safe',
      transport: mockTransport(),
    })

    expect(client.blockTag).toBe('safe')
  })

  test('behavior: defaults block tag to pending for preconfirmation chains', () => {
    const client = Client.create({
      chain: defineChain({ preconfirmationTime: 500 }),
      transport: mockTransport(),
    })

    expect(client.blockTag).toBe('pending')
  })

  test('behavior: omits block tag without preconfirmations', () => {
    const client = Client.create({
      chain: defineChain(),
      transport: mockTransport(),
    })

    expect('blockTag' in client).toBe(false)
  })
})

describe('extend', () => {
  test('behavior: extends the client with action namespaces', async () => {
    const client = Client.create({
      chain: defineChain(),
      transport: mockTransport(),
    }).extend((client) => ({
      public: {
        getChainId: async () => client.chain.id,
      },
    }))

    await expect(client.public.getChainId()).resolves.toBe(1n)
  })

  test('behavior: chains extensions', () => {
    const client = Client.create({
      transport: mockTransport(),
    })
      .extend(() => ({
        public: { getBlockNumber: async () => 1n },
      }))
      .extend((client) => ({
        wallet: { getBlockNumber: client.public.getBlockNumber },
      }))

    expect(client.public.getBlockNumber).toBe(client.wallet.getBlockNumber)
  })

  test('behavior: strips protected base client keys from extensions', () => {
    const client = Client.create({
      transport: mockTransport(),
    }).extend(
      () =>
        ({
          key: 'unsafe',
          public: { ok: true },
        }) as never,
    )

    expect(client.key).toBe('base')
    expect(client.public).toEqual({ ok: true })
  })
})
