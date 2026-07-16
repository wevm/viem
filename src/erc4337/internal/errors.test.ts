import { describe, expect, test } from 'vitest'

import * as Errors from '../../core/Errors.js'
import * as AccountAbstractionErrors from '../errors.js'
import { getBundlerError, getUserOperationError } from './errors.js'

const wagmiContractConfig = {
  address: '0x0000000000000000000000000000000000000000',
  abi: [
    {
      type: 'function',
      name: 'mint',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'approve',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
  ],
} as const

const ErrorsExample = {
  abi: [
    {
      type: 'function',
      name: 'simpleCustomWrite',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'error',
      name: 'SimpleError',
      inputs: [{ name: 'message', type: 'string' }],
    },
  ],
} as const

function rpcError(options: {
  code: number
  data?: unknown
  message: string
}): Errors.BaseError {
  const cause = Object.assign(new Error(options.message), {
    code: options.code,
    data: options.data,
    details: options.message,
  })
  return new Errors.BaseError(options.message, {
    cause,
    details: options.message,
  }) as unknown as Errors.BaseError
}

describe('getBundlerError', () => {
  test('AccountNotDeployedError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa20',
    })
    const result = getBundlerError(error, {})
    expect(result).toBeInstanceOf(
      AccountAbstractionErrors.AccountNotDeployedError,
    )
    expect(result).toMatchInlineSnapshot(`
      [AccountNotDeployedError: Smart Account is not deployed.

      This could arise when:
      - No \`factory\`/\`factoryData\` or \`initCode\` properties are provided for Smart Account deployment.
      - An incorrect \`sender\` address is provided.

      Details: useroperation reverted during simulation with reason: aa20
      Version: viem@2.52.1]
    `)
  })

  test('ExecutionReverted', () => {
    const error = rpcError({
      code: -32521,
      data: {
        revertData: '0xdeadbeef',
      },
      message: 'execution reverted: get good',
    })
    const result = getBundlerError(error, {})
    const data =
      result instanceof AccountAbstractionErrors.ExecutionRevertedError
        ? result.data
        : undefined
    expect(data).toMatchInlineSnapshot(`
      {
        "revertData": "0xdeadbeef",
      }
    `)
    expect(result).toMatchInlineSnapshot(`
      [ExecutionRevertedError: Execution reverted with reason: get good.

      Details: execution reverted: get good
      Version: viem@2.52.1]
    `)
  })

  test('ExecutionReverted (nested code and message data)', () => {
    const revertData =
      '0xf9006398000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000'
    const message = `UserOperation reverted during simulation with reason: ${revertData}`
    const error = rpcError({
      code: -32603,
      data: { code: -32521, message },
      message,
    })
    const bundlerError = getBundlerError(error, {})
    if (
      !(bundlerError instanceof AccountAbstractionErrors.ExecutionRevertedError)
    )
      throw bundlerError

    const result = getUserOperationError(error, {
      calls: [
        {
          abi: ErrorsExample.abi,
          functionName: 'simpleCustomWrite',
          to: wagmiContractConfig.address,
        },
      ],
      callData: '0xdeadbeef',
      callGasLimit: 1n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 2n,
      nonce: 1n,
      preVerificationGas: 1n,
      sender: '0xdeadbeef',
      signature: '0xdeadbeef',
      verificationGasLimit: 1n,
    })

    expect({
      cause: result.cause.name,
      decoded: result.message.includes('SimpleError(string message)'),
      reason: result.message.includes('bugger'),
      revertData: bundlerError.data?.revertData,
    }).toMatchInlineSnapshot(`
      {
        "cause": "ContractFunctionExecutionError",
        "decoded": true,
        "reason": true,
        "revertData": "0xf9006398000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000",
      }
    `)
  })

  test('FailedToSendToBeneficiaryError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa91',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [FailedToSendToBeneficiaryError: Failed to send funds to beneficiary.

      Details: useroperation reverted during simulation with reason: aa91
      Version: viem@2.52.1]
    `)
  })

  test('GasValuesOverflowError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa94',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [GasValuesOverflowError: Gas value overflowed.

      This could arise when:
      - one of the gas values exceeded 2**120 (uint120)

      Details: useroperation reverted during simulation with reason: aa94
      Version: viem@2.52.1]
    `)
  })

  test('HandleOpsOutOfGasError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa95',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [HandleOpsOutOfGasError: The \`handleOps\` function was called by the Bundler with a gas limit too low.

      Details: useroperation reverted during simulation with reason: aa95
      Version: viem@2.52.1]
    `)
  })

  test('InitCodeFailedError', () => {
    const error = rpcError({
      code: -69420,
      message:
        'useroperation reverted during simulation with reason: aa13 initcode failed or oog',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [InitCodeFailedError: Failed to simulate deployment for Smart Account.

      This could arise when:
      - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
      - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
      - Smart Account deployment execution reverted with an error

      factory: 0x0000000000000000000000000000000000000000
      factoryData: 0xdeadbeef

      Details: useroperation reverted during simulation with reason: aa13 initcode failed or oog
      Version: viem@2.52.1]
    `)
  })

  test('InitCodeMustReturnSenderError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa14',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
      sender: '0x0000000000000000000000000000000000000000',
    })
    expect(result).toMatchInlineSnapshot(`
      [InitCodeMustReturnSenderError: Smart Account initialization implementation does not return the expected sender.

      This could arise when:
      Smart Account initialization implementation does not return a sender address

      factory: 0x0000000000000000000000000000000000000000
      factoryData: 0xdeadbeef
      sender: 0x0000000000000000000000000000000000000000

      Details: useroperation reverted during simulation with reason: aa14
      Version: viem@2.52.1]
    `)
  })

  test('InitCodeMustCreateSenderError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa15',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
      sender: '0x0000000000000000000000000000000000000000',
    })
    expect(result).toMatchInlineSnapshot(`
      [InitCodeMustCreateSenderError: Smart Account initialization implementation did not create an account.

      This could arise when:
      - \`factory\`/\`factoryData\` or \`initCode\` properties are invalid
      - Smart Account initialization implementation is incorrect

      factory: 0x0000000000000000000000000000000000000000
      factoryData: 0xdeadbeef

      Details: useroperation reverted during simulation with reason: aa15
      Version: viem@2.52.1]
    `)
  })

  test('InsufficientPrefundError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa21',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [InsufficientPrefundError: Smart Account does not have sufficient funds to execute the User Operation.

      This could arise when:
      - the Smart Account does not have sufficient funds to cover the required prefund, or
      - a Paymaster was not provided

      Details: useroperation reverted during simulation with reason: aa21
      Version: viem@2.52.1]
    `)
  })

  test('InternalCallOnlyError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa92',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [InternalCallOnlyError: Bundler attempted to call an invalid function on the EntryPoint.

      Details: useroperation reverted during simulation with reason: aa92
      Version: viem@2.52.1]
    `)
  })

  test('InvalidAccountNonceError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa25',
    })
    const result = getBundlerError(error, {
      nonce: 69n,
    })
    expect(result).toMatchInlineSnapshot(`
      [InvalidAccountNonceError: Invalid Smart Account nonce used for User Operation.

      nonce: 69

      Details: useroperation reverted during simulation with reason: aa25
      Version: viem@2.52.1]
    `)

    const result_2 = getBundlerError(error, {})
    expect(result_2).toMatchInlineSnapshot(`
      [InvalidAccountNonceError: Invalid Smart Account nonce used for User Operation.


      Details: useroperation reverted during simulation with reason: aa25
      Version: viem@2.52.1]
    `)
  })

  test('InvalidAggregatorError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa96',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [InvalidAggregatorError: Bundler used an invalid aggregator for handling aggregated User Operations.

      Details: useroperation reverted during simulation with reason: aa96
      Version: viem@2.52.1]
    `)
  })

  test('InvalidBeneficiaryError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa90',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [InvalidBeneficiaryError: Bundler has not set a beneficiary address.

      Details: useroperation reverted during simulation with reason: aa90
      Version: viem@2.52.1]
    `)
  })

  test('InvalidFieldsError', () => {
    const error = rpcError({
      code: -32602,
      message: 'invalid fields set on User Operation',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [InvalidFieldsError: Invalid fields set on User Operation.

      Details: invalid fields set on User Operation
      Version: viem@2.52.1]
    `)
  })

  test('InvalidPaymasterAndDataError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa93',
    })
    const result = getBundlerError(error, {
      paymasterAndData: '0x0000000000000000000000000000000000000000deadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [InvalidPaymasterAndDataError: Paymaster properties provided are invalid.

      This could arise when:
      - the \`paymasterAndData\` property is of an incorrect length


      Details: useroperation reverted during simulation with reason: aa93
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterDepositTooLowError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa31',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [PaymasterDepositTooLowError: Paymaster deposit for the User Operation is too low.

      This could arise when:
      - the Paymaster has deposited less than the expected amount via the \`deposit\` function

      Details: useroperation reverted during simulation with reason: aa31
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterDepositTooLowError', () => {
    const error = rpcError({
      code: -32508,
      message: 'useroperation reverted during simulation with reason: aa26',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [PaymasterDepositTooLowError: Paymaster deposit for the User Operation is too low.

      This could arise when:
      - the Paymaster has deposited less than the expected amount via the \`deposit\` function

      Details: useroperation reverted during simulation with reason: aa26
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterFunctionRevertedError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa33',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [PaymasterFunctionRevertedError: The \`validatePaymasterUserOp\` function on the Paymaster reverted.

      Details: useroperation reverted during simulation with reason: aa33
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterNotDeployedError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa30',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [PaymasterNotDeployedError: The Paymaster contract has not been deployed.

      Details: useroperation reverted during simulation with reason: aa30
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterPostOpFunctionRevertedError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa50',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [PaymasterPostOpFunctionRevertedError: Paymaster \`postOp\` function reverted.

      Details: useroperation reverted during simulation with reason: aa50
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterRateLimitError', () => {
    const error = rpcError({
      code: -32504,
      message: 'rate limited',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [PaymasterRateLimitError: UserOperation rejected because paymaster (or signature aggregator) is throttled/banned.

      Details: rate limited
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterStakeTooLowError', () => {
    const error = rpcError({
      code: -32505,
      message: 'stake too low',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [PaymasterStakeTooLowError: UserOperation rejected because paymaster (or signature aggregator) stake or unstake-delay is too low.

      Details: stake too low
      Version: viem@2.52.1]
    `)
  })

  test('SenderAlreadyConstructedError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa10',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [SenderAlreadyConstructedError: Smart Account has already been deployed.

      Remove the following properties and try again:
      \`factory\`
      \`factoryData\`

      Details: useroperation reverted during simulation with reason: aa10
      Version: viem@2.52.1]
    `)
  })

  test('SignatureCheckFailedError', () => {
    const error = rpcError({
      code: -32507,
      message: 'signature check failed',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [SignatureCheckFailedError: UserOperation rejected because account signature check failed (or paymaster signature, if the paymaster uses its data as signature).

      Details: signature check failed
      Version: viem@2.52.1]
    `)
  })

  test('SmartAccountFunctionRevertedError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa23',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [SmartAccountFunctionRevertedError: The \`validateUserOp\` function on the Smart Account reverted.

      Details: useroperation reverted during simulation with reason: aa23
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationExpiredError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa22',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [UserOperationExpiredError: User Operation expired.

      This could arise when:
      - the \`validAfter\` or \`validUntil\` values returned from \`validateUserOp\` on the Smart Account are not satisfied

      Details: useroperation reverted during simulation with reason: aa22
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationPaymasterExpiredError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa32',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [UserOperationPaymasterExpiredError: Paymaster for User Operation expired.

      This could arise when:
      - the \`validAfter\` or \`validUntil\` values returned from \`validatePaymasterUserOp\` on the Paymaster are not satisfied

      Details: useroperation reverted during simulation with reason: aa32
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationSignatureError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa24',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [UserOperationSignatureError: Signature provided for the User Operation is invalid.

      This could arise when:
      - the \`signature\` for the User Operation is incorrectly computed, and unable to be verified by the Smart Account

      Details: useroperation reverted during simulation with reason: aa24
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationPaymasterSignatureError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa34',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [UserOperationPaymasterSignatureError: Signature provided for the User Operation is invalid.

      This could arise when:
      - the \`signature\` for the User Operation is incorrectly computed, and unable to be verified by the Paymaster

      Details: useroperation reverted during simulation with reason: aa34
      Version: viem@2.52.1]
    `)
  })

  test('UnsupportedSignatureAggregatorError', () => {
    const error = rpcError({
      code: -32506,
      message: 'unsupported sig',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [UnsupportedSignatureAggregatorError: UserOperation rejected because account specified unsupported signature aggregator.

      Details: unsupported sig
      Version: viem@2.52.1]
    `)
  })

  test('UnknownBundlerError', () => {
    const error = rpcError({
      code: -69420,
      message: 'wat man',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [UnknownBundlerError: An error occurred while executing user operation: wat man

      Details: wat man
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationRejectedByEntryPointError', () => {
    const error = rpcError({
      code: -32500,
      message: 'useroperation reverted during simulation with reason: aa25',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [InvalidAccountNonceError: Invalid Smart Account nonce used for User Operation.


      Details: useroperation reverted during simulation with reason: aa25
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationRejectedByPaymasterError', () => {
    const error = rpcError({
      code: -32501,
      message: 'paymaster doesnt like it',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [UserOperationRejectedByPaymasterError: User Operation rejected by Paymaster's \`validatePaymasterUserOp\`.

      Details: paymaster doesnt like it
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationRejectedByOpCodeError', () => {
    const error = rpcError({
      code: -32502,
      message: 'opcode sucks',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [UserOperationRejectedByOpCodeError: User Operation rejected with op code validation error.

      Details: opcode sucks
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationOutOfTimeRangeError', () => {
    const error = rpcError({
      code: -32503,
      message: 'opcode sucks',
    })
    const result = getBundlerError(error, {})
    expect(result).toMatchInlineSnapshot(`
      [UserOperationOutOfTimeRangeError: UserOperation out of time-range: either wallet or paymaster returned a time-range, and it is already expired (or will expire soon).

      Details: opcode sucks
      Version: viem@2.52.1]
    `)
  })

  test('VerificationGasLimitExceededError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa40',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [VerificationGasLimitExceededError: User Operation verification gas limit exceeded.

      This could arise when:
      - the gas used for verification exceeded the \`verificationGasLimit\`

      Details: useroperation reverted during simulation with reason: aa40
      Version: viem@2.52.1]
    `)
  })

  test('VerificationGasLimitTooLowError', () => {
    const error = rpcError({
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa41',
    })
    const result = getBundlerError(error, {
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    })
    expect(result).toMatchInlineSnapshot(`
      [VerificationGasLimitTooLowError: User Operation verification gas limit is too low.

      This could arise when:
      - the \`verificationGasLimit\` is too low to verify the User Operation

      Details: useroperation reverted during simulation with reason: aa41
      Version: viem@2.52.1]
    `)
  })
})

describe('getUserOperationError', () => {
  test('default', () => {
    const error = new Errors.BaseError('Unknown error')
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
      [UserOperationExecutionError: An error occurred while executing user operation: Unknown error

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

      Details: Unknown error
      Version: viem@2.52.1]
    `)
  })

  test('contract error (via error.message)', () => {
    const error: Errors.BaseError = new Errors.BaseError('Unknown error', {
      cause: Object.assign(new Error('Unknown error'), {
        code: -32521,
        name: '',
        message:
          'execution reverted: 0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
      }),
    }) as unknown as Errors.BaseError
    const result = getUserOperationError(error, {
      calls: [
        {
          to: wagmiContractConfig.address,
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          args: [420n],
        },
      ],
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
      [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function mint(uint256 tokenId)
        args:          (420)
       
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

      Details: An error occurred.

      Version: viem@2.52.1
      Version: viem@2.52.1]
    `)
  })

  test('contract error (via error.data)', () => {
    const error: Errors.BaseError = new Errors.BaseError('Unknown error', {
      cause: Object.assign(new Error('Unknown error'), {
        code: -32521,
        name: '',
        data: 'execution reverted: 0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
      }),
    }) as unknown as Errors.BaseError
    const result = getUserOperationError(error, {
      calls: [
        {
          to: wagmiContractConfig.address,
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          args: [420n],
        },
      ],
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
      [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function mint(uint256 tokenId)
        args:          (420)
       
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

      Details: An error occurred.

      Version: viem@2.52.1
      Version: viem@2.52.1]
    `)
  })

  test('contract error (via error.data.revertData)', () => {
    const error: Errors.BaseError = new Errors.BaseError('Unknown error', {
      cause: Object.assign(new Error('Unknown error'), {
        code: -32521,
        name: '',
        data: {
          revertData:
            'execution reverted: 0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
        },
      }),
    }) as unknown as Errors.BaseError
    const result = getUserOperationError(error, {
      calls: [
        {
          to: wagmiContractConfig.address,
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          args: [420n],
        },
      ],
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
      [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function mint(uint256 tokenId)
        args:          (420)
       
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

      Details: An error occurred.

      Version: viem@2.52.1
      Version: viem@2.52.1]
    `)
  })

  test('contract error (via error.data)', () => {
    const error: Errors.BaseError = new Errors.BaseError('Unknown error', {
      cause: Object.assign(new Error('Unknown error'), {
        code: -32521,
        name: '',
        message: 'execution reverted: 0x',
      }),
    }) as unknown as Errors.BaseError
    const result = getUserOperationError(error, {
      calls: [
        {
          to: wagmiContractConfig.address,
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          args: [420n],
        },
      ],
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
      [UserOperationExecutionError: The contract function "mint" returned no data ("0x").

      This could be due to any of the following:
        - The contract does not have the function "mint",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function mint(uint256 tokenId)
        args:          (420)
       
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

      Details: Cannot decode zero data ("0x") with ABI parameters.
      Version: viem@2.52.1]
    `)
  })

  test('contract error (multiple calls)', () => {
    const error: Errors.BaseError = new Errors.BaseError('Unknown error', {
      cause: Object.assign(new Error('Unknown error'), {
        code: -32521,
        name: '',
        message:
          'execution reverted: 0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
      }),
    }) as unknown as Errors.BaseError
    const result = getUserOperationError(error, {
      calls: [
        {
          to: wagmiContractConfig.address,
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
        },
        {
          to: wagmiContractConfig.address,
          abi: wagmiContractConfig.abi,
          functionName: 'approve',
          args: ['0x0000000000000000000000000000000000000000', 420n],
        },
      ],
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
      [UserOperationExecutionError: The contract function "mint | approve" reverted with the following reason:
      Token ID is taken

       
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

      Details: An error occurred.

      Version: viem@2.52.1
      Version: viem@2.52.1]
    `)
  })

  test('contract error (multiple calls)', () => {
    const error: Errors.BaseError = new Errors.BaseError('Unknown error', {
      cause: Object.assign(new Error('Unknown error'), {
        code: -32521,
        name: '',
        message:
          'execution reverted: 0xf9006398000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000',
      }),
    }) as unknown as Errors.BaseError
    const result = getUserOperationError(error, {
      calls: [
        {
          to: wagmiContractConfig.address,
          abi: wagmiContractConfig.abi,
          functionName: 'approve',
          args: ['0x0000000000000000000000000000000000000000', 420n],
        },
        {
          abi: ErrorsExample.abi,
          to: '0x0000000000000000000000000000000000000000',
          functionName: 'simpleCustomWrite',
        },
      ],
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
      [UserOperationExecutionError: The contract function "simpleCustomWrite" reverted.

      Error: error SimpleError(string message)
                        (bugger)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function simpleCustomWrite()
       
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

      Details: An error occurred.

      Version: viem@2.52.1
      Version: viem@2.52.1]
    `)
  })

  test('contract error (multiple calls - unknown error)', () => {
    const error: Errors.BaseError = new Errors.BaseError('Unknown error', {
      cause: Object.assign(new Error('Unknown error'), {
        code: -32521,
        name: '',
        message:
          'execution reverted: 0xdeadbeef000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
      }),
    }) as unknown as Errors.BaseError
    const result = getUserOperationError(error, {
      calls: [
        {
          to: wagmiContractConfig.address,
          abi: [wagmiContractConfig.abi[1]],
          functionName: 'mint',
        },
        {
          to: wagmiContractConfig.address,
          abi: [wagmiContractConfig.abi[1]],
          functionName: 'approve',
          args: ['0x0000000000000000000000000000000000000000', 420n],
        },
      ],
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
      [UserOperationExecutionError: The contract function "mint | approve" reverted with the following signature:
      0xdeadbeef

      Unable to decode signature "0xdeadbeef" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
       
       
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

      Details: An error occurred.

      Version: viem@2.52.1
      Version: viem@2.52.1]
    `)
  })

  test('contract error (raw call)', () => {
    const error: Errors.BaseError = new Errors.BaseError('Unknown error', {
      cause: Object.assign(new Error('Unknown error'), {
        code: -32521,
        name: '',
        message:
          'execution reverted: 0xdeadbeef000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
      }),
    }) as unknown as Errors.BaseError
    const result = getUserOperationError(error, {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0x0000000000000000000000000000000000000000',
        },
      ],
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
      [UserOperationExecutionError: Execution reverted for an unknown reason.

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

      Details: execution reverted: 0xdeadbeef000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000
      Version: viem@2.52.1]
    `)
  })

  test('bundler error', () => {
    const error = rpcError({
      code: -69420,
      message:
        'useroperation reverted during simulation with reason: aa13 initcode failed or oog',
    }) as unknown as Errors.BaseError
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

      This could arise when:
      - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
      - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
      - Smart Account deployment execution reverted with an error

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
      Version: viem@2.52.1]
    `)
  })

  test('bundler error (execution reverted without calls)', () => {
    const error = rpcError({
      code: -32521,
      message: 'UserOperation reverted during simulation with reason: 0x',
    }) as unknown as Errors.BaseError
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
      paymasterData: '0xdeadbeef',
      paymaster: '0xffff',
    })
    expect(result).toMatchInlineSnapshot(`
      [UserOperationExecutionError: Execution reverted with reason: UserOperation reverted during simulation with reason: 0x.

      Request Arguments:
        callData:              0xdeadbeef
        callGasLimit:          1
        factory:               0x0000000000000000000000000000000000000000
        factoryData:           0xdeadbeef
        maxFeePerGas:          0.000000001 gwei
        maxPriorityFeePerGas:  0.000000002 gwei
        nonce:                 1
        paymaster:             0xffff
        paymasterData:         0xdeadbeef
        preVerificationGas:    1
        sender:                0xdeadbeef
        signature:             0xdeadbeef
        verificationGasLimit:  1

      Details: UserOperation reverted during simulation with reason: 0x
      Version: viem@2.52.1]
    `)
  })
})
