import * as Abi from 'ox/Abi'
import type * as Address from 'ox/Address'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http, publicActions } from 'viem'

const client = Client.create({ transport: http() })

const abi = Abi.from([
  'function approve(address, uint256) returns (bool)',
  'function mint(uint256 tokenId) payable',
  'function balanceOf(address) view returns (uint256)',
])

test('return type is bigint', () => {
  expectTypeOf<Actions.contract.estimateGas.ReturnType>().toEqualTypeOf<bigint>()
})

test('infers functionName from nonpayable/payable functions', () => {
  expectTypeOf<
    Actions.contract.estimateGas.Options<typeof abi>['functionName']
  >().toEqualTypeOf<'approve' | 'mint'>()
})

test('infers args from functionName', async () => {
  await Actions.contract.estimateGas(client, {
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
  })

  // @ts-expect-error missing args
  Actions.contract.estimateGas(client, {
    abi,
    address: '0x',
    functionName: 'approve',
  })

  Actions.contract.estimateGas(client, {
    abi,
    address: '0x',
    // @ts-expect-error view function not assignable
    functionName: 'balanceOf',
  })

  Actions.contract.estimateGas(client, {
    abi,
    address: '0x',
    // @ts-expect-error unknown function
    functionName: 'unknown',
  })
})

test('args are typed', () => {
  expectTypeOf<
    Actions.contract.estimateGas.Options<typeof abi, 'approve'>['args']
  >().toEqualTypeOf<readonly [Address.Address, bigint]>()
})

test('value: allowed on payable, rejected on nonpayable', () => {
  Actions.contract.estimateGas(client, {
    abi,
    address: '0x',
    args: [123n],
    functionName: 'mint',
    value: 5n,
  })

  Actions.contract.estimateGas(client, {
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
    // @ts-expect-error value not allowed on nonpayable function
    value: 5n,
  })
})

test('decorator: contract.estimateGas threads through publicActions', async () => {
  const decorated = Client.create({ transport: http() }).extend(publicActions())
  const gas = await decorated.contract.estimateGas({
    abi,
    address: '0x',
    args: ['0x', 123n],
    functionName: 'approve',
  })
  expectTypeOf(gas).toEqualTypeOf<bigint>()
})
