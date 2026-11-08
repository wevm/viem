import { Abi } from 'ox'
import type { Address, Authorization, Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { http } from 'viem'
import * as BundlerClient from '../../BundlerClient.js'
import * as EntryPoint from '../../EntryPoint.js'
import type * as Simple7702SmartAccount from '../../Simple7702SmartAccount.js'
import type * as SoladySmartAccount from '../../SoladySmartAccount.js'
import type * as UserOperationGas from '../../UserOperationGas.js'
import { estimateGas } from './estimateGas.js'
import { prepare } from './prepare.js'
import { send } from './send.js'

const address = '0x0000000000000000000000000000000000000001'
const abi = Abi.from(['function approve(address spender, uint256 amount)'])

declare const account08: Simple7702SmartAccount.Account
declare const account09: Simple7702SmartAccount.Account<'0.9'>
declare const account06: SoladySmartAccount.Account<
  Address.Address,
  typeof EntryPoint.abiV06,
  '0.6'
>

test('account-bound EntryPoint 0.8', async () => {
  const client = BundlerClient.create({ account: account08, transport: http() })
  const operation = await prepare(client, { calls: [{ to: address }] })
  const gas = await estimateGas(client, { calls: [{ to: address }] })

  expectTypeOf(operation.authorization).toEqualTypeOf<
    Authorization.Signed | undefined
  >()
  expectTypeOf(operation.factory).toEqualTypeOf<Address.Address | undefined>()
  expectTypeOf(operation.factoryData).toEqualTypeOf<Hex.Hex | undefined>()
  expectTypeOf(operation.signature).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(gas).toEqualTypeOf<UserOperationGas.V08>()
  // @ts-expect-error `initCode` is an EntryPoint 0.6 field.
  void operation.initCode
})

test('account override narrows the EntryPoint version', async () => {
  const client = BundlerClient.create({ account: account08, transport: http() })
  const operation = await prepare(client, {
    account: account06,
    calls: [{ to: address }],
  })
  const gas = await estimateGas(client, {
    account: account06,
    calls: [{ to: address }],
  })

  expectTypeOf(operation.initCode).toEqualTypeOf<Hex.Hex | undefined>()
  expectTypeOf(operation.paymasterAndData).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(gas).toEqualTypeOf<UserOperationGas.V06>()
  // @ts-expect-error `authorization` is an EntryPoint 0.8 field.
  void operation.authorization
  // @ts-expect-error Split factory fields are EntryPoint 0.7 and 0.8 fields.
  void operation.factory
})

test('account-bound EntryPoint 0.9', async () => {
  const client = BundlerClient.create({ account: account09, transport: http() })
  const operation = await prepare(client, {
    calls: [{ to: address }],
    paymasterSignature: '0xcafebabe',
  })
  const gas = await estimateGas(client, { calls: [{ to: address }] })

  expectTypeOf(operation.authorization).toEqualTypeOf<
    Authorization.Signed | undefined
  >()
  expectTypeOf(operation.paymasterSignature).toEqualTypeOf<
    Hex.Hex | undefined
  >()
  expectTypeOf(gas).toEqualTypeOf<UserOperationGas.V09>()
})

test('call ABI arguments are inferred', async () => {
  const client = BundlerClient.create({ account: account08, transport: http() })

  await prepare(client, {
    calls: [
      {
        abi,
        args: [address, 1n],
        functionName: 'approve',
        to: address,
      },
    ],
  })

  await prepare(client, {
    calls: [
      {
        abi,
        // @ts-expect-error `approve` expects address then uint256.
        args: [1n, address],
        functionName: 'approve',
        to: address,
      },
    ],
  })
})

test('bound call ABI arguments are inferred', async () => {
  const client = BundlerClient.create({ account: account08, transport: http() })

  await client.userOperation.prepare({
    calls: [
      {
        abi,
        // @ts-expect-error `approve` expects address then uint256.
        args: [1n, address],
        functionName: 'approve',
        to: address,
      },
    ],
  })
})

test('selected parameters narrow the return type', async () => {
  const client = BundlerClient.create({ account: account08, transport: http() })
  const operation = await prepare(client, {
    calls: [{ to: address }],
    parameters: ['gas'],
  })

  expectTypeOf(operation.callGasLimit).toEqualTypeOf<bigint>()
  expectTypeOf(operation.preVerificationGas).toEqualTypeOf<bigint>()
  expectTypeOf(operation.verificationGasLimit).toEqualTypeOf<bigint>()
  // @ts-expect-error Signature was not selected.
  void operation.signature
  // @ts-expect-error Factory fields were not selected.
  void operation.factory
  // @ts-expect-error Nonce was not selected.
  void operation.nonce
})

test('raw operation path', async () => {
  const client = BundlerClient.create({ transport: http() })
  const operation = {
    callData: '0x',
    callGasLimit: 1n,
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 1n,
    nonce: 0n,
    preVerificationGas: 1n,
    sender: address,
    signature: '0x',
    verificationGasLimit: 1n,
  } as const

  const hash = await send(client, {
    ...operation,
    entryPointAddress: EntryPoint.addressV08,
  })
  expectTypeOf(hash).toEqualTypeOf<Hex.Hex>()

  const gas = await estimateGas(client, {
    ...operation,
    entryPointAddress: EntryPoint.addressV08,
  })
  expectTypeOf(gas).toEqualTypeOf<
    UserOperationGas.UserOperationGas<'0.6' | '0.7' | '0.8' | '0.9'>
  >()
})

test('an account-free client requires an EntryPoint address', () => {
  const client = BundlerClient.create({ transport: http() })
  const operation = {
    callData: '0x',
    callGasLimit: 1n,
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 1n,
    nonce: 0n,
    preVerificationGas: 1n,
    sender: address,
    signature: '0x',
    verificationGasLimit: 1n,
  } as const

  // @ts-expect-error Raw sends require an EntryPoint address.
  send(client, operation)
  // @ts-expect-error Raw estimates require an EntryPoint address.
  estimateGas(client, operation)
})
