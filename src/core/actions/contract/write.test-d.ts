import { Abi } from 'ox'
import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http, walletActions } from 'viem'
const client = Client.create({ transport: http() })

const abi = Abi.from([
  'function approve(address, uint256) returns (bool)',
  'function mint(uint256 tokenId) payable',
  'function balanceOf(address) view returns (uint256)',
])

test('return type is Hex', () => {
  expectTypeOf<Actions.contract.write.ReturnType>().toEqualTypeOf<Hex.Hex>()
})

test('infers functionName from nonpayable/payable functions', () => {
  expectTypeOf<
    Actions.contract.write.Options<typeof abi>['functionName']
  >().toEqualTypeOf<'approve' | 'mint'>()
})

test('infers args from functionName', async () => {
  await Actions.contract.write(client, {
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
  })

  // @ts-expect-error missing args
  Actions.contract.write(client, {
    abi,
    address: '0x',
    functionName: 'approve',
  })

  Actions.contract.write(client, {
    abi,
    address: '0x',
    // @ts-expect-error view function not assignable
    functionName: 'balanceOf',
  })

  Actions.contract.write(client, {
    abi,
    address: '0x',
    // @ts-expect-error unknown function
    functionName: 'unknown',
  })
})

test('args are typed', () => {
  expectTypeOf<
    Actions.contract.write.Options<typeof abi, 'approve'>['args']
  >().toEqualTypeOf<readonly [Address.Address, bigint]>()
})

test('value: allowed on payable, rejected on nonpayable', () => {
  Actions.contract.write(client, {
    abi,
    address: '0x',
    args: [123n],
    functionName: 'mint',
    value: 5n,
  })

  Actions.contract.write(client, {
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
    // @ts-expect-error value not allowed on nonpayable function
    value: 5n,
  })
})

test('overloads: selects args from matching overload', () => {
  const abi = Abi.from([
    'function foo() returns (int8)',
    'function foo(address account) returns (string)',
    'function foo(address sender, address account) returns ((address foo, address bar))',
  ])

  Actions.contract.write(client, { abi, address: '0x', functionName: 'foo' })

  Actions.contract.write(client, {
    abi,
    address: '0x',
    args: ['0x'],
    functionName: 'foo',
  })
  Actions.contract.write(client, {
    abi,
    address: '0x',
    // @ts-expect-error wrong arg type
    args: [123n],
    functionName: 'foo',
  })

  Actions.contract.write(client, {
    abi,
    address: '0x',
    args: ['0x', '0x'],
    functionName: 'foo',
  })
  Actions.contract.write(client, {
    abi,
    address: '0x',
    // @ts-expect-error wrong arg type
    args: ['0x', 123n],
    functionName: 'foo',
  })
})

test('decorator: contract.write threads through walletActions', async () => {
  const decorated = Client.create({ transport: http() }).extend(walletActions())
  const hash = await decorated.contract.write({
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
  })
  expectTypeOf(hash).toEqualTypeOf<Hex.Hex>()
})
