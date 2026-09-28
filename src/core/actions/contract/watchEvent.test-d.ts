import type { Hex } from 'ox'
import { Actions, Client, http } from 'viem'
import { Abi } from 'viem/utils'
import { expectTypeOf, test } from 'vitest'

const client = Client.create({ transport: http() })

const abi = Abi.from([
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
])

test('eventName: onLogs receives decoded logs', () => {
  const watch = Actions.contract.watchEvent(client, {
    abi,
    eventName: 'Transfer',
  })
  type logs = Parameters<Parameters<typeof watch.onLogs>[0]>[0]
  expectTypeOf<logs[number]['eventName']>().toEqualTypeOf<'Transfer'>()
  expectTypeOf<logs[number]['args']>().toMatchTypeOf<{
    from?: `0x${string}` | undefined
  }>()
})

test('no eventName: onLogs receives a union of decoded logs', () => {
  const watch = Actions.contract.watchEvent(client, { abi })
  type logs = Parameters<Parameters<typeof watch.onLogs>[0]>[0]
  expectTypeOf<logs[number]['eventName']>().toEqualTypeOf<
    'Approval' | 'Transfer'
  >()
})

test('args are typed from the event', () => {
  Actions.contract.watchEvent(client, {
    abi,
    args: { from: '0x' as Hex.Hex },
    eventName: 'Transfer',
  })
})
