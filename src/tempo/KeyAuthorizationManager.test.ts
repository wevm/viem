import type { KeyAuthorization } from 'ox/tempo'
import { describe, expect, test } from 'vitest'

import * as KeyAuthorizationManager from './KeyAuthorizationManager.js'

const key = {
  address: '0x0000000000000000000000000000000000000001',
  accessKey: '0x0000000000000000000000000000000000000002',
  chainId: 1337,
} as const satisfies KeyAuthorizationManager.Key

const keyAuthorization = {
  account: '0x0000000000000000000000000000000000000001',
  address: '0x0000000000000000000000000000000000000002',
  chainId: 1337n,
  expiry: 1_800_000_000,
  isAdmin: false,
  signature: {
    signature: {
      r: '0x0000000000000000000000000000000000000000000000000000000000000001',
      s: '0x0000000000000000000000000000000000000000000000000000000000000002',
      yParity: 0,
    },
    type: 'secp256k1',
  },
  type: 'secp256k1',
} as const satisfies KeyAuthorization.Signed

describe('memory', () => {
  test('get returns undefined for missing keys', async () => {
    const manager = KeyAuthorizationManager.memory()
    expect(await manager.get(key)).toBeUndefined()
  })

  test('set + get + remove', async () => {
    const manager = KeyAuthorizationManager.memory()
    await manager.set(key, keyAuthorization)
    expect(await manager.get(key)).toBe(keyAuthorization)

    await manager.remove(key)
    expect(await manager.get(key)).toBeUndefined()
  })

  test('addresses are case-insensitive', async () => {
    const manager = KeyAuthorizationManager.memory()
    await manager.set(
      {
        ...key,
        address: '0x000000000000000000000000000000000000000A',
        accessKey: '0x000000000000000000000000000000000000000B',
      },
      keyAuthorization,
    )
    expect(
      await manager.get({
        ...key,
        address: '0x000000000000000000000000000000000000000a',
        accessKey: '0x000000000000000000000000000000000000000b',
      }),
    ).toBe(keyAuthorization)
  })

  test('entries are isolated by chain id', async () => {
    const manager = KeyAuthorizationManager.memory()
    await manager.set(key, keyAuthorization)
    expect(await manager.get({ ...key, chainId: 1 })).toBeUndefined()
  })

  test('entries are isolated by access key', async () => {
    const manager = KeyAuthorizationManager.memory()
    await manager.set(key, keyAuthorization)
    expect(
      await manager.get({
        ...key,
        accessKey: '0x0000000000000000000000000000000000000003',
      }),
    ).toBeUndefined()
  })
})

describe('from', () => {
  test('delegates to the source', async () => {
    const store = new Map<string, KeyAuthorization.Signed>()
    const manager = KeyAuthorizationManager.from({
      source: {
        get(k) {
          return store.get(k.address)
        },
        remove(k) {
          store.delete(k.address)
        },
        set(k, value) {
          store.set(k.address, value)
        },
      },
    })

    await manager.set(key, keyAuthorization)
    expect(await manager.get(key)).toBe(keyAuthorization)
    await manager.remove(key)
    expect(await manager.get(key)).toBeUndefined()
  })
})
