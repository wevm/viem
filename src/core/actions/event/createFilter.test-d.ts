import { AbiEvent } from 'ox'
import type { Hex, Log } from 'ox'
import { Actions, Client, http } from 'viem'
import { expectTypeOf, test } from 'vitest'

import type { getChanges } from '../filter/getChanges.js'

const client = Client.create({ transport: http() })

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

test('default: filter carries no decode inputs', async () => {
  const filter = await Actions.event.createFilter(client)
  expectTypeOf(filter.type).toEqualTypeOf<'event'>()
})

test('event: filter feeds decoded logs into getChanges', async () => {
  const filter = await Actions.event.createFilter(client, {
    event: transferEvent,
  })
  type result = getChanges.ReturnType<typeof filter.type, typeof transferEvent>
  expectTypeOf<result[number]['eventName']>().toEqualTypeOf<'Transfer'>()
  expectTypeOf<result[number]['args']>().toMatchTypeOf<{
    from?: `0x${string}` | undefined
  }>()
})

test('events: array form is accepted', async () => {
  const filter = await Actions.event.createFilter(client, {
    events: [transferEvent],
  })
  expectTypeOf(filter.type).toEqualTypeOf<'event'>()
})

test('event and events are mutually exclusive', async () => {
  await Actions.event.createFilter(client, {
    event: transferEvent,
    // @ts-expect-error cannot pass both `event` and `events`
    events: [transferEvent],
  })
})

test('no-event filter changes are raw logs', () => {
  expectTypeOf<getChanges.ReturnType<'event'>>().toMatchTypeOf<
    readonly Log.Log[]
  >()
})

test('args are typed from the event', async () => {
  await Actions.event.createFilter(client, {
    args: { from: '0x' as Hex.Hex },
    event: transferEvent,
  })
})
