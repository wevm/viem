import * as AbiEvent from 'ox/AbiEvent'
import * as AbiFunction from 'ox/AbiFunction'
import * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import { Actions } from 'viem'
import { describe, expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

import { getLogs } from './getLogs.js'

const client = anvil.getClient(anvil.mainnet)

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)
const transferEventUnnamed = AbiEvent.from(
  'event Transfer(address indexed, address indexed, uint256)',
)
// Same signature as `transferEvent`, but only `from` is indexed.
const transferEventInvalid = AbiEvent.from(
  'event Transfer(address indexed from, address to, uint256 value)',
)
const approvalEvent = AbiEvent.from(
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
)
const messageEvent = AbiEvent.from('event Message(string message)')

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const c = constants.accounts[2].address
const d = constants.accounts[3].address

/**
 * Calls a contract function, mines the tx into a block, returns the tx hash.
 *
 * TODO: replace the raw `eth_sendTransaction` with the `sendTransaction` wallet
 * action, then with the `writeContract` wallet action once they land.
 */
async function send(
  to: Hex.Hex,
  abi: readonly unknown[],
  name: string,
  args: readonly unknown[],
) {
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
const { address: invalidAddress } = await contract.deploy(client, {
  bytecode: generated.EventsInvalid.bytecode.object,
})

const transfer = (from: Hex.Hex, to: Hex.Hex, value: bigint) =>
  send(address, generated.Events.abi, 'emitTransfer', [from, to, value])
const approve = (owner: Hex.Hex, spender: Hex.Hex, value: bigint) =>
  send(address, generated.Events.abi, 'emitApproval', [owner, spender, value])

describe('getLogs', () => {
  test('default: returns raw logs', async () => {
    const fromBlock =
      (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
    await transfer(a, b, 1n)

    const logs = await getLogs(client, { address, fromBlock })
    expect(logs.length).toBe(1)
    expect(logs[0]!.address.toLowerCase()).toBe(address.toLowerCase())
    expect(logs[0]).toMatchInlineSnapshot(
      {
        address: expect.any(String),
        blockHash: expect.any(String),
        blockNumber: expect.any(BigInt),
        blockTimestamp: expect.any(BigInt),
        transactionHash: expect.any(String),
      },
      `
      {
        "address": Any<String>,
        "blockHash": Any<String>,
        "blockNumber": Any<BigInt>,
        "blockTimestamp": Any<BigInt>,
        "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
        "logIndex": 0,
        "removed": false,
        "topics": [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8",
        ],
        "transactionHash": Any<String>,
        "transactionIndex": 0,
      }
    `,
    )
  })

  test('behavior: no events, returns all logs in range', async () => {
    const fromBlock =
      (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
    await transfer(a, b, 1n)
    await transfer(a, c, 1n)

    const logs = await getLogs(client, { address, fromBlock })
    expect(logs.length).toBe(2)
  })

  describe('events', () => {
    test('args: event', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(a, b, 1n)
      await transfer(a, c, 1n)

      const logs = await getLogs(client, {
        address,
        event: transferEvent,
        fromBlock,
      })
      expect(logs.length).toBe(2)
      expect(logs[0]!.eventName).toEqual('Transfer')
      expect(logs[0]!.args).toEqual({
        from: Address.checksum(a),
        to: Address.checksum(b),
        value: 1n,
      })
      expect(logs[1]!.args).toEqual({
        from: Address.checksum(a),
        to: Address.checksum(c),
        value: 1n,
      })
    })

    test('args: events', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await approve(a, b, 1n)
      await transfer(a, c, 1n)

      const logs = await getLogs(client, {
        address,
        events: [transferEvent, approvalEvent],
        fromBlock,
      })
      expect(logs.length).toBe(2)
      expect(logs[0]!.eventName).toEqual('Approval')
      expect(logs[0]!.args).toEqual({
        owner: Address.checksum(a),
        spender: Address.checksum(b),
        value: 1n,
      })
      expect(logs[1]!.eventName).toEqual('Transfer')
      expect(logs[1]!.args).toEqual({
        from: Address.checksum(a),
        to: Address.checksum(c),
        value: 1n,
      })
    })

    test('args: non-indexed data event', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await send(address, generated.Events.abi, 'emitMessage', ['gm'])

      const logs = await getLogs(client, {
        address,
        event: messageEvent,
        fromBlock,
      })
      expect(logs.length).toBe(1)
      expect(logs[0]!.args).toEqual({ message: 'gm' })
    })

    test('args: fromBlock/toBlock', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(a, b, 1n)
      const toBlock = await Actions.getBlockNumber(client, { cacheTime: 0 })
      await transfer(a, c, 2n)

      const logs = await getLogs(client, {
        address,
        event: transferEvent,
        fromBlock,
        toBlock,
      })
      expect(logs.length).toBe(1)
      expect(logs[0]!.args.value).toBe(1n)
    })

    test('args: blockHash', async () => {
      const hash = await transfer(a, b, 7n)
      const { blockHash } = await Actions.getTransactionReceipt(client, {
        hash,
      })

      const logs = await getLogs(client, {
        address,
        blockHash,
        event: transferEvent,
      })
      expect(logs.length).toBe(1)
      expect(logs[0]!.args.value).toBe(7n)
    })

    test('args: strict = true (named)', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(a, b, 1n)

      const logs = await getLogs(client, {
        address,
        event: transferEvent,
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

    test('args: strict = false (named)', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(a, b, 1n)

      const logs = await getLogs(client, {
        address,
        event: transferEvent,
        fromBlock,
      })
      expect(logs.length).toBe(1)
      expect(logs[0]!.args).toEqual({
        from: Address.checksum(a),
        to: Address.checksum(b),
        value: 1n,
      })
    })

    test('args: strict = true (unnamed)', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(a, b, 1n)

      const logs = await getLogs(client, {
        address,
        event: transferEventUnnamed,
        fromBlock,
        strict: true,
      })
      expect(logs.length).toBe(1)
      expect(logs[0]!.args).toEqual([
        Address.checksum(a),
        Address.checksum(b),
        1n,
      ])
    })

    test('args: strict = false (unnamed)', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(a, b, 1n)

      const logs = await getLogs(client, {
        address,
        event: transferEventUnnamed,
        fromBlock,
      })
      expect(logs.length).toBe(1)
      expect(logs[0]!.args).toEqual([
        Address.checksum(a),
        Address.checksum(b),
        1n,
      ])
    })

    test('args: singular `from`', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(d, a, 1n)
      await transfer(a, b, 1n)
      await transfer(a, b, 1n)
      await approve(a, a, 1n)

      const namedLogs = await getLogs(client, {
        address,
        event: transferEvent,
        args: { from: a },
        fromBlock,
      })
      expect(namedLogs.length).toBe(2)
      expect(namedLogs[0]!.args).toEqual({
        from: Address.checksum(a),
        to: Address.checksum(b),
        value: 1n,
      })

      const unnamedLogs = await getLogs(client, {
        address,
        event: transferEventUnnamed,
        args: [a],
        fromBlock,
      })
      expect(unnamedLogs.length).toBe(2)
      expect(unnamedLogs[0]!.args).toEqual([
        Address.checksum(a),
        Address.checksum(b),
        1n,
      ])
    })

    test('args: multiple `from`', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(d, a, 1n)
      await transfer(a, b, 1n)
      await transfer(a, c, 1n)
      await approve(a, a, 1n)

      const logs = await getLogs(client, {
        address,
        event: transferEvent,
        args: { from: [d, a] },
        fromBlock,
      })
      expect(logs.length).toBe(3)
      expect(logs.map((log) => log.args.from)).toEqual([
        Address.checksum(d),
        Address.checksum(a),
        Address.checksum(a),
      ])
    })

    test('args: singular `to`', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(d, a, 1n)
      await transfer(a, b, 1n)
      await transfer(a, b, 1n)
      await approve(a, a, 1n)

      const namedLogs = await getLogs(client, {
        address,
        event: transferEvent,
        args: { to: a },
        fromBlock,
      })
      expect(namedLogs.length).toBe(1)
      expect(namedLogs[0]!.args).toEqual({
        from: Address.checksum(d),
        to: Address.checksum(a),
        value: 1n,
      })

      const unnamedLogs = await getLogs(client, {
        address,
        event: transferEventUnnamed,
        args: [null, a],
        fromBlock,
      })
      expect(unnamedLogs.length).toBe(1)
      expect(unnamedLogs[0]!.args).toEqual([
        Address.checksum(d),
        Address.checksum(a),
        1n,
      ])
    })

    test('args: multiple `to`', async () => {
      const fromBlock =
        (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
      await transfer(d, a, 1n)
      await transfer(a, b, 1n)
      await transfer(a, c, 1n)
      await approve(a, a, 1n)

      const namedLogs = await getLogs(client, {
        address,
        event: transferEvent,
        args: { to: [a, b] },
        fromBlock,
      })
      expect(namedLogs.length).toBe(2)
      expect(namedLogs.map((log) => log.args.to)).toEqual([
        Address.checksum(a),
        Address.checksum(b),
      ])

      const unnamedLogs = await getLogs(client, {
        address,
        event: transferEventUnnamed,
        args: [null, [a, b]],
        fromBlock,
      })
      expect(unnamedLogs.length).toBe(2)
    })

    describe('args: strict', () => {
      test('indexed params mismatch', async () => {
        const fromBlock =
          (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
        await transfer(a, b, 1n)
        await send(
          invalidAddress,
          generated.EventsInvalid.abi,
          'emitTransfer',
          [a, b, 1n],
        )
        await send(
          invalidAddress,
          generated.EventsInvalid.abi,
          'emitTransfer',
          [a, c, 1n],
        )

        const strictLogs = await getLogs(client, {
          event: transferEvent,
          fromBlock,
          strict: true,
        })
        const looseLogs = await getLogs(client, {
          event: transferEvent,
          fromBlock,
        })
        expect(strictLogs.length).toBe(1)
        expect(looseLogs.length).toBe(3)
      })

      test('non-indexed params mismatch', async () => {
        const fromBlock =
          (await Actions.getBlockNumber(client, { cacheTime: 0 })) + 1n
        await transfer(a, b, 1n)
        await send(
          invalidAddress,
          generated.EventsInvalid.abi,
          'emitTransfer',
          [a, b, 1n],
        )
        await send(
          invalidAddress,
          generated.EventsInvalid.abi,
          'emitTransfer',
          [a, c, 1n],
        )

        const strictLogs = await getLogs(client, {
          event: transferEventInvalid,
          fromBlock,
          strict: true,
        })
        const looseLogs = await getLogs(client, {
          event: transferEventInvalid,
          fromBlock,
        })
        expect(strictLogs.length).toBe(2)
        expect(looseLogs.length).toBe(3)
      })
    })
  })
})
