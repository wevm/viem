import * as AbiFunction from 'ox/AbiFunction'
import * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import { Actions } from 'viem'
import { describe, expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

import { getContractEvents } from './getContractEvents.js'

const client = anvil.getClient(anvil.mainnet)

const abi = generated.Events.abi

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const c = constants.accounts[2].address

/**
 * Calls a contract function, mines the tx into a block, returns the tx hash.
 *
 * TODO: replace the raw `eth_sendTransaction` with the `sendTransaction` wallet
 * action, then with the `writeContract` wallet action once they land.
 */
async function send(to: Hex.Hex, name: string, args: readonly unknown[]) {
  const hash = await client.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: a,
        to,
        data: AbiFunction.encodeData(abi, name as never, args as never),
      },
    ],
  })
  // TODO: replace with `mine` test action import once stable.
  await Actions.test.mine(client, { blocks: 1 })
  return hash
}

const { address } = await contract.deploy(client, {
  bytecode: generated.Events.bytecode.object,
})

const transfer = (from: Hex.Hex, to: Hex.Hex, value: bigint) =>
  send(address, 'emitTransfer', [from, to, value])
const approve = (owner: Hex.Hex, spender: Hex.Hex, value: bigint) =>
  send(address, 'emitApproval', [owner, spender, value])

const head = () => Actions.getBlockNumber(client, { cacheTime: 0 })

describe('getContractEvents', () => {
  test('default: returns all event logs for the abi', async () => {
    const fromBlock = (await head()) + 1n
    await transfer(a, b, 1n)
    await approve(a, c, 2n)

    const logs = await getContractEvents(client, { abi, address, fromBlock })
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

    const logs = await getContractEvents(client, {
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

    const logs = await getContractEvents(client, {
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
    await send(otherAddress, 'emitTransfer', [a, b, 1n])

    const logs = await getContractEvents(client, {
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

    const logs = await getContractEvents(client, {
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
    const block = await Actions.getBlock(client, { blockNumber: fromBlock })

    const logs = await getContractEvents(client, {
      abi,
      address,
      blockHash: block.hash!,
    })
    expect(logs.length).toBe(1)
    expect(logs[0]!.eventName).toBe('Transfer')
  })
})
