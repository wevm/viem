import { beforeAll, expect, test } from 'vitest'
import { anvilMainnet, anvilOptimism } from '../../test/src/anvil.js'
import { generatePrivateKey } from '../accounts/generatePrivateKey.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import {
  dropTransaction,
  getTransaction,
  sendTransaction,
  setBalance,
} from '../actions/index.js'
import { createNonceManager, jsonRpc, nonceManager } from './nonceManager.js'
import { parseEther } from './unit/parseEther.js'

const privateKey = generatePrivateKey()
const account = privateKeyToAccount(privateKey)

const mainnetClient = anvilMainnet.getClient({ account })
const optimismClient = anvilOptimism.getClient({ account })

const mainnetArgs = {
  address: account.address,
  chainId: mainnetClient.chain.id,
  client: mainnetClient,
} as const
const optimismArgs = {
  address: account.address,
  chainId: optimismClient.chain.id,
  client: optimismClient,
} as const

beforeAll(async () => {
  await anvilMainnet.restart()
  await anvilOptimism.restart()
  await setBalance(mainnetClient, {
    address: account.address,
    value: parseEther('100'),
  })
  await setBalance(optimismClient, {
    address: account.address,
    value: parseEther('100'),
  })
})

test('get next', async () => {
  const nonceManager = createNonceManager({
    source: jsonRpc(),
  })

  expect(await nonceManager.get(mainnetArgs)).toBe(0)
  await sendTransaction(mainnetClient, {
    to: account.address,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(1)

  expect(await nonceManager.get(optimismArgs)).toBe(0)
  await sendTransaction(optimismClient, {
    to: account.address,
    value: 0n,
  })
  expect(await nonceManager.get(optimismArgs)).toBe(1)
})

test('consume (sequence)', async () => {
  const nonceManager = createNonceManager({
    source: jsonRpc(),
  })

  const nonce_1 = await nonceManager.consume(mainnetArgs)
  expect(nonce_1).toBe(1)
  const promise_1 = sendTransaction(mainnetClient, {
    to: account.address,
    nonce: nonce_1,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(2)

  const nonce_2 = await nonceManager.consume(mainnetArgs)
  expect(nonce_2).toBe(2)
  const promise_2 = sendTransaction(mainnetClient, {
    to: account.address,
    nonce: nonce_2,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(3)

  const nonce_3 = await nonceManager.consume(mainnetArgs)
  expect(nonce_3).toBe(3)
  const promise_3 = sendTransaction(mainnetClient, {
    to: account.address,
    nonce: nonce_3,
    value: 0n,
  })
  expect(await nonceManager.get(mainnetArgs)).toBe(4)

  const [hash_1, hash_2, hash_3] = await Promise.all([
    promise_1,
    promise_2,
    promise_3,
  ])

  expect(
    (await getTransaction(mainnetClient, { hash: hash_1 })).nonce,
  ).toMatchObject(1)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_2 })).nonce,
  ).toMatchObject(2)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_3 })).nonce,
  ).toMatchObject(3)
  expect(await nonceManager.get(mainnetArgs)).toBe(4)

  const nonce_4 = await nonceManager.consume(mainnetArgs)
  expect(nonce_4).toBe(4)
  const hash_4 = await sendTransaction(mainnetClient, {
    to: account.address,
    nonce: nonce_4,
    value: 0n,
  })
  expect(
    (await getTransaction(mainnetClient, { hash: hash_4 })).nonce,
  ).toMatchObject(4)

  expect(await nonceManager.get(mainnetArgs)).toBe(5)
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

  expect(n_1).toBe(5)
  expect(nonce_1).toBe(5)
  expect(n_2).toBe(6)
  expect(nonce_2).toBe(6)
  expect(n_3).toBe(7)
  expect(nonce_3).toBe(7)
  expect(n_4).toBe(8)

  const [hash_1, hash_2, hash_3] = await Promise.all([
    sendTransaction(mainnetClient, {
      to: account.address,
      nonce: nonce_1,
      value: 0n,
    }),
    sendTransaction(mainnetClient, {
      to: account.address,
      nonce: nonce_2,
      value: 0n,
    }),
    sendTransaction(mainnetClient, {
      to: account.address,
      nonce: nonce_3,
      value: 0n,
    }),
  ])

  expect(
    (await getTransaction(mainnetClient, { hash: hash_1 })).nonce,
  ).toMatchObject(5)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_2 })).nonce,
  ).toMatchObject(6)
  expect(
    (await getTransaction(mainnetClient, { hash: hash_3 })).nonce,
  ).toMatchObject(7)
  expect(await nonceManager.get(mainnetArgs)).toBe(8)

  const nonce_4 = await nonceManager.consume(mainnetArgs)
  expect(nonce_4).toBe(8)
  const hash_4 = await sendTransaction(mainnetClient, {
    to: account.address,
    nonce: nonce_4,
    value: 0n,
  })
  expect(
    (await getTransaction(mainnetClient, { hash: hash_4 })).nonce,
  ).toMatchObject(8)
  expect(await nonceManager.get(mainnetArgs)).toBe(9)
})

test('nonceManager export', async () => {
  expect(await nonceManager.get(mainnetArgs)).toBe(9)
  expect(await nonceManager.consume(mainnetArgs)).toBe(9)
  expect(await nonceManager.get(mainnetArgs)).toBe(10)

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
      10,
      11,
      11,
      12,
      12,
      13,
    ]
  `)
})

test('dropped tx', async () => {
  const nonceManager = createNonceManager({
    source: jsonRpc(),
  })

  const args = {
    address: account.address,
    chainId: mainnetClient.chain.id,
    client: mainnetClient,
  }

  const nonce_1 = await nonceManager.consume(args)
  expect(nonce_1).toBe(9)
  const hash_1 = await sendTransaction(mainnetClient, {
    account,
    to: account.address,
    nonce: nonce_1,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(10)

  const nonce_2 = await nonceManager.consume(args)
  expect(nonce_2).toBe(10)
  const hash_2 = await sendTransaction(mainnetClient, {
    account,
    to: account.address,
    nonce: nonce_2,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(11)

  await dropTransaction(mainnetClient, { hash: hash_1 })
  await dropTransaction(mainnetClient, { hash: hash_2 })

  const nonce_3 = await nonceManager.consume(args)
  expect(nonce_3).toBe(9)
  await sendTransaction(mainnetClient, {
    account,
    to: account.address,
    nonce: nonce_3,
    value: 0n,
  })
  expect(await nonceManager.get(args)).toBe(10)
})
