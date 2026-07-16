import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { mainnet } from '../chains/definitions/mainnet.js'
import { optimism } from '../chains/definitions/optimism.js'
import { Account, Client, http } from 'viem'

const url = anvil.mainnet.rpcUrl.http
const { address, privateKey } = constants.accounts[0]

describe('create', () => {
  test('binds request to the transport', async () => {
    const client = Client.create({ transport: http(url) })
    expect(await client.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('applies defaults', () => {
    const client = Client.create({ transport: http(url) })
    expect(client.key).toBe('base')
    expect(client.name).toBe('Base Client')
    expect(client.type).toBe('base')
    expect(typeof client.uid).toBe('string')
    expect(client.account).toBeUndefined()
    expect(client.blockTag).toBeUndefined()
    expect(client.ccipRead && typeof client.ccipRead.request).toBe('function')
  })

  test('honors CCIP Read overrides', () => {
    const request = async () => '0xdeadbeef' as const
    const enabled = Client.create({
      ccipRead: { request },
      transport: http(url),
    })
    const disabled = Client.create({ ccipRead: false, transport: http(url) })

    expect(enabled.ccipRead && enabled.ccipRead.request).toBe(request)
    expect(disabled.ccipRead).toBe(false)
  })

  test('derives pollingInterval and cacheTime from chain blockTime', () => {
    const client = Client.create({
      chain: mainnet,
      transport: http(url),
    })
    // clamp(floor(12_000 / 2), 500, 4_000) === 4_000
    expect(client.pollingInterval).toBe(4_000)
    expect(client.cacheTime).toBe(4_000)
  })

  test('honors pollingInterval and cacheTime overrides', () => {
    const client = Client.create({
      cacheTime: 1_000,
      pollingInterval: 2_000,
      transport: http(url),
    })
    expect(client.pollingInterval).toBe(2_000)
    expect(client.cacheTime).toBe(1_000)
  })

  test('coerces an address account to json-rpc', () => {
    const client = Client.create({
      account: address,
      transport: http(url),
    })
    expect(client.account).toEqual({ address, type: 'json-rpc' })
  })

  test('preserves a local account', () => {
    const account = Account.fromPrivateKey(privateKey)
    const client = Client.create({ account, transport: http(url) })
    expect(client.account).toBe(account)
    expect(client.account?.type).toBe('local')
  })

  test('sets blockTag to pending when the chain preconfirms', () => {
    const client = Client.create({
      chain: { ...mainnet, preconfirmationTime: 1_000 },
      transport: http(url),
    })
    expect(client.blockTag).toBe('pending')
  })

  test('honors an explicit blockTag', () => {
    const client = Client.create({
      blockTag: 'safe',
      transport: http(url),
    })
    expect(client.blockTag).toBe('safe')
  })

  test('exposes the live transport instance', () => {
    const client = Client.create({ transport: http(url) })
    expect(client.transport.url).toBe(url)
    expect(typeof client.transport.request).toBe('function')
  })

  test('generates a unique uid per client', () => {
    const a = Client.create({ transport: http(url) })
    const b = Client.create({ transport: http(url) })
    expect(a.uid).not.toBe(b.uid)
  })
})

describe('createResolver', () => {
  test('resolves and memoizes Clients from a transport map', () => {
    const resolver = Client.createResolver({
      chains: [mainnet, optimism],
      transport: {
        [mainnet.id]: http('https://mainnet.example'),
        [optimism.id]: http('https://optimism.example'),
      },
    })

    const mainnetClient = resolver.getClient({ chainId: mainnet.id })
    const optimismClient = resolver.getClient({ chainId: optimism.id })

    expect({
      mainnet: {
        chainId: mainnetClient.chain.id,
        url: mainnetClient.transport.url,
      },
      optimism: {
        chainId: optimismClient.chain.id,
        url: optimismClient.transport.url,
      },
    }).toMatchInlineSnapshot(`
      {
        "mainnet": {
          "chainId": 1,
          "url": "https://mainnet.example",
        },
        "optimism": {
          "chainId": 10,
          "url": "https://optimism.example",
        },
      }
    `)
    expect(resolver.getClient({ chainId: mainnet.id })).toBe(mainnetClient)
    expect(optimismClient).not.toBe(mainnetClient)
  })

  test('resolves a transport from a callback', () => {
    const resolver = Client.createResolver({
      chains: [mainnet, optimism],
      transport: ({ chainId }) => http(`https://${chainId}.example`),
    })

    const client = resolver.getClient({ chainId: optimism.id })
    expect({
      chainId: client.chain.id,
      url: client.transport.url,
    }).toMatchInlineSnapshot(`
      {
        "chainId": 10,
        "url": "https://10.example",
      }
    `)
    expect(resolver.getClient({ chainId: optimism.id })).toBe(client)
  })

  test('lazily resolves transports', () => {
    const resolver = Client.createResolver({
      chains: [mainnet, optimism],
      transport: ({ chainId }) => {
        if (chainId === optimism.id) throw new Error('unexpected chain')
        return http('https://mainnet.example')
      },
    })

    const client = resolver.getClient({ chainId: mainnet.id })
    expect({
      chainId: client.chain.id,
      url: client.transport.url,
    }).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "url": "https://mainnet.example",
      }
    `)
  })

  test('applies shared Client options', () => {
    const resolver = Client.createResolver({
      account: address,
      chains: [mainnet, optimism],
      key: 'resolved',
      pollingInterval: 1_000,
      transport: {
        [mainnet.id]: http('https://mainnet.example'),
        [optimism.id]: http('https://optimism.example'),
      },
    })

    const mainnetClient = resolver.getClient({ chainId: mainnet.id })
    const optimismClient = resolver.getClient({ chainId: optimism.id })
    expect({
      mainnet: {
        account: mainnetClient.account,
        key: mainnetClient.key,
        pollingInterval: mainnetClient.pollingInterval,
      },
      optimism: {
        account: optimismClient.account,
        key: optimismClient.key,
        pollingInterval: optimismClient.pollingInterval,
      },
    }).toMatchInlineSnapshot(`
      {
        "mainnet": {
          "account": {
            "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "type": "json-rpc",
          },
          "key": "resolved",
          "pollingInterval": 1000,
        },
        "optimism": {
          "account": {
            "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "type": "json-rpc",
          },
          "key": "resolved",
          "pollingInterval": 1000,
        },
      }
    `)
  })

  test('throws when the chain is not configured', () => {
    const resolver = Client.createResolver({
      chains: [mainnet, optimism],
      transport: ({ chainId }) => http(`https://${chainId}.example`),
    })

    expect(() => resolver.getClient({ chainId: 8453 as typeof mainnet.id }))
      .toThrowErrorMatchingInlineSnapshot(`
      [Client.ChainNotConfiguredError: Chain with id 8453 is not configured.

      Version: viem@2.52.1]
    `)
  })

  test('throws when the transport is not configured', () => {
    const transport = {
      [mainnet.id]: http('https://mainnet.example'),
      [optimism.id]: http('https://optimism.example'),
    }
    const resolver = Client.createResolver({
      chains: [mainnet, optimism],
      transport,
    })
    Reflect.deleteProperty(transport, optimism.id)

    expect(() => resolver.getClient({ chainId: optimism.id }))
      .toThrowErrorMatchingInlineSnapshot(`
      [Client.TransportNotConfiguredError: Transport for chain with id 10 is not configured.

      Version: viem@2.52.1]
    `)
  })
})

describe('extend', () => {
  test('merges the returned bag', () => {
    const client = Client.create({ transport: http(url) }).extend(() => ({
      foo: () => 1 as const,
    }))
    expect(client.foo()).toBe(1)
  })

  test('is chainable and rebinds extend', () => {
    const client = Client.create({ transport: http(url) })
      .extend(() => ({ foo: () => 'foo' as const }))
      .extend(() => ({ bar: () => 'bar' as const }))
    expect(client.foo()).toBe('foo')
    expect(client.bar()).toBe('bar')
    expect(typeof client.extend).toBe('function')
  })

  test('cannot clobber base keys', () => {
    const client = Client.create({ transport: http(url) }).extend(
      () => ({ key: 'clobbered' }) as never,
    )
    expect((client as unknown as { key: string }).key).toBe('base')
  })

  test('deep-merges colliding namespaces across extends', () => {
    const client = Client.create({ transport: http(url) })
      .extend(() => ({ ns: { a: () => 'a' as const } }))
      .extend(() => ({ ns: { b: () => 'b' as const } }))
    expect(client.ns.a()).toBe('a')
    expect(client.ns.b()).toBe('b')
  })

  test('later extend wins on leaf collisions within a namespace', () => {
    const client = Client.create({ transport: http(url) })
      .extend(() => ({ ns: { a: () => 'first' as const } }))
      .extend(() => ({ ns: { a: () => 'second' as const } }))
    expect(client.ns.a()).toBe('second')
  })
})
