import type { Address } from 'abitype'
import { parseAbi, parseAbiItem, publicActions } from 'viem'
import { iterateLogs } from 'viem/actions'
import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'

const client = anvilMainnet.getClient()

test('event', async () => {
  for await (const page of iterateLogs(client, {
    event: parseAbiItem(
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ),
    args: { from: '0x' },
    fromBlock: 0n,
  })) {
    expectTypeOf(page.fromBlock).toEqualTypeOf<bigint>()
    expectTypeOf(page.toBlock).toEqualTypeOf<bigint>()
    expectTypeOf(page.endBlock).toEqualTypeOf<bigint>()
    expectTypeOf(page.logs[0]!.eventName).toEqualTypeOf<'Transfer'>()
    expectTypeOf(page.logs[0]!.args).toEqualTypeOf<{
      from?: Address | undefined
      to?: Address | undefined
      value?: bigint | undefined
    }>()
    expectTypeOf(page.logs[0]!.blockNumber).toEqualTypeOf<bigint>()
  }
})

test('decorator: events, strict', async () => {
  for await (const page of client.extend(publicActions).iterateLogs({
    events: parseAbi([
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'event Approval(address indexed owner, address indexed spender, uint256 value)',
    ]),
    fromBlock: 0n,
    strict: true,
  })) {
    expectTypeOf(page.logs[0]!.eventName).toEqualTypeOf<
      'Transfer' | 'Approval'
    >()
  }
})
