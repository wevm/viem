import type { Address, Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Client, http } from 'viem'
import { getStubData } from './getStubData.js'

const client = Client.create({ transport: http() })
const base = {
  callData: '0xdeadbeef',
  chainId: 1,
  entryPointAddress: '0x0000000000000000000000000000000000000000',
  nonce: 0n,
  sender: '0x0000000000000000000000000000000000000000',
} as const

type Metadata = {
  isFinal?: boolean | undefined
  sponsor?:
    | {
        icon?: string | undefined
        name: string
      }
    | undefined
}

test('entryPointVersion: 0.6', async () => {
  const result = await getStubData<'0.6'>(client, {
    ...base,
    initCode: '0x',
  })
  expectTypeOf(result).toEqualTypeOf<
    {
      paymasterAndData: Hex.Hex
    } & Metadata
  >()
})

test('entryPointVersion: 0.7', async () => {
  const result = await getStubData<'0.7'>(client, {
    ...base,
    factory: '0x0000000000000000000000000000000000000000',
  })
  expectTypeOf(result).toEqualTypeOf<
    {
      paymaster: Address.Address
      paymasterData: Hex.Hex
      paymasterPostOpGasLimit: bigint
      paymasterVerificationGasLimit?: bigint | undefined
    } & Metadata
  >()
})

test('entryPointVersion: 0.8', async () => {
  const result = await getStubData<'0.8'>(client, base)
  expectTypeOf(result).toEqualTypeOf<
    {
      paymaster: Address.Address
      paymasterData: Hex.Hex
      paymasterPostOpGasLimit: bigint
      paymasterVerificationGasLimit?: bigint | undefined
    } & Metadata
  >()
})

test('entryPointVersion: 0.9', async () => {
  const result = await getStubData<'0.9'>(client, {
    ...base,
    paymasterSignature: '0xcafebabe',
  })
  expectTypeOf(result).toEqualTypeOf<
    {
      paymaster: Address.Address
      paymasterData: Hex.Hex
      paymasterPostOpGasLimit: bigint
      paymasterSignature?: Hex.Hex | undefined
      paymasterVerificationGasLimit?: bigint | undefined
    } & Metadata
  >()
})
