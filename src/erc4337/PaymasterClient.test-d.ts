import type { Address, Hex } from 'ox'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { http } from 'viem'
import * as PaymasterClient from './PaymasterClient.js'

const client = PaymasterClient.create({ transport: http() })
const base = {
  callData: '0xdeadbeef',
  chainId: 1,
  entryPointAddress: '0x0000000000000000000000000000000000000000',
  nonce: 0n,
  sender: '0x0000000000000000000000000000000000000000',
} as const

test('decorator', async () => {
  const data06 = await client.paymaster.getData<'0.6'>({
    ...base,
    initCode: '0x',
  })
  expectTypeOf(data06).toEqualTypeOf<{ paymasterAndData: Hex.Hex }>()

  const data08 = await client.paymaster.getData<'0.8'>(base)
  expectTypeOf(data08).toEqualTypeOf<{
    paymaster: Address.Address
    paymasterData: Hex.Hex
    paymasterPostOpGasLimit?: bigint | undefined
    paymasterVerificationGasLimit?: bigint | undefined
  }>()

  const data09 = await client.paymaster.getData<'0.9'>(base)
  expectTypeOf(data09.paymasterSignature).toEqualTypeOf<Hex.Hex | undefined>()

  expectTypeOf(client.paymaster.getStubData).toBeFunction()
})

test('extend', () => {
  const extended = client.extend(() => ({ custom: { value: 1 as const } }))
  expectTypeOf(extended.custom.value).toEqualTypeOf<1>()
  expectTypeOf(extended.paymaster.getData).toBeFunction()
})

test('request: custom Zod schema preserves the Paymaster schema', async () => {
  const schema = z.RpcSchema.from({
    pm_custom: { params: z.tuple([z.string()]), returns: z.number() },
  })
  const client = PaymasterClient.create({ schema, transport: http() })

  const custom = await client.request({
    method: 'pm_custom',
    params: ['hello'],
  })
  expectTypeOf(custom).toEqualTypeOf<number>()

  const data = await client.request({
    method: 'pm_getPaymasterData',
    params: [
      {
        callData: '0x',
        callGasLimit: '0x0',
        nonce: '0x0',
        preVerificationGas: '0x0',
        sender: base.sender,
        verificationGasLimit: '0x0',
      },
      base.entryPointAddress,
      '0x1',
      undefined,
    ],
  })
  if ('paymasterAndData' in data)
    expectTypeOf(data.paymasterAndData).toEqualTypeOf<Hex.Hex>()
})
