import * as Authorization from 'ox/Authorization'
import * as Value from 'ox/Value'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Client, http, NonceManager, testActions } from 'viem'
import { optimism } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const local = Account.fromPrivateKey(constants.accounts[0].privateKey)
const jsonRpc = Account.from(constants.accounts[0].address)
const to = constants.accounts[1].address

describe.each([
  ['json-rpc', jsonRpc],
  ['local', local],
] as const)('account: %s', (_name, account) => {
  test('sends a value transfer', async () => {
    const hash = await Actions.transaction.send(client, {
      account,
      to,
      value: Value.fromEther('1'),
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})

describe('behavior: dataSuffix', () => {
  test('appends the suffix to the calldata', async () => {
    const hash = await Actions.transaction.send(client, {
      account: local,
      data: '0xdead',
      dataSuffix: '0xbeef',
      to,
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.input).toBe('0xdeadbeef')
  })

  test('falls back to client.dataSuffix', async () => {
    const client = Client.create({
      dataSuffix: '0xc0de',
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const hash = await Actions.transaction.send(client, {
      account: local,
      data: '0xab',
      to,
    })
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    expect(transaction.input).toBe('0xabc0de')
  })
})

describe('behavior: deployment', () => {
  test('deploys a contract when `to` is omitted', async () => {
    const hash = await Actions.transaction.send(client, {
      account: local,
      data: generated.Events.bytecode.object,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
    expect(receipt.contractAddress).toBeDefined()
  })
})

describe('behavior: eip7702', () => {
  test('infers `to` from the authorization list', async () => {
    const authority = Account.fromPrivateKey(constants.accounts[1].privateKey)
    const authorization = await authority.signAuthorization!(
      Authorization.from({
        address: '0x0000000000000000000000000000000000000000',
        chainId: 1,
        nonce: 0n,
      }),
    )
    const hash = await Actions.transaction.send(client, {
      account: local,
      authorizationList: [authorization],
      type: 'eip7702',
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})

describe('behavior: chain', () => {
  test('chain: null skips the current-chain assertion (json-rpc)', async () => {
    // `optimism` (id 10) mismatches the connected chain (id 1); `chain: null`
    // skips the assertion so the json-rpc send still broadcasts.
    const client = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const hash = await Actions.transaction.send(client, {
      account: jsonRpc,
      chain: null,
      to,
      value: 1n,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})

describe('behavior: nonceManager', () => {
  test('derives the nonce from the account nonce manager', async () => {
    const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
    const account = {
      ...Account.fromPrivateKey(constants.accounts[0].privateKey),
      nonceManager,
    }

    const hashes = await Promise.all([
      Actions.transaction.send(client, { account, to, value: 1n }),
      Actions.transaction.send(client, { account, to, value: 1n }),
    ])
    await testClient.block.mine({ blocks: 1 })

    const [a, b] = await Promise.all(
      hashes.map((hash) => Actions.transaction.get(client, { hash })),
    )
    expect(b.nonce).toBe(a.nonce + 1n)
  })
})

describe('errors', () => {
  test('no account', async () => {
    await expect(() =>
      Actions.transaction.send(client, { to, value: 1n }),
    ).rejects.toThrowError(Account.NotFoundError)
  })
})
