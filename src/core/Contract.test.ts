import { expect, test } from 'vitest'

import { Account, Actions, Client, Contract, http } from 'viem'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.local)
const account = constants.accounts[0].address
const recipient = constants.accounts[1].address

const accountClient = Client.create({
  account,
  transport: http(anvil.local.rpcUrl.http),
})

const erc721 = Contract.from({
  abi: generated.Erc721.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.Erc721.bytecode.object,
    })
  ).address,
  client: accountClient,
})

const events = Contract.from({
  abi: generated.Events.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.Events.bytecode.object,
    })
  ).address,
  client: accountClient,
})

test('derives conditional method groups from the ABI', () => {
  expect(Object.keys(erc721)).toMatchInlineSnapshot(`
    [
      "abi",
      "address",
      "read",
      "estimateGas",
      "simulate",
      "write",
    ]
  `)
  expect(Object.keys(events)).toMatchInlineSnapshot(`
    [
      "abi",
      "address",
      "estimateGas",
      "simulate",
      "write",
      "createEventFilter",
      "getLogs",
      "watchEvent",
    ]
  `)

  const empty = Contract.from({
    abi: [] as const,
    address: events.address,
    client,
  })
  expect(Object.keys(empty)).toMatchInlineSnapshot(`
    [
      "abi",
      "address",
    ]
  `)
})

test('write rejects without a client or per-call account', async () => {
  const contract = Contract.from({
    abi: generated.Events.abi,
    address: events.address,
    // Unreachable transport: the account check rejects before any request.
    client: Client.create({
      transport: http('http://localhost:1'),
    }),
  })
  expect(contract.write).toBeDefined()
  await expect(
    // @ts-expect-error account is required without a client account
    contract.write.emitTransfer([account, recipient, 1n]),
  ).rejects.toThrowError(Account.NotFoundError)
})

test('write group accepts a per-call account without a client account', async () => {
  // Fresh deployment: keeps this test's logs out of the shared instance.
  const { address } = await contract.deploy(client, {
    bytecode: generated.Events.bytecode.object,
  })
  const fresh = Contract.from({
    abi: generated.Events.abi,
    address,
    client: Client.create({ transport: http(anvil.local.rpcUrl.http) }),
  })
  const args = [account, recipient, 1n] as const

  expect(
    (await fresh.estimateGas.emitTransfer(args, { account })) > 0n,
  ).toMatchInlineSnapshot(`true`)
  expect(
    (await fresh.simulate.emitTransfer(args, { account })).result,
  ).toMatchInlineSnapshot(`undefined`)

  const hash = await fresh.write.emitTransfer(args, { account })
  await Actions.block.mine(client, { blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('binds function and event action options', async () => {
  expect(await erc721.read.name()).toMatchInlineSnapshot(`"wagmi"`)

  const args = [account, recipient, 1n] as const
  expect(
    (await events.estimateGas.emitTransfer(args, { account })) > 0n,
  ).toMatchInlineSnapshot(`true`)
  expect(
    (await events.simulate.emitTransfer(args, { account })).result,
  ).toMatchInlineSnapshot(`undefined`)

  const filter = await events.createEventFilter.Transfer({
    args: { from: account },
    fromBlock: 'latest',
  })
  const watcher = events.watchEvent.Transfer({ poll: true })
  watcher.off()

  const hash = await events.write.emitTransfer(args, { account })
  await Actions.block.mine(client, { blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })

  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.map(({ args, eventName }) => ({ args, eventName })))
    .toMatchInlineSnapshot(`
    [
      {
        "args": {
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "value": 1n,
        },
        "eventName": "Transfer",
      },
    ]
  `)

  const logs = await events.getLogs.Transfer({ blockHash: receipt.blockHash })
  expect(logs.map(({ args, eventName }) => ({ args, eventName })))
    .toMatchInlineSnapshot(`
    [
      {
        "args": {
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "value": 1n,
        },
        "eventName": "Transfer",
      },
    ]
  `)

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  await Actions.filter.uninstall(client, { filter })
})
