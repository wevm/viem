import { Abi } from 'ox'
import type * as Address from 'ox/Address'
import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'

import { readContract } from './readContract.js'

const client = Client.create({ transport: http() })

const abi = Abi.from([
  'function name() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
])

test('infers return type from functionName', async () => {
  const name = await readContract(client, {
    abi,
    address: '0x',
    functionName: 'name',
  })
  expectTypeOf(name).toEqualTypeOf<string>()

  const balance = await readContract(client, {
    abi,
    address: '0x',
    args: ['0x'],
    functionName: 'balanceOf',
  })
  expectTypeOf(balance).toEqualTypeOf<bigint>()
})

test('infers args from functionName', async () => {
  await readContract(client, {
    abi,
    address: '0x',
    args: ['0x'],
    functionName: 'balanceOf',
  })

  // @ts-expect-error missing args
  readContract(client, { abi, address: '0x', functionName: 'balanceOf' })

  // @ts-expect-error unknown function
  readContract(client, { abi, address: '0x', functionName: 'unknown' })
})

test('args are typed', () => {
  expectTypeOf<
    readContract.Options<typeof abi, 'balanceOf'>['args']
  >().toEqualTypeOf<readonly [Address.Address]>()
})
