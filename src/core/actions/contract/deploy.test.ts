import { describe, expect, test } from 'vitest'

import {
  Account,
  Actions,
  Client,
  RpcError,
  http,
  walletActions,
  testActions,
} from 'viem'
import { mainnet } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const local = Account.fromPrivateKey(constants.accounts[0].privateKey)
const jsonRpc = Account.from(constants.accounts[0].address)
const source = constants.accounts[0]
const ether = 1_000_000_000_000_000_000n
const payableBytecode = '0x6001600c60003960016000f300'

async function setup() {
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
}

describe.each([
  ['json-rpc', jsonRpc],
  ['local', local],
] as const)('account: %s', (_name, account) => {
  test('deploys a contract', async () => {
    await setup()
    const hash = await Actions.contract.deploy(client, {
      abi: generated.Events.abi,
      account,
      bytecode: generated.Events.bytecode.object,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    if (!receipt.contractAddress) throw new Error('contract not deployed.')
    const code = await Actions.address.getCode(client, {
      address: receipt.contractAddress,
    })
    expect({ hasCode: code !== '0x', status: receipt.status })
      .toMatchInlineSnapshot(`
      {
        "hasCode": true,
        "status": "success",
      }
    `)
  })
})

test('account: inferred from client', async () => {
  await setup()
  const client = Client.create({
    account: jsonRpc,
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const hash = await Actions.contract.deploy(client, {
    abi: generated.Events.abi,
    bytecode: generated.Events.bytecode.object,
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('behavior: no funds', async () => {
  await testClient.address.setBalance({
    address: source.address,
    value: 0n,
  })

  try {
    await expect(() =>
      Actions.contract.deploy(client, {
        abi: generated.Events.abi,
        account: local,
        bytecode: generated.Events.bytecode.object,
      }),
    ).rejects.toBeInstanceOf(RpcError.ExecutionError)
  } finally {
    await setup()
  }
})

test('decorator: deploys a contract', async () => {
  await setup()
  const client = anvil.getClient(anvil.mainnet).extend(walletActions())
  const hash = await client.contract.deploy({
    abi: generated.Events.abi,
    account: local,
    bytecode: generated.Events.bytecode.object,
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('args: value', async () => {
  await testClient.address.setBalance({
    address: source.address,
    value: 2n * ether,
  })
  const hash = await Actions.contract.deploy(client, {
    abi: [],
    account: local,
    bytecode: payableBytecode,
    value: ether,
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  if (!receipt.contractAddress) throw new Error('contract not deployed.')
  const balance = await Actions.address.getBalance(client, {
    address: receipt.contractAddress,
  })
  expect(balance).toMatchInlineSnapshot(`1000000000000000000n`)
})

test('encodes constructor args', async () => {
  await setup()
  const abi = [
    {
      type: 'constructor',
      inputs: [{ name: 'value', type: 'uint256' }],
      stateMutability: 'nonpayable',
    },
  ] as const
  const hash = await Actions.contract.deploy(client, {
    abi,
    account: local,
    args: [123n],
    bytecode: generated.Events.bytecode.object,
  })
  await testClient.block.mine({ blocks: 1 })
  const transaction = await Actions.transaction.get(client, { hash })
  expect(
    transaction.input.slice(generated.Events.bytecode.object.length),
  ).toMatchInlineSnapshot(
    `"000000000000000000000000000000000000000000000000000000000000007b"`,
  )
})
