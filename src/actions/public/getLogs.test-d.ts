import type { AbiEvent } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { publicClient } from '../../_test/utils.js'

import { getLogs } from './getLogs.js'

test('event: const assertion', async () => {
  const event = {
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'foo',
        type: 'string',
      },
      {
        indexed: false,
        name: 'bar',
        type: 'string',
      },
    ],
    name: 'Transfer',
    type: 'event',
  } as const
  const logs = await getLogs(publicClient, {
    event,
  })
  logs[0].topics
  expectTypeOf(logs[0]['eventName']).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0]['topics']).toEqualTypeOf<
    [`0x${string}`, `0x${string}`, `0x${string}`]
  >()
  expectTypeOf(logs[0]['args']).toEqualTypeOf<{
    from: `0x${string}`
    to: `0x${string}`
    value: bigint
    foo: string
    bar: string
  }>()
})

test('event: defined inline', async () => {
  const logs = await getLogs(publicClient, {
    event: {
      inputs: [
        {
          indexed: true,
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          name: 'to',
          type: 'address',
        },
        {
          indexed: false,
          name: 'value',
          type: 'uint256',
        },
        {
          indexed: false,
          name: 'foo',
          type: 'string',
        },
        {
          indexed: false,
          name: 'bar',
          type: 'string',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
  })
  expectTypeOf(logs[0]['eventName']).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0]['topics']).toEqualTypeOf<
    [`0x${string}`, `0x${string}`, `0x${string}`]
  >()
  expectTypeOf(logs[0]['args']).toEqualTypeOf<{
    from: `0x${string}`
    to: `0x${string}`
    value: bigint
    foo: string
    bar: string
  }>()
})

test('event: declared as `AbiEvent`', async () => {
  const event: AbiEvent = {
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  }
  const logs = await getLogs(publicClient, {
    event,
  })
  expectTypeOf(logs[0]['eventName']).toEqualTypeOf<string>()
  expectTypeOf(logs[0]['topics']).toEqualTypeOf<
    [] | [`0x${string}`, ...`0x${string}`[]]
  >()
  expectTypeOf(logs[0]['args']).toEqualTypeOf<readonly unknown[]>()
})

test('inputs: no inputs', async () => {
  const logs = await getLogs(publicClient, {
    event: {
      inputs: [],
      name: 'Transfer',
      type: 'event',
    },
  })
  expectTypeOf(logs[0]['eventName']).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0]['topics']).toEqualTypeOf<[`0x${string}`]>()
  expectTypeOf(logs[0]['args']).toEqualTypeOf<never>()
})
