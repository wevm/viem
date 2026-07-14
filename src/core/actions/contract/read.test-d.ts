import { Abi } from 'ox'
import type { Address } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http } from 'viem'
const client = Client.create({ transport: http() })

const abi = Abi.from([
  'function name() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function metadata() view returns (string name, string symbol)',
  'function mixed() view returns (uint256 value, bool)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function unnamed() view returns (uint256, bool)',
])

test('infers return type from functionName', async () => {
  const name = await Actions.contract.read(client, {
    abi,
    address: '0x',
    functionName: 'name',
  })
  expectTypeOf(name).toEqualTypeOf<string>()

  const balance = await Actions.contract.read(client, {
    abi,
    address: '0x',
    args: ['0x'],
    functionName: 'balanceOf',
  })
  expectTypeOf(balance).toEqualTypeOf<bigint>()
})

test('infers object and array return shapes', async () => {
  const object = await Actions.contract.read(client, {
    abi,
    address: '0x',
    functionName: 'metadata',
  })
  expectTypeOf(object).toEqualTypeOf<{ name: string; symbol: string }>()

  const array = await Actions.contract.read(client, {
    abi,
    address: '0x',
    as: 'Array',
    functionName: 'metadata',
  })
  expectTypeOf(array).toEqualTypeOf<readonly [string, string]>()
})

test('infers numeric object keys for unnamed outputs', async () => {
  const result = await Actions.contract.read(client, {
    abi,
    address: '0x',
    functionName: 'unnamed',
  })
  expectTypeOf(result).toEqualTypeOf<{ 0: bigint; 1: boolean }>()
})

test('infers names and numeric object keys for mixed outputs', async () => {
  const result = await Actions.contract.read(client, {
    abi,
    address: '0x',
    functionName: 'mixed',
  })
  expectTypeOf(result).toEqualTypeOf<{ value: bigint; 1: boolean }>()
})

test('infers args from functionName', async () => {
  await Actions.contract.read(client, {
    abi,
    address: '0x',
    args: ['0x'],
    functionName: 'balanceOf',
  })

  // @ts-expect-error missing args
  Actions.contract.read(client, {
    abi,
    address: '0x',
    functionName: 'balanceOf',
  })

  // @ts-expect-error unknown function
  Actions.contract.read(client, { abi, address: '0x', functionName: 'unknown' })
})

test('args are typed', () => {
  expectTypeOf<
    Actions.contract.read.Options<typeof abi, 'balanceOf'>['args']
  >().toEqualTypeOf<readonly [Address.Address]>()
})
