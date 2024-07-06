import { describe, expectTypeOf, test } from 'vitest'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../../test/src/smartAccounts.js'
import type { Hex } from '../../../types/misc.js'
import type { UserOperation } from '../types/userOperation.js'
import { prepareUserOperationRequest } from './prepareUserOperationRequest.js'

const bundlerClient = bundlerMainnet.getBundlerClient()

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    const result = await prepareUserOperationRequest(bundlerClient, {
      account,
      calls: [{ to: '0x' }],
    })

    expectTypeOf(result.account).toMatchTypeOf(account)
    expectTypeOf(result.callData).toMatchTypeOf<Hex>()
    expectTypeOf(result.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.factory).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.factoryData).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result.paymasterPostOpGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.paymasterVerificationGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.sender).toMatchTypeOf<Hex>()
  })

  test('cast (widened)', async () => {
    const result = await prepareUserOperationRequest(bundlerClient, {
      account,
      ...({} as UserOperation),
    })

    expectTypeOf(result.initCode).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.factory).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.factoryData).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.paymasterAndData).toMatchTypeOf<Hex | undefined>()

    expectTypeOf(result.account).toMatchTypeOf(account)
    expectTypeOf(result.callData).toMatchTypeOf<Hex>()
    expectTypeOf(result.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result.paymasterPostOpGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.paymasterVerificationGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.sender).toMatchTypeOf<Hex>()
  })

  test('cast (narrowed)', async () => {
    const result = await prepareUserOperationRequest(bundlerClient, {
      account,
      ...({} as UserOperation<'0.7'>),
    })

    // @ts-expect-error
    result.initCode

    expectTypeOf(result.factory).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.factoryData).toMatchTypeOf<Hex | undefined>()

    expectTypeOf(result.account).toMatchTypeOf(account)
    expectTypeOf(result.callData).toMatchTypeOf<Hex>()
    expectTypeOf(result.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result.paymasterPostOpGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.paymasterVerificationGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.sender).toMatchTypeOf<Hex>()
  })

  test('args: parameters', async () => {
    const result = await prepareUserOperationRequest(bundlerClient, {
      account,
      calls: [{ to: '0x' }],
      parameters: ['gas'],
    })

    // @ts-expect-error
    result.factory
    // @ts-expect-error
    result.factoryData
    // @ts-expect-error
    result.nonce
    // @ts-expect-error
    result.signature

    expectTypeOf(result.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.preVerificationGas).toMatchTypeOf<bigint>()
    expectTypeOf(result.paymasterPostOpGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.paymasterVerificationGasLimit).toMatchTypeOf<
      bigint | undefined
    >()

    const result_2 = await prepareUserOperationRequest(bundlerClient, {
      account,
      calls: [{ to: '0x' }],
      parameters: ['gas', 'nonce'],
    })

    // @ts-expect-error
    result_2.factory
    // @ts-expect-error
    result_2.factoryData
    // @ts-expect-error
    result_2.signature

    expectTypeOf(result_2.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result_2.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result_2.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result_2.preVerificationGas).toMatchTypeOf<bigint>()
    expectTypeOf(result_2.paymasterPostOpGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result_2.paymasterVerificationGasLimit).toMatchTypeOf<
      bigint | undefined
    >()

    const result_3 = await prepareUserOperationRequest(bundlerClient, {
      account,
      calls: [{ to: '0x' }],
      parameters: ['gas', 'nonce', 'signature'],
    })

    // @ts-expect-error
    result_3.factory
    // @ts-expect-error
    result_3.factoryData

    expectTypeOf(result_3.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result_3.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result_3.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result_3.preVerificationGas).toMatchTypeOf<bigint>()
    expectTypeOf(result_3.paymasterPostOpGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result_3.paymasterVerificationGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result_3.signature).toMatchTypeOf<Hex>()

    const result_4 = await prepareUserOperationRequest(bundlerClient, {
      account,
      calls: [{ to: '0x' }],
      parameters: ['factory', 'gas', 'nonce', 'signature'],
    })

    expectTypeOf(result_4.factory).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result_4.factoryData).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result_4.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result_4.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result_4.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result_4.preVerificationGas).toMatchTypeOf<bigint>()
    expectTypeOf(result_4.paymasterPostOpGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result_4.paymasterVerificationGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result_4.signature).toMatchTypeOf<Hex>()
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    const result = await prepareUserOperationRequest(bundlerClient, {
      account,
      calls: [{ to: '0x' }],
    })

    expectTypeOf(result.account).toMatchTypeOf(account)
    expectTypeOf(result.callData).toMatchTypeOf<Hex>()
    expectTypeOf(result.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.initCode).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result.paymasterAndData).toMatchTypeOf<Hex>()
    expectTypeOf(result.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.sender).toMatchTypeOf<Hex>()
  })

  test('cast (widened)', async () => {
    const result = await prepareUserOperationRequest(bundlerClient, {
      account,
      ...({} as UserOperation),
    })

    expectTypeOf(result.initCode).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.factory).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.factoryData).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.paymasterAndData).toMatchTypeOf<Hex | undefined>()

    expectTypeOf(result.account).toMatchTypeOf(account)
    expectTypeOf(result.callData).toMatchTypeOf<Hex>()
    expectTypeOf(result.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result.paymasterPostOpGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.paymasterVerificationGasLimit).toMatchTypeOf<
      bigint | undefined
    >()
    expectTypeOf(result.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.sender).toMatchTypeOf<Hex>()
  })

  test('cast (narrowed)', async () => {
    const result = await prepareUserOperationRequest(bundlerClient, {
      account,
      ...({} as UserOperation<'0.6'>),
    })

    // @ts-expect-error
    result.factory
    // @ts-expect-error
    result.factoryData
    // @ts-expect-error
    result.paymasterPostOpGasLimit
    // @ts-expect-error
    result.paymasterVerificationGasLimit

    expectTypeOf(result.account).toMatchTypeOf(account)
    expectTypeOf(result.callData).toMatchTypeOf<Hex>()
    expectTypeOf(result.callGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.initCode).toMatchTypeOf<Hex | undefined>()
    expectTypeOf(result.nonce).toMatchTypeOf<bigint>()
    expectTypeOf(result.verificationGasLimit).toMatchTypeOf<bigint>()
    expectTypeOf(result.sender).toMatchTypeOf<Hex>()
  })
})
