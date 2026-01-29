import type { TypedData } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { walletActions } from '../../clients/decorators/wallet.js'
import { type SignTypedDataParameters, signTypedData } from './signTypedData.js'

const client = anvilMainnet.getClient().extend(walletActions)

const types = {
  Name: [
    { name: 'first', type: 'string' },
    { name: 'last', type: 'string' },
  ],
  Person: [
    { name: 'name', type: 'Name' },
    { name: 'wallet', type: 'address' },
    { name: 'favoriteColors', type: 'string[3]' },
    { name: 'age', type: 'uint8' },
    { name: 'isCool', type: 'bool' },
  ],
  Mail: [
    { name: 'timestamp', type: 'uint256' },
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
    { name: 'hash', type: 'bytes' },
  ],
} as const
const account = {
  address: '0x',
  type: 'json-rpc',
} as const
const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000',
} as const

test('SignTypedDataParameters', () => {
  type Result = SignTypedDataParameters<typeof types, 'Mail'>
  expectTypeOf<Result['primaryType']>().toEqualTypeOf<
    'Mail' | 'Person' | 'Name'
  >()
  expectTypeOf<Result['message']>().toEqualTypeOf<{
    timestamp: bigint
    from: {
      name: { first: string; last: string }
      wallet: `0x${string}`
      favoriteColors: readonly [string, string, string]
      age: number
      isCool: boolean
    }
    to: {
      name: { first: string; last: string }
      wallet: `0x${string}`
      favoriteColors: readonly [string, string, string]
      age: number
      isCool: boolean
    }
    contents: string
    hash: `0x${string}`
  }>()
  expectTypeOf<Result['message']>().not.toEqualTypeOf<{
    name: { first: string; last: string }
    wallet: `0x${string}`
    favoriteColors: readonly [string, string, string]
    age: number
    isCool: boolean
  }>()
  expectTypeOf<Result['message']>().not.toEqualTypeOf<{
    first: string
    last: string
  }>()
})

test('using client', () => {
  const primaryType = 'Name'
  client.signTypedData({
    account,
    domain,
    types,
    primaryType,
    message: {
      first: 'Cow',
      last: 'Burns',
    },
  })
  type Result = Parameters<
    typeof client.signTypedData<typeof types, typeof primaryType>
  >[0]
  expectTypeOf<Result['message']>().toEqualTypeOf<{
    first: string
    last: string
  }>()
  expectTypeOf<Result['message']>().not.toEqualTypeOf<{
    name: { first: string; last: string }
    wallet: `0x${string}`
    favoriteColors: readonly [string, string, string]
    age: number
    isCool: boolean
  }>()
})

test('using function', () => {
  const primaryType = 'Name'
  signTypedData(client, {
    account,
    domain,
    types,
    primaryType,
    message: {
      first: 'Cow',
      last: 'Burns',
    },
  })
  type Result = Parameters<
    typeof client.signTypedData<typeof types, typeof primaryType>
  >[0]
  expectTypeOf<Result['message']>().toEqualTypeOf<{
    first: string
    last: string
  }>()
  expectTypeOf<Result['message']>().not.toEqualTypeOf<{
    name: { first: string; last: string }
    wallet: `0x${string}`
    favoriteColors: readonly [string, string, string]
    age: number
    isCool: boolean
  }>()
})

test('`types` not const asserted', () => {
  const primaryType = 'Name'
  const types_ = {
    Name: [
      { name: 'first', type: 'string' },
      { name: 'last', type: 'string' },
    ],
  }
  signTypedData(client, {
    account,
    domain,
    types: types_,
    primaryType,
    message: {
      first: 'Cow',
      last: 'Burns',
    },
  })
  type Result = Parameters<
    typeof client.signTypedData<typeof types_, typeof primaryType>
  >[0]
  expectTypeOf<Result['message']>().toEqualTypeOf<Record<string, unknown>>()
})

test('`types` declared as `TypedData`', () => {
  const primaryType = 'Name'
  const types_: TypedData = {
    Name: [
      { name: 'first', type: 'string' },
      { name: 'last', type: 'string' },
    ],
  }
  signTypedData(client, {
    account,
    domain,
    types: types_,
    primaryType,
    message: {
      first: 'Cow',
      last: 'Burns',
    },
  })
  type Result = Parameters<
    typeof client.signTypedData<typeof types_, typeof primaryType>
  >[0]
  expectTypeOf<Result['message']>().toEqualTypeOf<Record<string, unknown>>()
})
