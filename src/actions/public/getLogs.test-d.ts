import type { AbiEvent } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import type { Hash, Hex } from '../../types/misc.js'
import { getLogs } from './getLogs.js'

const client = anvilMainnet.getClient()

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
  const logs = await getLogs(client, {
    event,
  })
  expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0].topics).toEqualTypeOf<
    [`0x${string}`, `0x${string}`, `0x${string}`]
  >()
  expectTypeOf(logs[0].args).toEqualTypeOf<{
    from?: `0x${string}`
    to?: `0x${string}`
    value?: bigint
    foo?: string
    bar?: string
  }>()
})

test('event: defined inline', async () => {
  const logs = await getLogs(client, {
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
  expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0].topics).toEqualTypeOf<
    [`0x${string}`, `0x${string}`, `0x${string}`]
  >()
  expectTypeOf(logs[0].args).toEqualTypeOf<{
    from?: `0x${string}`
    to?: `0x${string}`
    value?: bigint
    foo?: string
    bar?: string
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
  const logs = await getLogs(client, {
    event,
  })
  expectTypeOf(logs[0].eventName).toEqualTypeOf<string>()
  expectTypeOf(logs[0].topics).toEqualTypeOf<
    [] | [`0x${string}`, ...`0x${string}`[]]
  >()
  expectTypeOf(logs[0].args).toEqualTypeOf<
    readonly unknown[] | Record<string, unknown>
  >()
})

test('inputs: no inputs', async () => {
  const logs = await getLogs(client, {
    event: {
      inputs: [],
      name: 'Transfer',
      type: 'event',
    },
  })
  expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0].topics).toEqualTypeOf<[`0x${string}`]>()
  expectTypeOf(logs[0].args).toEqualTypeOf<readonly []>()
})

test('strict: named', async () => {
  const logs = await getLogs(client, {
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
    strict: true,
  })
  expectTypeOf(logs[0].args).toEqualTypeOf<{
    from: `0x${string}`
    to: `0x${string}`
    value: bigint
    foo: string
    bar: string
  }>()
})

test('strict: unnamed', async () => {
  const logs = await getLogs(client, {
    event: {
      inputs: [
        {
          indexed: true,
          type: 'address',
        },
        {
          indexed: true,
          type: 'address',
        },
        {
          indexed: false,
          type: 'uint256',
        },
        {
          indexed: false,
          type: 'string',
        },
        {
          indexed: false,
          type: 'string',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    strict: true,
  })
  expectTypeOf(logs[0].args).toEqualTypeOf<
    readonly [`0x${string}`, `0x${string}`, bigint, string, string]
  >()
})

test('non-pending logs', async () => {
  const logs = await getLogs(client)
  expectTypeOf(logs[0].blockHash).toEqualTypeOf<Hex>()
  expectTypeOf(logs[0].blockNumber).toEqualTypeOf<bigint>()
  expectTypeOf(logs[0].logIndex).toEqualTypeOf<number>()
  expectTypeOf(logs[0].transactionHash).toEqualTypeOf<Hash>()
  expectTypeOf(logs[0].transactionIndex).toEqualTypeOf<number>()
})

test('pending logs', async () => {
  const logs_fromPending = await getLogs(client, { fromBlock: 'pending' })
  expectTypeOf(logs_fromPending[0].blockHash).toEqualTypeOf<Hex | null>()
  expectTypeOf(logs_fromPending[0].blockNumber).toEqualTypeOf<bigint | null>()
  expectTypeOf(logs_fromPending[0].logIndex).toEqualTypeOf<number | null>()
  expectTypeOf(logs_fromPending[0].transactionHash).toEqualTypeOf<Hash | null>()
  expectTypeOf(logs_fromPending[0].transactionIndex).toEqualTypeOf<
    number | null
  >()

  const logs_toPending = await getLogs(client, {
    toBlock: 'pending',
  })
  expectTypeOf(logs_toPending[0].blockHash).toEqualTypeOf<Hex | null>()
  expectTypeOf(logs_toPending[0].blockNumber).toEqualTypeOf<bigint | null>()
  expectTypeOf(logs_toPending[0].logIndex).toEqualTypeOf<number | null>()
  expectTypeOf(logs_toPending[0].transactionHash).toEqualTypeOf<Hash | null>()
  expectTypeOf(logs_toPending[0].transactionIndex).toEqualTypeOf<
    number | null
  >()

  const logs_bothPending = await getLogs(client, {
    fromBlock: 'pending',
    toBlock: 'pending',
  })
  expectTypeOf(logs_bothPending[0].blockHash).toEqualTypeOf<null>()
  expectTypeOf(logs_bothPending[0].blockNumber).toEqualTypeOf<null>()
  expectTypeOf(logs_bothPending[0].logIndex).toEqualTypeOf<null>()
  expectTypeOf(logs_bothPending[0].transactionHash).toEqualTypeOf<null>()
  expectTypeOf(logs_bothPending[0].transactionIndex).toEqualTypeOf<null>()
})
