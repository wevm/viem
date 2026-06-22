import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { mainnet } from '../chains/definitions/mainnet.js'
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
})
