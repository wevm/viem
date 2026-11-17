import { AbiEvent } from 'ox'
import type { Address, Log } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http, publicActions } from 'viem'
const client = Client.create({ transport: http() })

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)
const approvalEvent = AbiEvent.from(
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
)

test('default: yields pages of raw logs', async () => {
  for await (const page of Actions.event.iterateLogs(client, {
    fromBlock: 0n,
  })) {
    expectTypeOf(page.endBlock).toEqualTypeOf<bigint>()
    expectTypeOf(page.fromBlock).toEqualTypeOf<bigint>()
    expectTypeOf(page.toBlock).toEqualTypeOf<bigint>()
    expectTypeOf(page.logs).toEqualTypeOf<readonly Log.Log<false>[]>()
  }
})

test('event: decodes args and eventName', async () => {
  for await (const page of Actions.event.iterateLogs(client, {
    args: { from: '0x' },
    event: transferEvent,
    fromBlock: 0n,
  })) {
    expectTypeOf(page.logs[0]!.eventName).toEqualTypeOf<'Transfer'>()
    expectTypeOf(page.logs[0]!.args).toEqualTypeOf<{
      from?: Address.Address | undefined
      to?: Address.Address | undefined
      value?: bigint | undefined
    }>()
    expectTypeOf(page.logs[0]!.blockNumber).toEqualTypeOf<bigint>()
  }
})

test('decorator: events, strict', async () => {
  for await (const page of client.extend(publicActions()).event.iterateLogs({
    events: [transferEvent, approvalEvent],
    fromBlock: 0n,
    strict: true,
  })) {
    expectTypeOf(page.logs[0]!.eventName).toEqualTypeOf<
      'Transfer' | 'Approval'
    >()
  }
})

test('options: rejects invalid block ranges', () => {
  // @ts-expect-error `fromBlock` is required.
  Actions.event.iterateLogs(client, {})
  // @ts-expect-error `fromBlock` must be a block number.
  Actions.event.iterateLogs(client, { fromBlock: 'latest' })
  Actions.event.iterateLogs(client, {
    fromBlock: 0n,
    // @ts-expect-error `toBlock` cannot be pending.
    toBlock: 'pending',
  })
})
