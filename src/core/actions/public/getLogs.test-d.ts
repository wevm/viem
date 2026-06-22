import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Log from 'ox/Log'
import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'

import { getLogs } from './getLogs.js'

const client = Client.create({ transport: http() })

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)
const approvalEvent = AbiEvent.from(
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
)
const transferEventUnnamed = AbiEvent.from(
  'event Transfer(address indexed, address indexed, uint256)',
)

test('default: returns raw logs', async () => {
  const logs = await getLogs(client)
  expectTypeOf(logs).toEqualTypeOf<readonly Log.Log<false>[]>()
})

test('event: decodes args and eventName', async () => {
  const logs = await getLogs(client, { event: transferEvent })
  expectTypeOf(logs[0]!.eventName).toEqualTypeOf<'Transfer'>()
  // Non-strict (default) decoding makes every argument optional.
  expectTypeOf(logs[0]!.args).toEqualTypeOf<{
    from?: Address.Address
    to?: Address.Address
    value?: bigint
  }>()
})

test('event + strict: decoded args are required', async () => {
  const logs = await getLogs(client, { event: transferEvent, strict: true })
  expectTypeOf(logs[0]!.args).toEqualTypeOf<{
    from: Address.Address
    to: Address.Address
    value: bigint
  }>()
})

test('unnamed event: decoded args are positional', async () => {
  const looseLogs = await getLogs(client, { event: transferEventUnnamed })
  expectTypeOf(looseLogs[0]!.args).toEqualTypeOf<
    | readonly []
    | readonly [Address.Address]
    | readonly [Address.Address, Address.Address]
    | readonly [Address.Address, Address.Address, bigint]
  >()

  const strictLogs = await getLogs(client, {
    event: transferEventUnnamed,
    strict: true,
  })
  expectTypeOf(strictLogs[0]!.args).toEqualTypeOf<
    readonly [Address.Address, Address.Address, bigint]
  >()
})

test('args: indexed args accept single value or array (OR)', async () => {
  await getLogs(client, {
    event: transferEvent,
    args: { from: '0x', to: ['0x', '0x'] },
  })
})

test('events: union of decoded logs', async () => {
  const logs = await getLogs(client, {
    events: [transferEvent, approvalEvent],
  })
  expectTypeOf(logs[0]!.eventName).toEqualTypeOf<'Transfer' | 'Approval'>()
})

test('pending blockTag: threads pending into the log type', async () => {
  // Only `fromBlock` is pending, so `_pending` widens to `boolean`.
  const logs = await getLogs(client, { fromBlock: 'pending' })
  expectTypeOf(logs).toEqualTypeOf<readonly Log.Log<boolean>[]>()
})
