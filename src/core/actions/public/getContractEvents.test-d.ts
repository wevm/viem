import { Actions } from 'viem'
import { Abi } from 'viem/utils'
import { expectTypeOf, test } from 'vitest'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

const abi = Abi.from([
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
])

test('args: abi', async () => {
  const logs = await Actions.getContractEvents(client, {
    abi,
    args: {},
    strict: true,
  })

  expectTypeOf(logs[0]!.eventName).toEqualTypeOf<
    'Approval' | 'ApprovalForAll' | 'Transfer'
  >()
  expectTypeOf(
    logs[0]!.eventName === 'Approval' && logs[0]!.args,
  ).toEqualTypeOf<
    false | { owner: `0x${string}`; approved: `0x${string}`; tokenId: bigint }
  >()
  expectTypeOf(
    logs[0]!.eventName === 'ApprovalForAll' && logs[0]!.args,
  ).toEqualTypeOf<
    false | { owner: `0x${string}`; operator: `0x${string}`; approved: boolean }
  >()
  expectTypeOf(
    logs[0]!.eventName === 'Transfer' && logs[0]!.args,
  ).toEqualTypeOf<
    false | { from: `0x${string}`; to: `0x${string}`; tokenId: bigint }
  >()
})

test('args: abi, eventName', async () => {
  const logs = await Actions.getContractEvents(client, {
    abi,
    args: { from: '0x' },
    eventName: 'Transfer',
    strict: true,
  })

  expectTypeOf(logs[0]!.eventName).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0]!.args).toEqualTypeOf<{
    from: `0x${string}`
    to: `0x${string}`
    tokenId: bigint
  }>()
})
