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

  expect(await nonceManager.get(mainnetArgs)).toBe(655)
  await sendTransaction(mainnetClient, {
    to: accounts[0].address,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(656)

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
  expect(nonce_1).toBe(656)
  const promise_1 = sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_1,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(657)

  const nonce_2 = await nonceManager.consume(mainnetArgs)
  expect(nonce_2).toBe(657)
  const promise_2 = sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_2,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(658)

  const nonce_3 = await nonceManager.consume(mainnetArgs)
  expect(nonce_3).toBe(658)
  const promise_3 = sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_3,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(659)

  const [hash_1, hash_2, hash_3] = await Promise.all([
    promise_1,
    promise_2,
    promise_3,
  ])

  expect(
    (await getTransaction(mainnetClient, { hash: hash_1 })).nonce,
  ).toMatchObject(656)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_2 })).nonce,
  ).toMatchObject(657)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_3 })).nonce,
  ).toMatchObject(658)
  expect(await nonceManager.get(mainnetArgs)).toBe(659)

  const nonce_4 = await nonceManager.consume(mainnetArgs)
  expect(nonce_4).toBe(659)
  const hash_4 = await sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_4,
    value: 0n,
  })
  expect(
    (await getTransaction(mainnetClient, { hash: hash_4 })).nonce,
  ).toMatchObject(659)

  expect(await nonceManager.get(mainnetArgs)).toBe(660)
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

  expect(n_1).toBe(660)
  expect(nonce_1).toBe(660)
  expect(n_2).toBe(661)
  expect(nonce_2).toBe(661)
  expect(n_3).toBe(662)
  expect(nonce_3).toBe(662)
  expect(n_4).toBe(663)

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
  ).toMatchObject(660)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_2 })).nonce,
  ).toMatchObject(661)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_3 })).nonce,
  ).toMatchObject(662)
  expect(await nonceManager.get(mainnetArgs)).toBe(663)

  const nonce_4 = await nonceManager.consume(mainnetArgs)
  expect(nonce_4).toBe(663)
  const hash_4 = await sendTransaction(mainnetClient, {
    to: accounts[0].address,
    nonce: nonce_4,
    value: 0n,
  })
  expect(
    (await getTransaction(mainnetClient, { hash: hash_4 })).nonce,
  ).toMatchObject(663)
  expect(await nonceManager.get(mainnetArgs)).toBe(664)
})

test('nonceManager export', async () => {
  expect(await nonceManager.get(mainnetArgs)).toBe(664)
  expect(await nonceManager.consume(mainnetArgs)).toBe(664)
  expect(await nonceManager.get(mainnetArgs)).toBe(665)

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
      665,
      666,
      666,
      667,
      667,
      668,
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
  expect(nonce_1).toBe(105)
  const hash_1 = await sendTransaction(mainnetClient, {
    account: privateKeyToAccount(accounts[1].privateKey),
    to: accounts[0].address,
    nonce: nonce_1,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(106)

  const nonce_2 = await nonceManager.consume(args)
  expect(nonce_2).toBe(106)
  const hash_2 = await sendTransaction(mainnetClient, {
    account: privateKeyToAccount(accounts[1].privateKey),
    to: accounts[0].address,
    nonce: nonce_2,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(107)

  await dropTransaction(mainnetClient, { hash: hash_1 })
  await dropTransaction(mainnetClient, { hash: hash_2 })

  const nonce_3 = await nonceManager.consume(args)
  expect(nonce_3).toBe(105)
  await sendTransaction(mainnetClient, {
    account: privateKeyToAccount(accounts[1].privateKey),
    to: accounts[0].address,
    nonce: nonce_3,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(106)
})
