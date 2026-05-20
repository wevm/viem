import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../test/anvil.js'
import * as Account from './Account.js'
import * as Chain from './Chain.js'
import * as Client from './Client.js'
import { custom, http } from './transports/index.js'

const address = '0x0000000000000000000000000000000000000000'

function defineChain(options: Partial<Chain.Chain> = {}) {
  const chain = anvilMainnet.chain
  return Chain.define({
    id: chain.id,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls,
    ...options,
  })
}

function anvilProviderTransport() {
  return custom({
    async request({ method, params }) {
      const response = await fetch(anvilMainnet.rpcUrl.http, {
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method,
          params: params ?? [],
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      })
      const body = await response.json()
      if (body.error) throw new Error(body.error.message)
      return body.result
    },
  })
}

describe('create', () => {
  test('behavior: creates a base client', () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
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
        key: 'http',
        name: 'HTTP JSON-RPC',
        retryCount: 3,
        retryDelay: 150,
        timeout: 10000,
        type: 'http',
        url: anvilMainnet.rpcUrl.http,
      },
      type: 'base',
    })
    expect(client.uid).toMatch(/^0x[0-9a-f]+$/)
  })

  test('behavior: forwards requests through the transport', async () => {
    const client = Client.create({
      transport: anvilProviderTransport(),
    })

    await expect(client.request({ method: 'eth_chainId' })).resolves.toBe(
      '0x7a69',
    )
  })

  test('behavior: normalizes account strings', () => {
    const client = Client.create({
      account: address,
      transport: http(anvilMainnet.rpcUrl.http),
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
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect(client.account).toBe(account)
  })

  test('behavior: resolves chain RPC URLs with the HTTP transport', async () => {
    const chain = defineChain()
    const client = Client.create({
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
      transport: http(),
      type: 'walletClient',
    })

    expect(client.transport.url).toBe(anvilMainnet.rpcUrl.http)
    await expect(client.request({ method: 'eth_chainId' })).resolves.toBe(
      '0x7a69',
    )
  })

  test('behavior: resolves timing defaults from chain block time', () => {
    const client = Client.create({
      chain: defineChain({ blockTime: 1_000 }),
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect(client.cacheTime).toBe(500)
    expect(client.pollingInterval).toBe(500)
  })

  test('behavior: clamps default polling interval to four seconds', () => {
    const client = Client.create({
      chain: defineChain({ blockTime: 20_000 }),
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect(client.cacheTime).toBe(4000)
    expect(client.pollingInterval).toBe(4000)
  })

  test('behavior: uses explicit cache and polling options', () => {
    const client = Client.create({
      cacheTime: 123,
      pollingInterval: 456,
      transport: http(anvilMainnet.rpcUrl.http),
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
      transport: http(anvilMainnet.rpcUrl.http),
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
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect(client.blockTag).toBe('safe')
  })

  test('behavior: defaults block tag to pending for preconfirmation chains', () => {
    const client = Client.create({
      chain: defineChain({ preconfirmationTime: 500 }),
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect(client.blockTag).toBe('pending')
  })

  test('behavior: omits block tag without preconfirmations', () => {
    const client = Client.create({
      chain: defineChain(),
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect('blockTag' in client).toBe(false)
  })
})

describe('extend', () => {
  test('behavior: extends the client with action namespaces', async () => {
    const client = Client.create({
      chain: defineChain(),
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend((client) => ({
      public: {
        getChainId: async () => client.chain.id,
      },
    }))

    await expect(client.public.getChainId()).resolves.toBe(31_337n)
  })

  test('behavior: chains extensions', () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
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
      transport: http(anvilMainnet.rpcUrl.http),
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
