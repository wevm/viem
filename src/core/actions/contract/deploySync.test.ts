import { describe, expect, test } from 'vitest'

import {
  Account,
  Actions,
  Client,
  RpcError,
  http,
  testActions,
  walletActions,
} from 'viem'
import { mainnet } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = client.extend(testActions())

const local = Account.fromPrivateKey(constants.accounts[0].privateKey)
const jsonRpc = Account.from(constants.accounts[0].address)
const source = constants.accounts[0]
const ether = 1_000_000_000_000_000_000n
const payableBytecode = '0x6001600c60003960016000f300'

async function setup() {
  await testClient.block.setAutomine({ enabled: true })
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
}

describe.each([
  ['json-rpc', jsonRpc],
  ['local', local],
] as const)('account: %s', (_name, account) => {
  test('deploys a contract and returns the receipt', async () => {
    await setup()
    const receipt = await Actions.contract.deploySync(client, {
      abi: generated.Events.abi,
      account,
      bytecode: generated.Events.bytecode.object,
      pollingInterval: 50,
    })
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
  const receipt = await Actions.contract.deploySync(client, {
    abi: generated.Events.abi,
    bytecode: generated.Events.bytecode.object,
    pollingInterval: 50,
  })
  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  expect(receipt.contractAddress).toBeDefined()
})

test('behavior: no funds', async () => {
  await testClient.address.setBalance({
    address: source.address,
    value: 0n,
  })

  try {
    await expect(() =>
      Actions.contract.deploySync(client, {
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
  const receipt = await client.contract.deploySync({
    abi: generated.Events.abi,
    account: local,
    bytecode: generated.Events.bytecode.object,
  })
  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  expect(receipt.contractAddress).toBeDefined()
})

test('args: value', async () => {
  await testClient.address.setBalance({
    address: source.address,
    value: 2n * ether,
  })
  const receipt = await Actions.contract.deploySync(client, {
    abi: [],
    account: local,
    bytecode: payableBytecode,
    value: ether,
  })
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
  const receipt = await Actions.contract.deploySync(client, {
    abi,
    account: local,
    args: [123n],
    bytecode: generated.Events.bytecode.object,
  })
  const transaction = await Actions.transaction.get(client, {
    hash: receipt.transactionHash,
  })
  expect(
    transaction.input.slice(generated.Events.bytecode.object.length),
  ).toMatchInlineSnapshot(
    `"000000000000000000000000000000000000000000000000000000000000007b"`,
  )
})
