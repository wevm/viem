import { expect, test } from 'vitest'
import { RpcRequestError } from '../../errors/request.js'
import { getBundlerError } from './getBundlerError.js'

test('AccountNotDeployedError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa20',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [AccountNotDeployedError: Smart Account is not deployed.

    This could arise when:
    - No \`factory\`/\`factoryData\` or \`initCode\` properties are provided for Smart Account deployment.
    - An incorrect \`sender\` address is provided.

    Details: useroperation reverted during simulation with reason: aa20
    Version: viem@x.y.z]
  `)
})

test('FailedToSendToBeneficiaryError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa91',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [FailedToSendToBeneficiaryError: Failed to send funds to beneficiary.

    Details: useroperation reverted during simulation with reason: aa91
    Version: viem@x.y.z]
  `)
})

test('GasValuesOverflowError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa94',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [GasValuesOverflowError: Gas value overflowed.

    This could arise when:
    - one of the gas values exceeded 2**120 (uint120)

    Details: useroperation reverted during simulation with reason: aa94
    Version: viem@x.y.z]
  `)
})

test('HandleOpsOutOfGasError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa95',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [HandleOpsOutOfGasError: The \`handleOps\` function was called by the Bundler with a gas limit too low.

    Details: useroperation reverted during simulation with reason: aa95
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
    Version: viem@x.y.z]
  `)
})

test('InitCodeMustReturnSenderError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa14',
    },
    url: '',
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
    Version: viem@x.y.z]
  `)
})

test('InsufficientPrefundError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa21',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [InsufficientPrefundError: Smart Account does not have sufficient funds to execute the User Operation.

    This could arise when:
    - the Smart Account does not have sufficient funds to cover the required prefund, or
    - a Paymaster was not provided

    Details: useroperation reverted during simulation with reason: aa21
    Version: viem@x.y.z]
  `)
})

test('InternalCallOnlyError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa92',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [InternalCallOnlyError: Bundler attempted to call an invalid function on the EntryPoint.

    Details: useroperation reverted during simulation with reason: aa92
    Version: viem@x.y.z]
  `)
})

test('InvalidAccountNonceError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa25',
    },
    url: '',
  })
  const result = getBundlerError(error, {
    nonce: 69n,
  })
  expect(result).toMatchInlineSnapshot(`
    [InvalidAccountNonceError: Invalid Smart Account nonce used for User Operation.

    nonce: 69

    Details: useroperation reverted during simulation with reason: aa25
    Version: viem@x.y.z]
  `)
})

test('InvalidAggregatorError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa96',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [InvalidAggregatorError: Bundler used an invalid aggregator for handling aggregated User Operations.

    Details: useroperation reverted during simulation with reason: aa96
    Version: viem@x.y.z]
  `)
})

test('InvalidBeneficiaryError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa90',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [InvalidBeneficiaryError: Bundler has not set a beneficiary address.

    Details: useroperation reverted during simulation with reason: aa90
    Version: viem@x.y.z]
  `)
})

test('InvalidPaymasterAndDataError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa93',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [InvalidPaymasterAndDataError: Paymaster properties provided are invalid.

    This could arise when:
    - the \`paymasterAndData\` property is of an incorrect length


    Details: useroperation reverted during simulation with reason: aa93
    Version: viem@x.y.z]
  `)
})

test('PaymasterDepositTooLowError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa31',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [PaymasterDepositTooLowError: Paymaster deposit for the User Operation is too low.

    This could arise when:
    - the Paymaster has deposited less than the expected amount via the \`deposit\` function

    Details: useroperation reverted during simulation with reason: aa31
    Version: viem@x.y.z]
  `)
})

test('PaymasterFunctionRevertedError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa33',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [PaymasterFunctionRevertedError: The \`validatePaymasterUserOp\` function on the Paymaster reverted.

    Details: useroperation reverted during simulation with reason: aa33
    Version: viem@x.y.z]
  `)
})

test('PaymasterNotDeployedError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa30',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [PaymasterNotDeployedError: The Paymaster contract has not been deployed.

    Details: useroperation reverted during simulation with reason: aa30
    Version: viem@x.y.z]
  `)
})

test('PaymasterPostOpFunctionRevertedError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa50',
    },
    url: '',
  })
  const result = getBundlerError(error, {})
  expect(result).toMatchInlineSnapshot(`
    [PaymasterPostOpFunctionRevertedError: Paymaster \`postOp\` function reverted.

    Details: useroperation reverted during simulation with reason: aa50
    Version: viem@x.y.z]
  `)
})

test('SenderAlreadyConstructedError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa10',
    },
    url: '',
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
    Version: viem@x.y.z]
  `)
})

test('SmartAccountFunctionRevertedError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa23',
    },
    url: '',
  })
  const result = getBundlerError(error, {
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
  })
  expect(result).toMatchInlineSnapshot(`
    [SmartAccountFunctionRevertedError: The \`validateUserOp\` function on the Smart Account reverted.

    Details: useroperation reverted during simulation with reason: aa23
    Version: viem@x.y.z]
  `)
})

test('UserOperationExpiredError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa22',
    },
    url: '',
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
    Version: viem@x.y.z]
  `)
})

test('UserOperationPaymasterExpiredError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa32',
    },
    url: '',
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
    Version: viem@x.y.z]
  `)
})

test('UserOperationSignatureError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa24',
    },
    url: '',
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
    Version: viem@x.y.z]
  `)
})

test('UserOperationPaymasterSignatureError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa34',
    },
    url: '',
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
    Version: viem@x.y.z]
  `)
})

test('UnknownBundlerError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'wat man',
    },
    url: '',
  })
  const result = getBundlerError(error, {
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
  })
  expect(result).toMatchInlineSnapshot(`
    [UnknownBundlerError: An error occurred while executing user operation: RPC Request failed.

    Details: wat man
    Version: viem@x.y.z]
  `)
})

test('VerificationGasLimitExceededError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa40',
    },
    url: '',
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
    Version: viem@x.y.z]
  `)
})

test('VerificationGasLimitTooLowError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'useroperation reverted during simulation with reason: aa41',
    },
    url: '',
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
    Version: viem@x.y.z]
  `)
})
