import * as AbiEvent from 'ox/AbiEvent'
import type * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'
import { Actions, Client, http } from 'viem'
import { expectTypeOf, test } from 'vitest'

const client = Client.create({ transport: http() })

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

test('event: onLogs receives decoded logs', () => {
  const watch = Actions.event.watch(client, { event: transferEvent })
  type logs = Parameters<Parameters<typeof watch.onLogs>[0]>[0]
  expectTypeOf<logs[number]['eventName']>().toEqualTypeOf<'Transfer'>()
  expectTypeOf<logs[number]['args']>().toMatchTypeOf<{
    from?: `0x${string}` | undefined
  }>()
})

test('no-event: onLogs receives raw logs', () => {
  const watch = Actions.event.watch(client)
  type logs = Parameters<Parameters<typeof watch.onLogs>[0]>[0]
  expectTypeOf<logs>().toMatchTypeOf<readonly Log.Log[]>()
})

test('event and events are mutually exclusive', () => {
  Actions.event.watch(client, {
    event: transferEvent,
    // @ts-expect-error cannot pass both `event` and `events`
    events: [transferEvent],
  })
})

test('args are typed from the event', () => {
  Actions.event.watch(client, {
    args: { from: '0x' as Hex.Hex },
    event: transferEvent,
  })
})
