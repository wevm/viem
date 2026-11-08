import { AbiEvent, Address, Hex } from 'ox'
import { Actions } from 'viem'
import { describe, expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

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
const noteEvent = {
  ...AbiEvent.from(
    'event Note(address indexed from, uint256 indexed id, uint256 value)',
  ),
  anonymous: true,
} as const
const taggedEvent = AbiEvent.from('event Tagged(bytes32 indexed tag)')

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const c = constants.accounts[2].address
const d = constants.accounts[3].address

const { address } = await contract.deploy(client, {
  bytecode: generated.Events.bytecode.object,
})
const { address: invalidAddress } = await contract.deploy(client, {
  bytecode: generated.EventsInvalid.bytecode.object,
})
const { address: logger } = await contract.deploy(client, {
  bytecode: contract.loggerBytecode,
})

async function note(from: Hex.Hex, id: bigint, value: bigint) {
  await contract.emitLog(client, {
    address: logger,
    data: Hex.fromNumber(value, { size: 32 }),
    topics: [Hex.padLeft(from, 32), Hex.fromNumber(id, { size: 32 })],
  })
}

async function tagged(tag: Hex.Hex) {
  await contract.emitLog(client, {
    address: logger,
    topics: [AbiEvent.getSelector(taggedEvent), tag],
  })
}

/** Mines pending transactions into a block. */
async function mine() {
  await Actions.block.mine(client, { blocks: 1 })
}

async function transfer(from: Hex.Hex, to: Hex.Hex, value: bigint) {
  const hash = await Actions.contract.write(client, {
    abi: generated.Events.abi,
    account: a,
    address,
    args: [from, to, value],
    functionName: 'emitTransfer',
  })
  await mine()
  return hash
}

async function approve(owner: Hex.Hex, spender: Hex.Hex, value: bigint) {
  await Actions.contract.write(client, {
    abi: generated.Events.abi,
    account: a,
    address,
    args: [owner, spender, value],
    functionName: 'emitApproval',
  })
  await mine()
}

async function message(value: string) {
  await Actions.contract.write(client, {
    abi: generated.Events.abi,
    account: a,
    address,
    args: [value],
    functionName: 'emitMessage',
  })
  await mine()
}

async function transferInvalid(from: Hex.Hex, to: Hex.Hex, value: bigint) {
  await Actions.contract.write(client, {
    abi: generated.EventsInvalid.abi,
    account: a,
    address: invalidAddress,
    args: [from, to, value],
    functionName: 'emitTransfer',
  })
  await mine()
}

test('default: returns raw logs', async () => {
  const fromBlock =
    (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
  await transfer(a, b, 1n)

  const logs = await Actions.event.getLogs(client, { address, fromBlock })
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
    (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
  await transfer(a, b, 1n)
  await transfer(a, c, 1n)

  const logs = await Actions.event.getLogs(client, { address, fromBlock })
  expect(logs.length).toBe(2)
})

describe('events', () => {
  test('args: event', async () => {
    const fromBlock =
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(a, b, 1n)
    await transfer(a, c, 1n)

    const logs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await approve(a, b, 1n)
    await transfer(a, c, 1n)

    const logs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await message('gm')

    const logs = await Actions.event.getLogs(client, {
      address,
      event: messageEvent,
      fromBlock,
    })
    expect(logs.length).toBe(1)
    expect(logs[0]!.args).toEqual({ message: 'gm' })
  })

  test('args: fromBlock/toBlock', async () => {
    const fromBlock =
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(a, b, 1n)
    const toBlock = await Actions.block.getNumber(client, { cacheTime: 0 })
    await transfer(a, c, 2n)

    const logs = await Actions.event.getLogs(client, {
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
    const { blockHash } = await Actions.transaction.getReceipt(client, {
      hash,
    })

    const logs = await Actions.event.getLogs(client, {
      address,
      blockHash,
      event: transferEvent,
    })
    expect(logs.length).toBe(1)
    expect(logs[0]!.args.value).toBe(7n)
  })

  test('args: strict = true (named)', async () => {
    const fromBlock =
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(a, b, 1n)

    const logs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(a, b, 1n)

    const logs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(a, b, 1n)

    const logs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(a, b, 1n)

    const logs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(d, a, 1n)
    await transfer(a, b, 1n)
    await transfer(a, b, 1n)
    await approve(a, a, 1n)

    const namedLogs = await Actions.event.getLogs(client, {
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

    const unnamedLogs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(d, a, 1n)
    await transfer(a, b, 1n)
    await transfer(a, c, 1n)
    await approve(a, a, 1n)

    const logs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(d, a, 1n)
    await transfer(a, b, 1n)
    await transfer(a, b, 1n)
    await approve(a, a, 1n)

    const namedLogs = await Actions.event.getLogs(client, {
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

    const unnamedLogs = await Actions.event.getLogs(client, {
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
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await transfer(d, a, 1n)
    await transfer(a, b, 1n)
    await transfer(a, c, 1n)
    await approve(a, a, 1n)

    const namedLogs = await Actions.event.getLogs(client, {
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

    const unnamedLogs = await Actions.event.getLogs(client, {
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
        (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
      await transfer(a, b, 1n)
      await transferInvalid(a, b, 1n)
      await transferInvalid(a, c, 1n)

      const strictLogs = await Actions.event.getLogs(client, {
        event: transferEvent,
        fromBlock,
        strict: true,
      })
      const looseLogs = await Actions.event.getLogs(client, {
        event: transferEvent,
        fromBlock,
      })
      expect(strictLogs.length).toBe(1)
      expect(looseLogs.length).toBe(3)
    })

    test('non-indexed params mismatch', async () => {
      const fromBlock =
        (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
      await transfer(a, b, 1n)
      await transferInvalid(a, b, 1n)
      await transferInvalid(a, c, 1n)

      const strictLogs = await Actions.event.getLogs(client, {
        event: transferEventInvalid,
        fromBlock,
        strict: true,
      })
      const looseLogs = await Actions.event.getLogs(client, {
        event: transferEventInvalid,
        fromBlock,
      })
      expect(strictLogs.length).toBe(2)
      expect(looseLogs.length).toBe(3)
    })
  })
})

describe('anonymous events', () => {
  test('decodes logs of a requested anonymous event', async () => {
    const fromBlock =
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await note(a, 1n, 7n)
    // Same topic count as `Note`, but no data to decode `value` from.
    await tagged(Hex.padLeft('0x01', 32))

    const logs = await Actions.event.getLogs(client, {
      address: logger,
      event: noteEvent,
      fromBlock,
    })
    expect(
      logs.map(
        ({
          address: _,
          blockHash: _h,
          blockNumber: _n,
          blockTimestamp: _t,
          transactionHash: _x,
          ...log
        }) => log,
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "id": 1n,
            "value": 7n,
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000007",
          "eventName": "Note",
          "logIndex": 0,
          "removed": false,
          "topics": [
            "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "0x0000000000000000000000000000000000000000000000000000000000000001",
          ],
          "transactionIndex": 0,
        },
      ]
    `)
  })

  test('filters anonymous event logs by indexed args', async () => {
    const fromBlock =
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await note(a, 1n, 1n)
    await note(b, 2n, 2n)

    const logs = await Actions.event.getLogs(client, {
      address: logger,
      args: { from: b },
      event: noteEvent,
      fromBlock,
    })
    expect(logs.map((log) => log.args)).toMatchInlineSnapshot(`
      [
        {
          "from": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "id": 2n,
          "value": 2n,
        },
      ]
    `)
  })

  test('skips anonymous events requested alongside named events', async () => {
    const fromBlock =
      (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
    await note(a, 1n, 1n)
    await tagged(Hex.padLeft('0x02', 32))

    const logs = await Actions.event.getLogs(client, {
      address: logger,
      events: [noteEvent, taggedEvent],
      fromBlock,
    })
    expect(logs.map(({ args, eventName }) => ({ args, eventName })))
      .toMatchInlineSnapshot(`
      [
        {
          "args": {
            "tag": "0x0000000000000000000000000000000000000000000000000000000000000002",
          },
          "eventName": "Tagged",
        },
      ]
    `)
  })
})

test('args: bytes in a different hex case', async () => {
  const fromBlock =
    (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
  await tagged(Hex.padLeft('0xabcdef', 32))

  const logs = await Actions.event.getLogs(client, {
    address: logger,
    args: { tag: Hex.padLeft('0xABCDEF', 32) },
    event: taggedEvent,
    fromBlock,
  })
  expect(logs.map((log) => log.args)).toMatchInlineSnapshot(`
    [
      {
        "tag": "0x0000000000000000000000000000000000000000000000000000000000abcdef",
      },
    ]
  `)
})
