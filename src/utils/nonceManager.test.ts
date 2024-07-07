import { expect, test } from 'vitest'
import { anvilMainnet, anvilOptimism } from '../../test/src/anvil.js'
import { accounts } from '../../test/src/constants.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import {
  dropTransaction,
  getTransaction,
  sendTransaction,
} from '../actions/index.js'
import { createNonceManager, jsonRpc, nonceManager } from './nonceManager.js'

const mainnetClient = anvilMainnet.getClient({ account: true })
const optimismClient = anvilOptimism.getClient({ account: true })

const mainnetArgs = {
  address: accounts[0].address,
  chainId: mainnetClient.chain.id,
  client: mainnetClient,
} as const
const optimismArgs = {
  address: accounts[0].address,
  chainId: optimismClient.chain.id,
  client: optimismClient,
} as const

test('get next', async () => {
  const nonceManager = createNonceManager({
    source: jsonRpc(),
  })

  expect(await nonceManager.get(mainnetArgs)).toBe(663)
  await sendTransaction(mainnetClient, {
    to: accounts[0].address,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(664)

  expect(await nonceManager.get(optimismArgs)).toBe(66)
  await sendTransaction(optimismClient, {
    to: accounts[0].address,
    value: 0n,
  })
  expect(await nonceManager.get(optimismArgs)).toBe(67)
})

test('consume (sequence)', async () => {
  const nonceManager = createNonceManager({
    source: jsonRpc(),
  })

  const nonce_1 = await nonceManager.consume(mainnetArgs)
  expect(nonce_1).toBe(664)
  const promise_1 = sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_1,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(665)

  const nonce_2 = await nonceManager.consume(mainnetArgs)
  expect(nonce_2).toBe(665)
  const promise_2 = sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_2,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(666)

  const nonce_3 = await nonceManager.consume(mainnetArgs)
  expect(nonce_3).toBe(666)
  const promise_3 = sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_3,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(667)

  const [hash_1, hash_2, hash_3] = await Promise.all([
    promise_1,
    promise_2,
    promise_3,
  ])

  expect(
    (await getTransaction(mainnetClient, { hash: hash_1 })).nonce,
  ).toMatchObject(664)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_2 })).nonce,
  ).toMatchObject(665)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_3 })).nonce,
  ).toMatchObject(666)
  expect(await nonceManager.get(mainnetArgs)).toBe(667)

  const nonce_4 = await nonceManager.consume(mainnetArgs)
  expect(nonce_4).toBe(667)
  const hash_4 = await sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_4,
    value: 0n,
  })
  expect(
    (await getTransaction(mainnetClient, { hash: hash_4 })).nonce,
  ).toMatchObject(667)

  expect(await nonceManager.get(mainnetArgs)).toBe(668)
})

test('consume (parallel)', async () => {
  const nonceManager = createNonceManager({
    source: jsonRpc(),
  })

  const [n_1, nonce_1, n_2, nonce_2, n_3, nonce_3, n_4] = await Promise.all([
    nonceManager.get(mainnetArgs),
    nonceManager.consume(mainnetArgs),
    nonceManager.get(mainnetArgs),
    nonceManager.consume(mainnetArgs),
    nonceManager.get(mainnetArgs),
    nonceManager.consume(mainnetArgs),
    nonceManager.get(mainnetArgs),
  ])

  expect(n_1).toBe(668)
  expect(nonce_1).toBe(668)
  expect(n_2).toBe(669)
  expect(nonce_2).toBe(669)
  expect(n_3).toBe(670)
  expect(nonce_3).toBe(670)
  expect(n_4).toBe(671)

  const [hash_1, hash_2, hash_3] = await Promise.all([
    sendTransaction(mainnetClient, {
      to: accounts[0].address,
      nonce: nonce_1,
      value: 0n,
    }),
    sendTransaction(mainnetClient, {
      to: accounts[0].address,
      nonce: nonce_2,
      value: 0n,
    }),
    sendTransaction(mainnetClient, {
      to: accounts[0].address,
      nonce: nonce_3,
      value: 0n,
    }),
  ])

  expect(
    (await getTransaction(mainnetClient, { hash: hash_1 })).nonce,
  ).toMatchObject(668)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_2 })).nonce,
  ).toMatchObject(669)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_3 })).nonce,
  ).toMatchObject(670)
  expect(await nonceManager.get(mainnetArgs)).toBe(671)

  const nonce_4 = await nonceManager.consume(mainnetArgs)
  expect(nonce_4).toBe(671)
  const hash_4 = await sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_4,
    value: 0n,
  })
  expect(
    (await getTransaction(mainnetClient, { hash: hash_4 })).nonce,
  ).toMatchObject(671)
  expect(await nonceManager.get(mainnetArgs)).toBe(672)
})

test('nonceManager export', async () => {
  expect(await nonceManager.get(mainnetArgs)).toBe(672)
  expect(await nonceManager.consume(mainnetArgs)).toBe(672)
  expect(await nonceManager.get(mainnetArgs)).toBe(673)

  const nonces = await Promise.all([
    nonceManager.consume(mainnetArgs),
    nonceManager.get(mainnetArgs),
    nonceManager.consume(mainnetArgs),
    nonceManager.get(mainnetArgs),
    nonceManager.consume(mainnetArgs),
    nonceManager.get(mainnetArgs),
  ])
  expect(nonces).toMatchInlineSnapshot(`
    [
      673,
      674,
      674,
      675,
      675,
      676,
    ]
  `)
})

test('dropped tx', async () => {
  const nonceManager = createNonceManager({
    source: jsonRpc(),
  })

  const args = {
    address: accounts[1].address,
    chainId: mainnetClient.chain.id,
    client: mainnetClient,
  }

  const nonce_1 = await nonceManager.consume(args)
  expect(nonce_1).toBe(112)
  const hash_1 = await sendTransaction(mainnetClient, {
    account: privateKeyToAccount(accounts[1].privateKey),
    to: accounts[0].address,
    nonce: nonce_1,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(113)

  const nonce_2 = await nonceManager.consume(args)
  expect(nonce_2).toBe(113)
  const hash_2 = await sendTransaction(mainnetClient, {
    account: privateKeyToAccount(accounts[1].privateKey),
    to: accounts[0].address,
    nonce: nonce_2,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(114)

  await dropTransaction(mainnetClient, { hash: hash_1 })
  await dropTransaction(mainnetClient, { hash: hash_2 })

  const nonce_3 = await nonceManager.consume(args)
  expect(nonce_3).toBe(112)
  await sendTransaction(mainnetClient, {
    account: privateKeyToAccount(accounts[1].privateKey),
    to: accounts[0].address,
    nonce: nonce_3,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(113)
})
