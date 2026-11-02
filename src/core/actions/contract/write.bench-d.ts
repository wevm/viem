import { attest } from '@ark/attest'
import { Abi } from 'ox'
import type { Hex } from 'ox'
import { test } from 'vitest'

import { Actions, Client, http } from 'viem'
import { Abis } from 'viem/utils'

const client = Client.create({ transport: http('https://cloudflare-eth.com') })

// Calls stay wrapped in uninvoked closures; only inference cost is measured.
test('return type', () => {
  const res = () =>
    Actions.contract.write(client, {
      abi: Abis.erc20,
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', 1n],
      functionName: 'approve',
    })
  attest.instantiations([42887, 'instantiations'])
  attest<() => Promise<Hex.Hex>>(res)
})

const abi = Abi.from([
  'function foo() returns (int8)',
  'function foo(address account) returns (string)',
  'function foo(address sender, address account) returns ((address foo, address bar))',
  'function bar() returns (int8)',
])

test('overloads', () => {
  const res = () =>
    Actions.contract.write(client, {
      abi,
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
      functionName: 'foo',
    })
  attest.instantiations([49920, 'instantiations'])
  attest<() => Promise<Hex.Hex>>(res)
})
