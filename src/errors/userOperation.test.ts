import { expect, test } from 'vitest'
import { BaseError } from './base.js'
import {
  UserOperationExecutionError,
  UserOperationReceiptNotFoundError,
  WaitForUserOperationReceiptTimeoutError,
} from './userOperation.js'

test('UserOperationExecutionError', () => {
  expect(
    new UserOperationExecutionError(
      new BaseError('test', { metaMessages: ['hello world'] }),
      {
        callData: '0xdeadbeef',
        callGasLimit: 1n,
        nonce: 1n,
        preVerificationGas: 1n,
        verificationGasLimit: 1n,
        signature: '0xdeadbeef',
        sender: '0xdeadbeef',
        factory: '0x0000000000000000000000000000000000000000',
        factoryData: '0xdeadbeef',
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 2n,
      },
    ),
  ).toMatchInlineSnapshot(`
    [UserOperationExecutionError: test

    hello world
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Version: viem@x.y.z]
  `)
})

test('UserOperationReceiptNotFoundError', () => {
  expect(
    new UserOperationReceiptNotFoundError({
      hash: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(`
    [UserOperationReceiptNotFoundError: User Operation receipt with hash "0x0000000000000000000000000000000000000000" could not be found. The User Operation may not have been processed yet.

    Version: viem@x.y.z]
  `)
})

test('WaitForUserOperationReceiptTimeoutError', () => {
  expect(
    new WaitForUserOperationReceiptTimeoutError({
      hash: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(`
    [WaitForUserOperationReceiptTimeoutError: Timed out while waiting for User Operation with hash "0x0000000000000000000000000000000000000000" to be confirmed.

    Version: viem@x.y.z]
  `)
})
