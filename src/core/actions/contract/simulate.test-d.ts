import { Abi } from 'ox'
import type { Address } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http, publicActions, walletActions } from 'viem'
const client = Client.create({ transport: http() })

const abi = Abi.from([
  'function approve(address, uint256) returns (bool)',
  'function mint(uint256 tokenId) payable returns (uint256)',
  'function quote() returns (uint256 amount, bool valid)',
  'function balanceOf(address) view returns (uint256)',
])

test('infers result type from functionName', async () => {
  const { result } = await Actions.contract.simulate(client, {
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
  })
  expectTypeOf(result).toEqualTypeOf<boolean>()
})

test('infers object and array result shapes', async () => {
  const object = await Actions.contract.simulate(client, {
    abi,
    address: '0x',
    functionName: 'quote',
  })
  expectTypeOf(object.result).toEqualTypeOf<{
    amount: bigint
    valid: boolean
  }>()

  const array = await Actions.contract.simulate(client, {
    abi,
    address: '0x',
    as: 'Array',
    functionName: 'quote',
  })
  expectTypeOf(array.result).toEqualTypeOf<readonly [bigint, boolean]>()
  expectTypeOf(array.request).not.toHaveProperty('as')
})

test('decorator: contract.simulate threads as through publicActions', async () => {
  const decorated = Client.create({ transport: http() }).extend(publicActions())

  const object = await decorated.contract.simulate({
    abi,
    address: '0x',
    functionName: 'quote',
  })
  expectTypeOf(object.result).toEqualTypeOf<{
    amount: bigint
    valid: boolean
  }>()

  const array = await decorated.contract.simulate({
    abi,
    address: '0x',
    as: 'Array',
    functionName: 'quote',
  })
  expectTypeOf(array.result).toEqualTypeOf<readonly [bigint, boolean]>()
  expectTypeOf(array.request).not.toHaveProperty('as')
})

test('infers functionName from nonpayable/payable functions', () => {
  expectTypeOf<
    Actions.contract.simulate.Options<typeof abi>['functionName']
  >().toEqualTypeOf<'approve' | 'mint' | 'quote'>()
})

test('infers args from functionName', async () => {
  await Actions.contract.simulate(client, {
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
  })

  // @ts-expect-error missing args
  Actions.contract.simulate(client, {
    abi,
    address: '0x',
    functionName: 'approve',
  })

  Actions.contract.simulate(client, {
    abi,
    address: '0x',
    // @ts-expect-error view function not assignable
    functionName: 'balanceOf',
  })
})

test('args are typed', () => {
  expectTypeOf<
    Actions.contract.simulate.Options<typeof abi, 'approve'>['args']
  >().toEqualTypeOf<readonly [Address.Address, bigint]>()
})

test('value: allowed on payable, rejected on nonpayable', () => {
  Actions.contract.simulate(client, {
    abi,
    address: '0x',
    args: [123n],
    functionName: 'mint',
    value: 5n,
  })

  Actions.contract.simulate(client, {
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
    // @ts-expect-error value not allowed on nonpayable function
    value: 5n,
  })
})

test('request is assignable to write', async () => {
  const { request } = await Actions.contract.simulate(client, {
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
  })
  const decorated = Client.create({ transport: http() })
    .extend(publicActions())
    .extend(walletActions())
  await decorated.contract.write(request)
  await decorated.contract.writeSync(request)
})
