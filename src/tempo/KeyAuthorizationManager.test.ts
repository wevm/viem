import { generatePrivateKey } from 'viem/accounts'
import { Account, KeyAuthorizationManager, Store } from 'viem/tempo'
import { expect, test } from 'vitest'

const root = Account.fromSecp256k1(generatePrivateKey())
const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
const key = {
  address: root.address,
  accessKey: accessKey.accessKeyAddress,
  chainId: 1,
}

test('default', async () => {
  const store = Store.memory()
  const keyAuthorizationManager = KeyAuthorizationManager.from({ store })
  const keyAuthorization = await root.signKeyAuthorization(accessKey, {
    chainId: 1n,
    expiry: 1_000,
  })

  await keyAuthorizationManager.set(key, keyAuthorization)

  expect(await keyAuthorizationManager.get(key)).toEqual(keyAuthorization)
  expect(
    await store.getItem(
      [
        'keyAuthorization',
        1,
        root.address.toLowerCase(),
        accessKey.accessKeyAddress.toLowerCase(),
      ].join(':'),
    ),
  ).toBeTypeOf('string')

  await keyAuthorizationManager.remove(key)

  expect(await keyAuthorizationManager.get(key)).toBeUndefined()
})

test('behavior: ignores malformed stored values', async () => {
  const store = Store.memory()
  const keyAuthorizationManager = KeyAuthorizationManager.from({ store })

  await store.setItem(
    [
      'keyAuthorization',
      1,
      root.address.toLowerCase(),
      accessKey.accessKeyAddress.toLowerCase(),
    ].join(':'),
    '0xdeadbeef',
  )

  expect(await keyAuthorizationManager.get(key)).toBeUndefined()
})

test('behavior: memory', async () => {
  const keyAuthorizationManager = KeyAuthorizationManager.memory()
  const keyAuthorization = await root.signKeyAuthorization(accessKey, {
    chainId: 1n,
  })

  await keyAuthorizationManager.set(key, keyAuthorization)

  expect(await keyAuthorizationManager.get(key)).toEqual(keyAuthorization)
})
