import { Address } from 'ox'
import type { Hex } from 'ox'
import { Actions } from 'viem'
import { expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)

const abi = generated.Events.abi

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const c = constants.accounts[2].address

const { address } = await contract.deploy(client, {
  bytecode: generated.Events.bytecode.object,
})

/** Mines pending transactions into a block. */
async function mine() {
  await Actions.block.mine(client, { blocks: 1 })
}

async function transfer(
  from: Hex.Hex,
  to: Hex.Hex,
  value: bigint,
  contractAddress: Address.Address = address,
) {
  const hash = await Actions.contract.write(client, {
    abi,
    account: a,
    address: contractAddress,
    args: [from, to, value],
    functionName: 'emitTransfer',
  })
  await mine()
  return hash
}

async function approve(owner: Hex.Hex, spender: Hex.Hex, value: bigint) {
  await Actions.contract.write(client, {
    abi,
    account: a,
    address,
    args: [owner, spender, value],
    functionName: 'emitApproval',
  })
  await mine()
}

const head = () => Actions.block.getNumber(client, { cacheTime: 0 })

test('default: returns all event logs for the abi', async () => {
  const fromBlock = (await head()) + 1n
  await transfer(a, b, 1n)
  await approve(a, c, 2n)

  const logs = await Actions.contract.getLogs(client, {
    abi,
    address,
    fromBlock,
  })
  expect(logs.length).toBe(2)
  expect(logs[0]!.eventName).toBe('Transfer')
  expect(logs[0]!.args).toEqual({
    from: Address.checksum(a),
    to: Address.checksum(b),
    value: 1n,
  })
  expect(logs[1]!.eventName).toBe('Approval')
  expect(logs[1]!.args).toEqual({
    owner: Address.checksum(a),
    spender: Address.checksum(c),
    value: 2n,
  })
})

test('args: eventName', async () => {
  const fromBlock = (await head()) + 1n
  await transfer(a, b, 1n)
  await approve(a, c, 2n)
  await transfer(b, c, 3n)

  const logs = await Actions.contract.getLogs(client, {
    abi,
    address,
    eventName: 'Transfer',
    fromBlock,
  })
  expect(logs.length).toBe(2)
  expect(logs.map((log) => log.eventName)).toEqual(['Transfer', 'Transfer'])
})

test('args: args', async () => {
  const fromBlock = (await head()) + 1n
  await transfer(a, b, 1n)
  await transfer(a, c, 2n)
  await transfer(b, c, 3n)

  const logs = await Actions.contract.getLogs(client, {
    abi,
    address,
    args: { from: a },
    eventName: 'Transfer',
    fromBlock,
  })
  expect(logs.length).toBe(2)
  expect(logs.map((log) => log.args.to)).toEqual([
    Address.checksum(b),
    Address.checksum(c),
  ])
})

test('args: address', async () => {
  const { address: otherAddress } = await contract.deploy(client, {
    bytecode: generated.Events.bytecode.object,
  })
  const fromBlock = (await head()) + 1n
  await transfer(a, b, 1n)
  await transfer(a, b, 1n, otherAddress)

  const logs = await Actions.contract.getLogs(client, {
    abi,
    address,
    fromBlock,
  })
  expect(logs.length).toBe(1)
  expect(logs[0]!.address.toLowerCase()).toBe(address.toLowerCase())
})

test('args: strict', async () => {
  const fromBlock = (await head()) + 1n
  await transfer(a, b, 1n)

  const logs = await Actions.contract.getLogs(client, {
    abi,
    address,
    eventName: 'Transfer',
    fromBlock,
    strict: true,
  })
  expect(logs.length).toBe(1)
  expect(logs[0]!.args).toEqual({
    from: Address.checksum(a),
    to: Address.checksum(b),
    value: 1n,
  })
})

test('args: blockHash', async () => {
  const fromBlock = (await head()) + 1n
  await transfer(a, b, 1n)
  const block = await Actions.block.get(client, { blockNumber: fromBlock })

  const logs = await Actions.contract.getLogs(client, {
    abi,
    address,
    blockHash: block.hash!,
  })
  expect(logs.length).toBe(1)
  expect(logs[0]!.eventName).toBe('Transfer')
})
