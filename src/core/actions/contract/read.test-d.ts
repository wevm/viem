import { Abi } from 'ox'
import type { Address } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http } from 'viem'
const client = Client.create({ transport: http() })

const abi = Abi.from([
  'function name() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
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
