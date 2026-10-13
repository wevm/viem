import { createRequestListener } from '@remix-run/node-fetch-server'
import { Address, Hex, P256, Secp256k1 } from 'ox'
import { KeyAuthorization } from 'ox/tempo'
import { Actions as CoreActions, Client as CoreClient } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions,
  Client,
  http,
  Relay,
  Store,
  withRelay,
} from 'viem/tempo'
import { describe, expect, onTestFinished, test } from 'vitest'
import { createServer as createHttpServer } from '~test/http.js'
import * as Tempo from '~test/tempo.js'
import { wait } from '../../../core/internal/wait.js'
import { parseApproval } from '../../accounts/Signature.js'
import { remove, write } from './keyAuthorization.js'

const root = Account.fromSecp256k1(Tempo.accounts[0]!.privateKey)
const feeToken = Tempo.pathUsd
const caller = Tempo.getClient({ account: root, feeToken })
const to = '0x0000000000000000000000000000000000000000'

const expiry = () => Math.floor(Date.now() / 1000) + 3_600

/** Serializes a key authorization, ignoring address casing from node round trips. */
const serialize = (keyAuthorization: KeyAuthorization.Signed) =>
  KeyAuthorization.serialize(keyAuthorization).toLowerCase()

/** Prepares an access key transaction and returns its serialized key authorization. */
async function prepare(
  client: CoreClient.Client<typeof tempoLocalnet>,
  options: {
    accessKey: Account.AccessKeyAccount
    keyAuthorization?: KeyAuthorization.Signed | undefined
  },
) {
  const { accessKey, keyAuthorization } = options
  const { request } = await CoreActions.transaction.prepare(client, {
    account: accessKey,
    feeToken,
    ...(keyAuthorization ? { keyAuthorization } : {}),
    to,
  })
  return request.keyAuthorization && serialize(request.keyAuthorization)
}

function getClient(options: Relay.keyAuthorization.Options = {}) {
  return Tempo.getClient({
    account: root,
    feeToken,
    transport: withRelay(http(Tempo.rpcUrl), {
      plugins: [Relay.keyAuthorization(options)],
    }),
  })
}

function getKey(accessKey: Address.Address) {
  return [
    'keyAuthorization',
    caller.chain.id,
    root.address.toLowerCase(),
    accessKey.toLowerCase(),
  ].join(':')
}

test('default: attaches a signed key authorization to the next transaction', async () => {
  const client = getClient()
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: expiry(),
  })
  expect(await prepare(client, { accessKey })).toBe(serialize(keyAuthorization))

  const receipt = await CoreActions.transaction.sendSync(client, {
    account: accessKey,
    feeToken,
    to,
  })
  const metadata = await Actions.accessKey.getMetadata(client, {
    account: root.address,
    accessKey,
  })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  expect(Address.isEqual(metadata.address, accessKey.accessKeyAddress)).toBe(
    true,
  )
  expect(metadata.isRevoked).toMatchInlineSnapshot(`false`)

  expect(await prepare(client, { accessKey })).toBeUndefined()
})

test('behavior: plain HTTP relay saves and attaches key authorizations', async () => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.keyAuthorization()],
  })
  const server = await createHttpServer(createRequestListener(relay.fetch))
  onTestFinished(async () => {
    await server.close()
  })
  const client = Client.create({
    chain: tempoLocalnet,
    pollingInterval: 100,
    transport: withRelay(http(Tempo.rpcUrl), http(server.url), {
      keyAuthorization: true,
    }),
  })
  const accessKey = Account.fromSecp256k1(Secp256k1.randomPrivateKey(), {
    access: root,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: expiry(),
  })
  expect(await prepare(client, { accessKey })).toBe(serialize(keyAuthorization))

  const receipt = await CoreActions.transaction.sendSync(client, {
    account: accessKey,
    feeToken,
    to,
  })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('behavior: relays without the plugin still return signed key authorizations', async () => {
  const relay = Relay.create({ client: caller, plugins: [Relay.feeToken()] })
  const server = await createHttpServer(createRequestListener(relay.fetch))
  onTestFinished(async () => {
    await server.close()
  })
  const client = Client.create({
    chain: tempoLocalnet,
    pollingInterval: 100,
    transport: withRelay(http(Tempo.rpcUrl), http(server.url), {
      keyAuthorization: true,
    }),
  })
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: expiry(),
  })

  expect(
    Address.isEqual(keyAuthorization.address, accessKey.accessKeyAddress),
  ).toBe(true)
})

test('behavior: does not attach to keys authorized onchain', async () => {
  const client = getClient()
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })

  await Actions.accessKey.authorizeSync(client, {
    account: root,
    accessKey,
    expiry: expiry(),
  })
  expect(await prepare(client, { accessKey })).toBeUndefined()
})

test('behavior: does not save key authorizations signed by an admin key', async () => {
  const store = Store.memory()
  const client = getClient({ store })
  const adminKey = Account.fromP256(P256.randomPrivateKey(), { access: root })
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })

  await Actions.accessKey.authorizeSync(caller, {
    account: root,
    accessKey: adminKey,
    admin: true,
  })
  await Actions.accessKey.signAuthorization(client, {
    account: adminKey,
    accessKey,
    expiry: expiry(),
  })

  expect(await store.getItem(getKey(accessKey.accessKeyAddress))).toBeNull()
})

test('behavior: keeps an explicit key authorization', async () => {
  const client = getClient()
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })

  await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: expiry(),
  })
  const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
    account: root,
    accessKey,
    expiry: expiry() + 1,
  })
  expect(await prepare(client, { accessKey, keyAuthorization })).toBe(
    serialize(keyAuthorization),
  )
})

test('behavior: drops expired key authorizations', async () => {
  const store = Store.memory()
  const client = getClient({ store })
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })

  await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: Math.floor(Date.now() / 1000) + 2,
  })

  expect(await store.getItem(getKey(accessKey.accessKeyAddress))).toBeTypeOf(
    'string',
  )

  await wait(2_000)
  await expect(prepare(client, { accessKey })).rejects.toThrow('KeyNotFound')
  expect(await store.getItem(getKey(accessKey.accessKeyAddress))).toBeNull()
})

test('behavior: drops malformed stored key authorizations', async () => {
  const store = Store.memory()
  const client = getClient({ store })
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })
  const key = getKey(accessKey.accessKeyAddress)

  await store.setItem(key, '0xdeadbeef')

  await expect(prepare(client, { accessKey })).rejects.toThrow('KeyNotFound')
  expect(await store.getItem(key)).toBeNull()
})

test('behavior: keeps a newer pending key authorization', async () => {
  const store = Store.memory()
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.keyAuthorization({ store })],
  })
  const client = getClient({ store })
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })
  const [older, newer, newest] = await Promise.all(
    [1, 2, 3].map((hours) =>
      Actions.accessKey.signAuthorization(caller, {
        account: root,
        accessKey,
        expiry: Math.floor(Date.now() / 1000) + hours * 3_600,
      }),
    ),
  )
  const save = (keyAuthorization: KeyAuthorization.Signed) =>
    relay.request({
      method: 'relay_saveKeyAuthorization',
      params: [KeyAuthorization.toRpc(keyAuthorization)],
    })

  await save(newer!)

  await expect(save(older!)).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: A pending key authorization for this access key expires later.]`,
  )
  expect(await save(newer!)).toMatchInlineSnapshot(`null`)
  expect(await prepare(client, { accessKey })).toBe(serialize(newer!))

  await save(newest!)

  expect(await prepare(client, { accessKey })).toBe(serialize(newest!))
})

test('behavior: does not save key authorizations for active keys', async () => {
  const store = Store.memory()
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.keyAuthorization({ store })],
  })
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })
  const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
    account: root,
    accessKey,
    expiry: expiry(),
  })
  await Actions.accessKey.authorizeSync(caller, {
    account: root,
    accessKey,
    expiry: expiry(),
  })

  expect(
    await relay.request({
      method: 'relay_saveKeyAuthorization',
      params: [KeyAuthorization.toRpc(keyAuthorization)],
    }),
  ).toMatchInlineSnapshot(`null`)
  expect(await store.getItem(getKey(accessKey.accessKeyAddress))).toBeNull()
})

test('behavior: concurrent writes keep the later expiry', async () => {
  const store = Store.memory()
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })
  const [earlier, later] = await Promise.all(
    [1, 2].map((hours) =>
      Actions.accessKey.signAuthorization(caller, {
        account: root,
        accessKey,
        expiry: Math.floor(Date.now() / 1000) + hours * 3_600,
      }),
    ),
  )

  const results = await Promise.all([
    write(store, { account: root.address, keyAuthorization: later! }),
    write(store, { account: root.address, keyAuthorization: earlier! }),
  ])

  expect(results).toMatchInlineSnapshot(`
    [
      true,
      false,
    ]
  `)
  expect(await store.getItem(getKey(accessKey.accessKeyAddress))).toBe(
    KeyAuthorization.serialize(later!),
  )
})

test('behavior: writes replace malformed values and keep unbounded authorizations', async () => {
  const store = Store.memory()
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })
  const key = getKey(accessKey.accessKeyAddress)
  const [admin, expiring] = await Promise.all([
    Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      admin: true,
    }),
    Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      expiry: expiry(),
    }),
  ])
  await store.setItem(key, '0xdeadbeef')

  const results = [
    await write(store, { account: root.address, keyAuthorization: admin }),
    await write(store, { account: root.address, keyAuthorization: expiring }),
  ]

  expect(results).toMatchInlineSnapshot(`
    [
      true,
      false,
    ]
  `)
  expect(await store.getItem(key)).toBe(KeyAuthorization.serialize(admin))
})

test('behavior: replaces a pending key authorization whose witness was burned', async () => {
  const store = Store.memory()
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.keyAuthorization({ store })],
  })
  const client = getClient({ store })
  const accessKey = Account.fromP256(P256.randomPrivateKey(), { access: root })
  const witness = Hex.random(32)
  const [burned, replacement] = await Promise.all([
    Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      witness,
    }),
    Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
    }),
  ])
  const save = (keyAuthorization: KeyAuthorization.Signed) =>
    relay.request({
      method: 'relay_saveKeyAuthorization',
      params: [KeyAuthorization.toRpc(keyAuthorization)],
    })

  await save(burned)
  await Actions.accessKey.burnWitnessSync(caller, { account: root, witness })

  await expect(save(burned)).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Key authorization witness has been burned.]`,
  )
  expect(await save(replacement)).toMatchInlineSnapshot(`null`)
  expect(await prepare(client, { accessKey })).toBe(serialize(replacement))
})

test('behavior: removes only an unchanged stored value', async () => {
  const store = Store.memory()

  await store.setItem('key', 'newer')
  await remove(store, { key: 'key', value: 'older' })

  expect(await store.getItem('key')).toMatchInlineSnapshot(`"newer"`)

  await remove(store, { key: 'key', value: 'newer' })

  expect(await store.getItem('key')).toMatchInlineSnapshot(`null`)
})

test('error: requires an atomic store', () => {
  const { compareAndSet: _, ...store } = Store.memory()

  expect(() =>
    // @ts-expect-error The store lacks `compareAndSet`.
    Relay.keyAuthorization({ store }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Key authorization storage requires a store with atomic \`compareAndSet\`.]`,
  )
})

describe('relay_saveKeyAuthorization', () => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.keyAuthorization()],
  })

  test('behavior: accepts a serialized key authorization', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: root,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      expiry: expiry(),
    })

    expect(
      await relay.request({
        method: 'relay_saveKeyAuthorization',
        params: [KeyAuthorization.serialize(keyAuthorization)],
      }),
    ).toMatchInlineSnapshot(`null`)
  })

  test('behavior: accepts a root key authorization bound to its account', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: root,
    })
    const unsigned = KeyAuthorization.from({
      account: root.address,
      address: accessKey.accessKeyAddress,
      chainId: BigInt(caller.chain.id),
      expiry: expiry(),
      type: 'p256',
    })
    const signature = await root.sign({
      hash: KeyAuthorization.getSignPayload(unsigned),
    })
    const keyAuthorization = KeyAuthorization.from(unsigned, {
      signature: parseApproval(signature),
    })

    expect(
      await relay.request({
        method: 'relay_saveKeyAuthorization',
        params: [KeyAuthorization.toRpc(keyAuthorization)],
      }),
    ).toMatchInlineSnapshot(`null`)
  })

  test('error: rejects an invalid signature', async () => {
    const owner = Account.fromP256(P256.randomPrivateKey())
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: owner,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: owner,
      accessKey,
      expiry: expiry(),
    })

    await expect(
      relay.request({
        method: 'relay_saveKeyAuthorization',
        params: [
          KeyAuthorization.toRpc({
            ...keyAuthorization,
            expiry: keyAuthorization.expiry! + 1,
          }),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Invalid key authorization signature.]`,
    )
  })

  test('error: rejects an unsigned key authorization', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: root,
    })
    const { signature: _, ...keyAuthorization } = KeyAuthorization.toRpc(
      await Actions.accessKey.signAuthorization(caller, {
        account: root,
        accessKey,
        expiry: expiry(),
      }),
    )

    await expect(
      relay.request({
        method: 'relay_saveKeyAuthorization',
        params: [keyAuthorization],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Expected a signed key authorization.]`,
    )
  })

  test('error: rejects an expired key authorization', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: root,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      expiry: Math.floor(Date.now() / 1000) - 1,
    })

    await expect(
      relay.request({
        method: 'relay_saveKeyAuthorization',
        params: [KeyAuthorization.toRpc(keyAuthorization)],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Key authorization has expired.]`,
    )
  })

  test('error: rejects a key authorization for another chain', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: root,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      chainId: 1,
      expiry: expiry(),
    })

    await expect(
      relay.request({
        method: 'relay_saveKeyAuthorization',
        params: [KeyAuthorization.toRpc(keyAuthorization)],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Conflicting chain ids.]`,
    )
  })

  test('error: rejects a key authorization bound to another account', async () => {
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: root,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      expiry: expiry(),
    })

    await expect(
      relay.request({
        method: 'relay_saveKeyAuthorization',
        params: [
          KeyAuthorization.toRpc({
            ...keyAuthorization,
            account: Tempo.accounts[2]!.address,
          }),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Key authorization must be signed by its account.]`,
    )
  })
})
