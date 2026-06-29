import * as AbiEvent from 'ox/AbiEvent'
import type * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'
import { Client, http, publicActions } from 'viem'
import { expectTypeOf, test } from 'vitest'

import type { getChanges } from './getChanges.js'
import type { getLogs } from './getLogs.js'

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

test('block filter: return type is a list of hashes', () => {
  expectTypeOf<getChanges.ReturnType<'block'>>().toEqualTypeOf<
    readonly Hex.Hex[]
  >()
})

test('transaction filter: return type is a list of hashes', () => {
  expectTypeOf<getChanges.ReturnType<'transaction'>>().toEqualTypeOf<
    readonly Hex.Hex[]
  >()
})

test('event filter (no event): return type is a list of raw logs', () => {
  expectTypeOf<getChanges.ReturnType<'event'>>().toMatchTypeOf<
    readonly Log.Log[]
  >()
})

test('event filter: return type is a list of decoded logs', () => {
  type result = getChanges.ReturnType<'event', typeof transferEvent>
  expectTypeOf<result[number]['eventName']>().toEqualTypeOf<'Transfer'>()
  expectTypeOf<result[number]['args']>().toMatchTypeOf<{
    from?: `0x${string}` | undefined
    to?: `0x${string}` | undefined
    value?: bigint | undefined
  }>()
})

test('getLogs: return type is a list of decoded logs', () => {
  type result = getLogs.ReturnType<typeof transferEvent>
  expectTypeOf<result[number]['eventName']>().toEqualTypeOf<'Transfer'>()
})

test('decorator: getChanges discriminates on filter type', () => {
  const client = Client.create({ transport: http() }).extend(publicActions())

  expectTypeOf(
    client.filter.getChanges({
      filter: {} as { id: Hex.Hex; request: any; type: 'block' },
    }),
  ).resolves.toEqualTypeOf<readonly Hex.Hex[]>()
})

test('getLogs rejects non-event filters', () => {
  const client = Client.create({ transport: http() }).extend(publicActions())

  client.filter.getLogs({
    // @ts-expect-error block filters have no logs to fetch
    filter: { id: '0x', request: undefined as never, type: 'block' },
  })
})
