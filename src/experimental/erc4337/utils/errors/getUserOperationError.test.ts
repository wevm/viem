import { expect, test } from 'vitest'
import { BaseError } from '../../../../errors/base.js'
import { RpcRequestError } from '../../../../errors/request.js'
import { getUserOperationError } from './getUserOperationError.js'

test('default', () => {
  const error = new BaseError('Unknown error')
  const result = getUserOperationError(error, {
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
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: Unknown error

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

test('InitCodeFailedError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message:
        'useroperation reverted during simulation with reason: aa13 initcode failed or oog',
    },
    url: '',
  })
  const result = getUserOperationError(error, {
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
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: Failed to simulate deployment for Smart Account.

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef
     
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

    Details: useroperation reverted during simulation with reason: aa13 initcode failed or oog
    Version: viem@x.y.z]
  `)
})
