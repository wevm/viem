import { Abi } from 'ox'
import type * as Address from 'ox/Address'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http, publicActions } from 'viem'
const client = Client.create({ transport: http() })

const abi = Abi.from([
  'function approve(address, uint256) returns (bool)',
  'function mint(uint256 tokenId) payable returns (uint256)',
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

test('infers functionName from nonpayable/payable functions', () => {
  expectTypeOf<
    Actions.contract.simulate.Options<typeof abi>['functionName']
  >().toEqualTypeOf<'approve' | 'mint'>()
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
  const decorated = Client.create({ transport: http() }).extend(publicActions())
  await decorated.contract.write(request)
})
