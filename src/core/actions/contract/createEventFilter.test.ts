import { Address } from 'ox'
import type { Hex } from 'ox'
import { Actions, publicActions } from 'viem'
import { expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)

const a = constants.accounts[0].address
const b = constants.accounts[1].address

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

test('default: filters and decodes a contract event by name', async () => {
  const fromBlock = await nextBlock()
  const filter = await Actions.contract.createEventFilter(client, {
    abi: generated.Events.abi,
    address,
    eventName: 'Transfer',
    fromBlock,
  })
  expect(filter.type).toBe('event')

  await transfer(a, b, 1n)
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(1)
  expect(changes[0]!.eventName).toBe('Transfer')

  await Actions.filter.uninstall(client, { filter })
})

test('args: filters by indexed argument', async () => {
  const fromBlock = await nextBlock()
  const filter = await Actions.contract.createEventFilter(client, {
    abi: generated.Events.abi,
    address,
    args: { from: a },
    eventName: 'Transfer',
    fromBlock,
  })

  await transfer(b, a, 1n)
  await transfer(a, b, 1n)
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(1)
  expect(changes[0]!.args.from).toBe(Address.checksum(a))

  await Actions.filter.uninstall(client, { filter })
})

test('no eventName: decodes any event in the abi', async () => {
  const fromBlock = await nextBlock()
  const filter = await Actions.contract.createEventFilter(client, {
    abi: generated.Events.abi,
    address,
    fromBlock,
  })

  await transfer(a, b, 1n)
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(1)

  await Actions.filter.uninstall(client, { filter })
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const fromBlock = await nextBlock()
  const filter = await decorated.contract.createEventFilter({
    abi: generated.Events.abi,
    address,
    eventName: 'Transfer',
    fromBlock,
  })

  await transfer(a, b, 1n)
  const changes = await decorated.filter.getChanges({ filter })
  expect(changes.length).toBe(1)

  await decorated.filter.uninstall({ filter })
})
