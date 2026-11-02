import { AbiEvent, Address, Hex } from 'ox'
import { z } from 'ox/zod'
import { Actions } from 'viem'
import { describe, expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)

const a = constants.accounts[0].address
const b = constants.accounts[1].address

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

const { address } = await contract.deploy(client, {
  bytecode: generated.Events.bytecode.object,
})

async function transfer(from: Hex.Hex, to: Hex.Hex, value: bigint) {
  await Actions.contract.write(client, {
    abi: generated.Events.abi,
    account: a,
    address,
    args: [from, to, value],
    functionName: 'emitTransfer',
  })
  await Actions.block.mine(client, { blocks: 1 })
}

test('block: returns block hashes since last poll', async () => {
  const id = await client.request({ method: 'eth_newBlockFilter' })
  const filter = { id, request: client.request, type: 'block' } as const

  await Actions.block.mine(client, { blocks: 2 })
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(2)
  expect(changes.every((hash) => typeof hash === 'string')).toBe(true)

  // Drains: a second poll with no new blocks is empty.
  expect((await Actions.filter.getChanges(client, { filter })).length).toBe(0)

  await Actions.filter.uninstall(client, { filter })
})

test('transaction: returns pending transaction hashes', async () => {
  const id = await client.request({
    method: 'eth_newPendingTransactionFilter',
  })
  const filter = { id, request: client.request, type: 'transaction' } as const

  const hash = await Actions.transaction.send(client, {
    account: a,
    to: b,
    value: 1n,
  })
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes).toContain(hash)

  await Actions.filter.uninstall(client, { filter })
})

describe('event', () => {
  test('decodes logs by event', async () => {
    const fromBlock = await Actions.block.getNumber(client, { cacheTime: 0 })
    const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_newFilter')
    const id = await client.request({
      method: 'eth_newFilter',
      params: z.RpcSchema.encodeParams(item, [
        { address, fromBlock, topics: AbiEvent.encode(transferEvent).topics },
      ]),
    })
    const filter = {
      id,
      request: client.request,
      type: 'event',
      abiEvent: transferEvent,
    } as const

    await transfer(a, b, 1n)
    const changes = await Actions.filter.getChanges(client, { filter })
    expect(changes.length).toBe(1)
    expect(changes[0]!.eventName).toBe('Transfer')
    expect(changes[0]!.args).toEqual({
      from: Address.checksum(a),
      to: Address.checksum(b),
      value: 1n,
    })

    await Actions.filter.uninstall(client, { filter })
  })

  test('decodes logs by an anonymous event', async () => {
    const note = {
      ...AbiEvent.from(
        'event Note(address indexed from, uint256 indexed id, uint256 value)',
      ),
      anonymous: true,
    } as const
    const { address: logger } = await contract.deploy(client, {
      bytecode: contract.loggerBytecode,
    })
    const filter = await Actions.event.createFilter(client, {
      address: logger,
      event: note,
    })

    await contract.emitLog(client, {
      address: logger,
      data: Hex.fromNumber(1n, { size: 32 }),
      topics: [Hex.padLeft(a, 32), Hex.fromNumber(7n, { size: 32 })],
    })
    const changes = await Actions.filter.getChanges(client, { filter })
    expect(
      changes.map(({ args, eventName }) => ({ args, eventName })),
    ).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "id": 7n,
            "value": 1n,
          },
          "eventName": "Note",
        },
      ]
    `)

    await Actions.filter.uninstall(client, { filter })
  })

  test('returns raw logs when no event', async () => {
    // Isolate from prior tests' logs: a no-topics filter matches every log at
    // `address`, so start from a fresh empty block.
    await Actions.block.mine(client, { blocks: 1 })
    const fromBlock = await Actions.block.getNumber(client, { cacheTime: 0 })
    const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_newFilter')
    const id = await client.request({
      method: 'eth_newFilter',
      params: z.RpcSchema.encodeParams(item, [{ address, fromBlock }]),
    })
    const filter = { id, request: client.request, type: 'event' } as const

    await transfer(a, b, 1n)
    const changes = await Actions.filter.getChanges(client, { filter })
    expect(changes.length).toBe(1)
    expect(changes[0]!.address.toLowerCase()).toBe(address.toLowerCase())

    await Actions.filter.uninstall(client, { filter })
  })
})
