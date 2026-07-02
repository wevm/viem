import * as AbiEvent from 'ox/AbiEvent'
import * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import { Actions, publicActions } from 'viem'
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
const transferEventUnnamed = AbiEvent.from(
  'event Transfer(address indexed, address indexed, uint256)',
)
const approvalEvent = AbiEvent.from(
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
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
  await Actions.test.block.mine(client, { blocks: 1 })
}

// Mines past earlier tests' logs; a filter from the returned block only sees
// logs emitted after it.
async function nextBlock() {
  await Actions.test.block.mine(client, { blocks: 1 })
  return await Actions.block.getNumber(client, { cacheTime: 0 })
}

test('default: creates a no-event filter (raw logs)', async () => {
  const fromBlock = await nextBlock()
  const filter = await Actions.event.createFilter(client, {
    address,
    fromBlock,
  })
  expect(filter.type).toBe('event')

  await transfer(a, b, 1n)
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(1)
  expect(changes[0]!.address.toLowerCase()).toBe(address.toLowerCase())

  await Actions.filter.uninstall(client, { filter })
})

describe('event', () => {
  test('decodes logs by event', async () => {
    const fromBlock = await nextBlock()
    const filter = await Actions.event.createFilter(client, {
      address,
      event: transferEvent,
      fromBlock,
    })

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

  test('args: filters by indexed argument', async () => {
    const fromBlock = await nextBlock()
    const filter = await Actions.event.createFilter(client, {
      address,
      args: { from: a },
      event: transferEvent,
      fromBlock,
    })

    await transfer(b, a, 1n)
    await transfer(a, b, 1n)
    const changes = await Actions.filter.getChanges(client, { filter })
    expect(changes.length).toBe(1)
    expect(changes[0]!.args.from).toBe(Address.checksum(a))

    await Actions.filter.uninstall(client, { filter })
  })

  test('args: filters by unnamed (positional) argument', async () => {
    const fromBlock = await nextBlock()
    const filter = await Actions.event.createFilter(client, {
      address,
      args: [a],
      event: transferEventUnnamed,
      fromBlock,
    })

    await transfer(b, a, 1n)
    await transfer(a, b, 1n)
    const changes = await Actions.filter.getChanges(client, { filter })
    expect(changes.length).toBe(1)
    expect(changes[0]!.args).toEqual([
      Address.checksum(a),
      Address.checksum(b),
      1n,
    ])

    await Actions.filter.uninstall(client, { filter })
  })
})

test('events: decodes logs by multiple events', async () => {
  const fromBlock = await nextBlock()
  const filter = await Actions.event.createFilter(client, {
    address,
    events: [transferEvent, approvalEvent],
    fromBlock,
  })

  await transfer(a, b, 1n)
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(1)
  expect(changes[0]!.eventName).toBe('Transfer')

  await Actions.filter.uninstall(client, { filter })
})

test('getLogs: re-reads the full set', async () => {
  const fromBlock = await nextBlock()
  const filter = await Actions.event.createFilter(client, {
    address,
    event: transferEvent,
    fromBlock,
  })

  await transfer(a, b, 1n)
  await transfer(a, b, 2n)
  // getChanges drains; getLogs always returns the full set.
  await Actions.filter.getChanges(client, { filter })
  const logs = await Actions.filter.getLogs(client, { filter })
  expect(logs.length).toBe(2)

  await Actions.filter.uninstall(client, { filter })
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const fromBlock = await nextBlock()
  const filter = await decorated.event.createFilter({
    address,
    event: transferEvent,
    fromBlock,
  })

  await transfer(a, b, 1n)
  const changes = await decorated.filter.getChanges({ filter })
  expect(changes.length).toBe(1)

  await decorated.filter.uninstall({ filter })
})
