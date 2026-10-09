import { createRequestListener } from '@remix-run/node-fetch-server'
import { KeyAuthorization } from 'ox/tempo'
import { createClient, http, isAddressEqual, zeroAddress } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { fillTransaction, sendTransactionSync } from 'viem/actions'
import { Account, Actions, Relay, Store, withRelay } from 'viem/tempo'
import { beforeAll, describe, expect, onTestFinished, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { createHttpServer } from '~test/utils.js'
import { wait } from '../../../utils/wait.js'
import { parseApproval } from '../../multisig/Signature.js'
import { write } from './keyAuthorization.js'

const root = Tempo.accounts[1]!
const feeToken = Tempo.addresses.alphaUsd
const caller = Tempo.getClient({ chain: Tempo.chain })

const expiry = () => Math.floor(Date.now() / 1000) + 3_600

beforeAll(async () => {
  await Actions.faucet.fundSync(caller, {
    account: root,
    timeout: 60_000,
  })
})

test('default: attaches a signed key authorization to the next transaction', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.keyAuthorization()],
    }),
  })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: expiry(),
  })
  const { transaction } = await fillTransaction(client, {
    account: accessKey,
    feeToken,
    to: zeroAddress,
  })

  expect(transaction.keyAuthorization).toEqual(keyAuthorization)

  const receipt = await sendTransactionSync(client, {
    account: accessKey,
    feeToken,
    to: zeroAddress,
  })
  const metadata = await Actions.accessKey.getMetadata(client, {
    account: root.address,
    accessKey,
  })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  expect(isAddressEqual(metadata.address, accessKey.accessKeyAddress)).toBe(
    true,
  )
  expect(metadata.isRevoked).toMatchInlineSnapshot(`false`)

  const next = await fillTransaction(client, {
    account: accessKey,
    feeToken,
    to: zeroAddress,
  })

  expect(next.transaction.keyAuthorization).toBeUndefined()
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
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), http(server.url), {
      keyAuthorization: true,
    }),
  })
  const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
    access: root,
  })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: expiry(),
  })
  const { transaction } = await fillTransaction(client, {
    account: accessKey,
    feeToken,
    to: zeroAddress,
  })

  expect(transaction.keyAuthorization).toEqual(keyAuthorization)

  const receipt = await sendTransactionSync(client, {
    account: accessKey,
    feeToken,
    to: zeroAddress,
  })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('behavior: relays without the plugin still return signed key authorizations', async () => {
  const relay = Relay.create({ client: caller, plugins: [Relay.feeToken()] })
  const server = await createHttpServer(createRequestListener(relay.fetch))
  onTestFinished(async () => {
    await server.close()
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), http(server.url), {
      keyAuthorization: true,
    }),
  })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })

  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: expiry(),
  })

  expect(
    isAddressEqual(keyAuthorization.address, accessKey.accessKeyAddress),
  ).toBe(true)
})

test('behavior: does not attach to keys authorized onchain', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.keyAuthorization()],
    }),
  })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })

  await Actions.accessKey.authorizeSync(client, {
    account: root,
    accessKey,
    expiry: expiry(),
    feeToken,
  })
  const { transaction } = await fillTransaction(client, {
    account: accessKey,
    feeToken,
    to: zeroAddress,
  })

  expect(transaction.keyAuthorization).toBeUndefined()
})

test('behavior: does not save key authorizations signed by an admin key', async () => {
  const store = Store.memory()
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.keyAuthorization({ store })],
    }),
  })
  const adminKey = Account.fromP256(generatePrivateKey(), { access: root })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })

  await Actions.accessKey.authorizeSync(caller, {
    account: root,
    accessKey: adminKey,
    admin: true,
    feeToken,
  })
  await Actions.accessKey.signAuthorization(client, {
    account: adminKey,
    accessKey,
    expiry: expiry(),
  })

  await expect(
    fillTransaction(client, {
      account: accessKey,
      feeToken,
      to: zeroAddress,
    }),
  ).rejects.toThrow('KeyNotFound')
})

test('behavior: keeps an explicit key authorization', async () => {
  const store = Store.memory()
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.keyAuthorization({ store })],
    }),
  })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })

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
  const { transaction } = await fillTransaction(client, {
    account: accessKey,
    feeToken,
    keyAuthorization,
    to: zeroAddress,
  })

  expect(transaction.keyAuthorization).toEqual(keyAuthorization)
})

test('behavior: drops expired key authorizations', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.keyAuthorization()],
    }),
  })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })

  await Actions.accessKey.signAuthorization(client, {
    account: root,
    accessKey,
    expiry: Math.floor(Date.now() / 1000) + 2,
  })
  await wait(2_000)
  await expect(
    fillTransaction(client, {
      account: accessKey,
      feeToken,
      to: zeroAddress,
    }),
  ).rejects.toThrow('KeyNotFound')
})

test('behavior: drops malformed stored key authorizations', async () => {
  const store = Store.memory()
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.keyAuthorization({ store })],
    }),
  })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
  const key = [
    'keyAuthorization',
    Tempo.chain.id,
    root.address.toLowerCase(),
    accessKey.accessKeyAddress.toLowerCase(),
  ].join(':')

  await store.setItem(key, '0xdeadbeef')

  await expect(
    fillTransaction(client, {
      account: accessKey,
      feeToken,
      to: zeroAddress,
    }),
  ).rejects.toThrow('KeyNotFound')
  expect(await store.getItem(key)).toBeNull()
})

test('behavior: keeps a newer pending key authorization', async () => {
  const store = Store.memory()
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.keyAuthorization({ store })],
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.keyAuthorization({ store })],
    }),
  })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
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
      method: 'relay_setKeyAuthorization',
      params: [KeyAuthorization.toRpc(keyAuthorization)],
    })
  const fill = async () => {
    const { transaction } = await fillTransaction(client, {
      account: accessKey,
      feeToken,
      to: zeroAddress,
    })
    return transaction.keyAuthorization
  }

  await save(newer!)

  await expect(save(older!)).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: A pending key authorization for this access key expires later.]`,
  )
  expect(await save(newer!)).toMatchInlineSnapshot(`null`)
  expect(await fill()).toEqual(newer)

  await save(newest!)

  expect(await fill()).toEqual(newest)
})

test('behavior: does not save key authorizations for active keys', async () => {
  const store = Store.memory()
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.keyAuthorization({ store })],
  })
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
  const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
    account: root,
    accessKey,
    expiry: expiry(),
  })
  await Actions.accessKey.authorizeSync(caller, {
    account: root,
    accessKey,
    expiry: expiry(),
    feeToken,
  })

  expect(
    await relay.request({
      method: 'relay_setKeyAuthorization',
      params: [KeyAuthorization.toRpc(keyAuthorization)],
    }),
  ).toMatchInlineSnapshot(`null`)
  expect(
    await store.getItem(
      [
        'keyAuthorization',
        Tempo.chain.id,
        root.address.toLowerCase(),
        accessKey.accessKeyAddress.toLowerCase(),
      ].join(':'),
    ),
  ).toBeNull()
})

test('behavior: concurrent writes keep the later expiry', async () => {
  const store = Store.memory()
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
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
  expect(
    await store.getItem(
      [
        'keyAuthorization',
        Tempo.chain.id,
        root.address.toLowerCase(),
        accessKey.accessKeyAddress.toLowerCase(),
      ].join(':'),
    ),
  ).toBe(KeyAuthorization.serialize(later!))
})

test('behavior: writes replace malformed values and keep unbounded authorizations', async () => {
  const store = Store.memory()
  const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
  const key = [
    'keyAuthorization',
    Tempo.chain.id,
    root.address.toLowerCase(),
    accessKey.accessKeyAddress.toLowerCase(),
  ].join(':')
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

test('error: requires an atomic store', () => {
  const { compareAndSet: _, ...store } = Store.memory()

  expect(() =>
    Relay.keyAuthorization({ store: store as never }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Key authorization storage requires a store with atomic \`compareAndSet\`.]`,
  )
})

describe('relay_setKeyAuthorization', () => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.keyAuthorization()],
  })

  test('behavior: accepts a serialized key authorization', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      expiry: expiry(),
    })

    expect(
      await relay.request({
        method: 'relay_setKeyAuthorization',
        params: [KeyAuthorization.serialize(keyAuthorization)],
      }),
    ).toMatchInlineSnapshot(`null`)
  })

  test('behavior: accepts a root key authorization bound to its account', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
    const unsigned = KeyAuthorization.from({
      account: root.address,
      address: accessKey.accessKeyAddress,
      chainId: BigInt(Tempo.chain.id),
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
        method: 'relay_setKeyAuthorization',
        params: [KeyAuthorization.toRpc(keyAuthorization)],
      }),
    ).toMatchInlineSnapshot(`null`)
  })

  test('error: rejects an invalid signature', async () => {
    const owner = Account.fromP256(generatePrivateKey())
    const accessKey = Account.fromP256(generatePrivateKey(), { access: owner })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: owner,
      accessKey,
      expiry: expiry(),
    })

    await expect(
      relay.request({
        method: 'relay_setKeyAuthorization',
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
    const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
    const { signature: _, ...keyAuthorization } = KeyAuthorization.toRpc(
      await Actions.accessKey.signAuthorization(caller, {
        account: root,
        accessKey,
        expiry: expiry(),
      }),
    )

    await expect(
      relay.request({
        method: 'relay_setKeyAuthorization',
        params: [keyAuthorization],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Expected a signed key authorization.]`,
    )
  })

  test('error: rejects an expired key authorization', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      expiry: Math.floor(Date.now() / 1000) - 1,
    })

    await expect(
      relay.request({
        method: 'relay_setKeyAuthorization',
        params: [KeyAuthorization.toRpc(keyAuthorization)],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Key authorization has expired.]`,
    )
  })

  test('error: rejects a key authorization for another chain', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      chainId: 1,
      expiry: expiry(),
    })

    await expect(
      relay.request({
        method: 'relay_setKeyAuthorization',
        params: [KeyAuthorization.toRpc(keyAuthorization)],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Conflicting chain ids.]`,
    )
  })

  test('error: rejects a key authorization bound to another account', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      account: root,
      accessKey,
      expiry: expiry(),
    })

    await expect(
      relay.request({
        method: 'relay_setKeyAuthorization',
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
