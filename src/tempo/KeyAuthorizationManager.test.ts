import { P256, Secp256k1 } from 'ox'
import { KeyAuthorization } from 'ox/tempo'
import { Account, KeyAuthorizationManager, Store } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

const root = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })
const key = {
  address: root.address,
  accessKey: accessKey.accessKeyAddress,
  chainId: 1337,
} as const satisfies KeyAuthorizationManager.Key
const storeKey = [
  'keyAuthorization',
  1337,
  root.address.toLowerCase(),
  accessKey.accessKeyAddress.toLowerCase(),
].join(':')

/** Serializes a key authorization, ignoring address casing normalized by storage. */
const serialize = (
  keyAuthorization: KeyAuthorization.KeyAuthorization | undefined,
) =>
  keyAuthorization && KeyAuthorization.serialize(keyAuthorization).toLowerCase()

const keyAuthorization = await root.signKeyAuthorization(accessKey, {
  chainId: 1337n,
  expiry: 1_800_000_000,
})

describe('memory', () => {
  test('get returns undefined for missing keys', async () => {
    const manager = KeyAuthorizationManager.memory()
    expect(await manager.get(key)).toBeUndefined()
  })

  test('set + get + remove', async () => {
    const manager = KeyAuthorizationManager.memory()
    await manager.set(key, keyAuthorization)
    expect(serialize(await manager.get(key))).toBe(serialize(keyAuthorization))

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
      serialize(
        await manager.get({
          ...key,
          address: '0x000000000000000000000000000000000000000a',
          accessKey: '0x000000000000000000000000000000000000000b',
        }),
      ),
    ).toBe(serialize(keyAuthorization))
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
  test('stores serialized authorizations under relay keys', async () => {
    const store = Store.memory()
    const manager = KeyAuthorizationManager.from({ store })

    await manager.set(key, keyAuthorization)

    expect(serialize(await manager.get(key))).toBe(serialize(keyAuthorization))
    expect(await store.getItem(storeKey)).toBeTypeOf('string')

    await manager.remove(key)

    expect(await manager.get(key)).toBeUndefined()
    expect(await store.getItem(storeKey)).toBeNull()
  })

  test('behavior: ignores malformed stored values', async () => {
    const store = Store.memory()
    const manager = KeyAuthorizationManager.from({ store })

    await store.setItem(storeKey, '0xdeadbeef')

    expect(await manager.get(key)).toBeUndefined()
  })
})
