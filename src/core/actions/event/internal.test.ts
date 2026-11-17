import { AbiEvent, AbiParameters, Hex } from 'ox'
import type { Log } from 'ox'
import { describe, expect, test } from 'vitest'

import * as internal from './internal.js'

const from = '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'

const baseLog = {
  address: '0x00000000000000000000000000000000000000aa',
  blockHash:
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  blockNumber: 1n,
  data: '0x',
  logIndex: 0,
  removed: false,
  topics: [],
  transactionHash:
    '0x0000000000000000000000000000000000000000000000000000000000000002',
  transactionIndex: 0,
} as const satisfies Log.Log

/** Marks `event` as anonymous. */
function anonymous(event: AbiEvent.AbiEvent): AbiEvent.AbiEvent {
  return { ...event, anonymous: true }
}

const transfer = AbiEvent.from(
  'event Transfer(address indexed from, uint256 value)',
)

/** Strips the fields shared by every test log. */
function strip(logs: readonly Log.Log[]) {
  return logs.map(
    ({
      address: _,
      blockHash: _h,
      blockNumber: _n,
      removed: _r,
      transactionHash: _x,
      transactionIndex: _i,
      ...log
    }) => log,
  )
}

describe('extractLogs', () => {
  test('indexed address and non-indexed string', () => {
    const event = anonymous(
      AbiEvent.from('event Message(address indexed from, string note)'),
    )
    const log = {
      ...baseLog,
      data: AbiParameters.encode([{ type: 'string' }], ['hello']),
      topics: [Hex.padLeft(from.toLowerCase() as Hex.Hex, 32)],
    }

    expect(strip(internal.extractLogs([event], [log], { strict: false })))
      .toMatchInlineSnapshot(`
      [
        {
          "args": {
            "from": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
            "note": "hello",
          },
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000",
          "eventName": "Message",
          "logIndex": 0,
          "topics": [
            "0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac",
          ],
        },
      ]
    `)
  })

  test('unnamed arguments', () => {
    const event = anonymous(
      AbiEvent.from('event Transfer(address indexed, uint256)'),
    )
    const log = {
      ...baseLog,
      data: Hex.fromNumber(1n, { size: 32 }),
      topics: [Hex.padLeft(from.toLowerCase() as Hex.Hex, 32)],
    }

    expect(strip(internal.extractLogs([event], [log], { strict: false })))
      .toMatchInlineSnapshot(`
      [
        {
          "args": [
            "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
            1n,
          ],
          "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
          "eventName": "Transfer",
          "logIndex": 0,
          "topics": [
            "0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac",
          ],
        },
      ]
    `)
  })

  test('indexed string filter uses the only topic', () => {
    const event = anonymous(
      AbiEvent.from('event Bar(string title, string indexed message)'),
    )
    const log = {
      ...baseLog,
      data: AbiParameters.encode([{ type: 'string' }], ['title']),
      topics: AbiEvent.encode(event, { message: 'hello' }).topics as [Hex.Hex],
    }

    expect({
      matched: strip(
        internal.extractLogs([event], [log], {
          args: { message: 'hello' },
          strict: false,
        }),
      ),
      mismatched: internal.extractLogs([event], [log], {
        args: { message: 'goodbye' },
        strict: false,
      }),
    }).toMatchInlineSnapshot(`
      {
        "matched": [
          {
            "args": {
              "message": "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
              "title": "title",
            },
            "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057469746c65000000000000000000000000000000000000000000000000000000",
            "eventName": "Bar",
            "logIndex": 0,
            "topics": [
              "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
            ],
          },
        ],
        "mismatched": [],
      }
    `)
  })

  test('bytes filters ignore hex case', () => {
    const indexed = anonymous(
      AbiEvent.from('event Payload(bytes indexed data)'),
    )
    const nonIndexed = anonymous(AbiEvent.from('event Payload(bytes data)'))
    const indexedLog = {
      ...baseLog,
      topics: AbiEvent.encode(indexed, { data: '0xabcd' }).topics as [Hex.Hex],
    }
    const nonIndexedLog = {
      ...baseLog,
      data: AbiParameters.encode([{ type: 'bytes' }], ['0xabcd']),
    }

    expect({
      indexed: internal.extractLogs([indexed], [indexedLog], {
        args: { data: '0xABCD' },
        strict: false,
      }).length,
      indexedMismatch: internal.extractLogs([indexed], [indexedLog], {
        args: { data: '0xab' },
        strict: false,
      }).length,
      nonIndexed: internal.extractLogs([nonIndexed], [nonIndexedLog], {
        args: { data: '0xABCD' },
        strict: false,
      }).length,
      nonIndexedMismatch: internal.extractLogs([nonIndexed], [nonIndexedLog], {
        args: { data: '0xab' },
        strict: false,
      }).length,
    }).toMatchInlineSnapshot(`
      {
        "indexed": 1,
        "indexedMismatch": 0,
        "nonIndexed": 1,
        "nonIndexedMismatch": 0,
      }
    `)
  })

  test('anonymous events alongside a named event are not requested', () => {
    const anon = anonymous(
      AbiEvent.from('event Anon(bytes32 indexed a, bytes32 indexed b)'),
    )
    const transferLog = {
      ...baseLog,
      data: Hex.fromNumber(1n, { size: 32 }),
      topics: AbiEvent.encode(transfer, { from }).topics as [Hex.Hex, Hex.Hex],
    }
    const anonLog = {
      ...baseLog,
      logIndex: 1,
      topics: [
        Hex.fromNumber(1, { size: 32 }),
        Hex.fromNumber(2, { size: 32 }),
      ],
    }

    expect(
      internal
        .extractLogs([anon, transfer], [transferLog, anonLog], {
          strict: false,
        })
        .map((log) => (log as { eventName?: string }).eventName),
    ).toMatchInlineSnapshot(`
      [
        "Transfer",
      ]
    `)
  })

  test('selects the anonymous event whose indexed arity matches', () => {
    const one = anonymous(AbiEvent.from('event One(bytes32 indexed a)'))
    const two = anonymous(
      AbiEvent.from('event Two(bytes32 indexed a, bytes32 indexed b)'),
    )
    const log = {
      ...baseLog,
      topics: [
        Hex.fromNumber(1, { size: 32 }),
        Hex.fromNumber(2, { size: 32 }),
      ],
    }

    expect(strip(internal.extractLogs([one, two], [log], { strict: false })))
      .toMatchInlineSnapshot(`
      [
        {
          "args": {
            "a": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "b": "0x0000000000000000000000000000000000000000000000000000000000000002",
          },
          "data": "0x",
          "eventName": "Two",
          "logIndex": 0,
          "topics": [
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000000000000000000000000000000000000000000002",
          ],
        },
      ]
    `)
  })

  test('does not guess between anonymous events of the same arity', () => {
    const a = anonymous(AbiEvent.from('event A(bytes32 indexed a)'))
    const b = anonymous(AbiEvent.from('event B(uint256 indexed b)'))
    const log = { ...baseLog, topics: [Hex.fromNumber(1, { size: 32 })] }

    expect(
      internal.extractLogs([a, b], [log], { strict: false }),
    ).toMatchInlineSnapshot(`[]`)
  })

  test('skips anonymous event logs that fail to decode', () => {
    const event = anonymous(
      AbiEvent.from('event Note(bytes32 indexed a, uint256 value)'),
    )
    const log = { ...baseLog, topics: [Hex.fromNumber(1, { size: 32 })] }

    expect(
      internal.extractLogs([event], [log], { strict: false }),
    ).toMatchInlineSnapshot(`[]`)
  })
})

describe('getTopics', () => {
  test('anonymous event has no signature topic', () => {
    const event = anonymous(
      AbiEvent.from('event Note(address indexed from, uint256 value)'),
    )

    expect({
      args: internal.getTopics({ args: { from }, event }),
      noArgs: internal.getTopics({ event }),
    }).toMatchInlineSnapshot(`
      {
        "args": [
          "0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac",
        ],
        "noArgs": [],
      }
    `)
  })

  test('events: filters by named event signatures only', () => {
    const anon = anonymous(AbiEvent.from('event Note(uint256 value)'))

    expect({
      anonymous: internal.getTopics({ events: [anon] }),
      mixed: internal.getTopics({ events: [anon, transfer] }),
      none: internal.getTopics({}),
    }).toMatchInlineSnapshot(`
      {
        "anonymous": undefined,
        "mixed": [
          [
            "0x69ca02dd4edd7bf0a4abb9ed3b7af3f14778db5d61921c7dc7cd545266326de2",
          ],
        ],
        "none": undefined,
      }
    `)
  })
})
