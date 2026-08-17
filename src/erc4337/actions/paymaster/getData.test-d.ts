import type { Address, Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'
import { getData } from './getData.js'

const client = Client.create({ transport: http() })
const base = {
  callData: '0xdeadbeef',
  chainId: 1,
  entryPointAddress: '0x0000000000000000000000000000000000000000',
  nonce: 0n,
  sender: '0x0000000000000000000000000000000000000000',
} as const

test('entryPointVersion: 0.6', async () => {
  const result = await getData<'0.6'>(client, {
    ...base,
    initCode: '0x',
  })
  expectTypeOf(result).toEqualTypeOf<{
    paymasterAndData: Hex.Hex
  }>()
})

test('entryPointVersion: 0.7', async () => {
  const result = await getData<'0.7'>(client, {
    ...base,
    factory: '0x0000000000000000000000000000000000000000',
  })
  expectTypeOf(result).toEqualTypeOf<{
    paymaster: Address.Address
    paymasterData: Hex.Hex
    paymasterPostOpGasLimit?: bigint | undefined
    paymasterVerificationGasLimit?: bigint | undefined
  }>()
})

test('entryPointVersion: 0.8', async () => {
  const result = await getData<'0.8'>(client, base)
  expectTypeOf(result).toEqualTypeOf<{
    paymaster: Address.Address
    paymasterData: Hex.Hex
    paymasterPostOpGasLimit?: bigint | undefined
    paymasterVerificationGasLimit?: bigint | undefined
  }>()
})

test('entryPointVersion: 0.9', async () => {
  const result = await getData<'0.9'>(client, {
    ...base,
    paymasterSignature: '0xcafebabe',
  })
  expectTypeOf(result).toEqualTypeOf<{
    paymaster: Address.Address
    paymasterData: Hex.Hex
    paymasterPostOpGasLimit?: bigint | undefined
    paymasterSignature?: Hex.Hex | undefined
    paymasterVerificationGasLimit?: bigint | undefined
  }>()
})

test('version-specific options', () => {
  getData<'0.6'>(client, {
    ...base,
    // @ts-expect-error `factory` is unsupported by EntryPoint 0.6.
    factory: '0x0000000000000000000000000000000000000000',
  })
  getData<'0.7'>(client, {
    ...base,
    // @ts-expect-error `initCode` is only supported by EntryPoint 0.6.
    initCode: '0x',
  })
})
