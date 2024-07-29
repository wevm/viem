import { expect, test } from 'vitest'
import { BaseError } from '../../errors/base.js'
import {
  AccountNotDeployedError,
  FailedToSendToBeneficiaryError,
  GasValuesOverflowError,
  HandleOpsOutOfGasError,
  InitCodeFailedError,
  InitCodeMustCreateSenderError,
  InitCodeMustReturnSenderError,
  InsufficientPrefundError,
  InternalCallOnlyError,
  InvalidAccountNonceError,
  InvalidAggregatorError,
  InvalidBeneficiaryError,
  InvalidPaymasterAndDataError,
  PaymasterDepositTooLowError,
  PaymasterFunctionRevertedError,
  PaymasterNotDeployedError,
  PaymasterPostOpFunctionRevertedError,
  SenderAlreadyConstructedError,
  SmartAccountFunctionRevertedError,
  UnknownBundlerError,
  UserOperationExpiredError,
  UserOperationPaymasterExpiredError,
  UserOperationPaymasterSignatureError,
  UserOperationSignatureError,
  VerificationGasLimitExceededError,
  VerificationGasLimitTooLowError,
} from './bundler.js'

test('AccountNotDeployedError', () => {
  expect(
    new AccountNotDeployedError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [AccountNotDeployedError: Smart Account is not deployed.

    This could arise when:
    - No \`factory\`/\`factoryData\` or \`initCode\` properties are provided for Smart Account deployment.
    - An incorrect \`sender\` address is provided.

    Version: viem@x.y.z]
  `)
})

test('FailedToSendToBeneficiaryError', () => {
  expect(
    new FailedToSendToBeneficiaryError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [FailedToSendToBeneficiaryError: Failed to send funds to beneficiary.

    Version: viem@x.y.z]
  `)
})

test('GasValuesOverflowError', () => {
  expect(
    new GasValuesOverflowError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [GasValuesOverflowError: Gas value overflowed.

    This could arise when:
    - one of the gas values exceeded 2**120 (uint120)

    Version: viem@x.y.z]
  `)
})

test('HandleOpsOutOfGasError', () => {
  expect(
    new HandleOpsOutOfGasError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [HandleOpsOutOfGasError: The \`handleOps\` function was called by the Bundler with a gas limit too low.

    Version: viem@x.y.z]
  `)
})

test('InitCodeFailedError', () => {
  expect(
    new InitCodeFailedError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeFailedError: Failed to simulate deployment for Smart Account.

    This could arise when:
    - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
    - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
    - Smart Account deployment execution reverted with an error

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef

    Version: viem@x.y.z]
  `)

  expect(
    new InitCodeFailedError({
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeFailedError: Failed to simulate deployment for Smart Account.

    This could arise when:
    - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
    - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
    - Smart Account deployment execution reverted with an error

    initCode: 0x0000000000000000000000000000000000000000deadbeef

    Version: viem@x.y.z]
  `)
})

test('InitCodeMustCreateSenderError', () => {
  expect(
    new InitCodeMustCreateSenderError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeMustCreateSenderError: Smart Account initialization implementation did not create an account.

    This could arise when:
    - \`factory\`/\`factoryData\` or \`initCode\` properties are invalid
    - Smart Account initialization implementation is incorrect

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef

    Version: viem@x.y.z]
  `)

  expect(
    new InitCodeMustCreateSenderError({
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeMustCreateSenderError: Smart Account initialization implementation did not create an account.

    This could arise when:
    - \`factory\`/\`factoryData\` or \`initCode\` properties are invalid
    - Smart Account initialization implementation is incorrect

    initCode: 0x0000000000000000000000000000000000000000deadbeef

    Version: viem@x.y.z]
  `)
})

test('InitCodeMustReturnSenderError', () => {
  expect(
    new InitCodeMustReturnSenderError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
      sender: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeMustReturnSenderError: Smart Account initialization implementation does not return the expected sender.

    This could arise when:
    Smart Account initialization implementation does not return a sender address

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef
    sender: 0x0000000000000000000000000000000000000000

    Version: viem@x.y.z]
  `)

  expect(
    new InitCodeMustReturnSenderError({
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
      sender: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeMustReturnSenderError: Smart Account initialization implementation does not return the expected sender.

    This could arise when:
    Smart Account initialization implementation does not return a sender address

    initCode: 0x0000000000000000000000000000000000000000deadbeef
    sender: 0x0000000000000000000000000000000000000000

    Version: viem@x.y.z]
  `)
})

test('InsufficientPrefundError', () => {
  expect(
    new InsufficientPrefundError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [InsufficientPrefundError: Smart Account does not have sufficient funds to execute the User Operation.

    This could arise when:
    - the Smart Account does not have sufficient funds to cover the required prefund, or
    - a Paymaster was not provided

    Version: viem@x.y.z]
  `)
})

test('InternalCallOnlyError', () => {
  expect(
    new InternalCallOnlyError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [InternalCallOnlyError: Bundler attempted to call an invalid function on the EntryPoint.

    Version: viem@x.y.z]
  `)
})

test('InvalidAccountNonceError', () => {
  expect(
    new InvalidAccountNonceError({
      cause: new BaseError('test'),
      nonce: 69n,
    }),
  ).toMatchInlineSnapshot(`
    [InvalidAccountNonceError: Invalid Smart Account nonce used for User Operation.

    nonce: 69

    Version: viem@x.y.z]
  `)
})

test('InvalidAggregatorError', () => {
  expect(
    new InvalidAggregatorError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [InvalidAggregatorError: Bundler used an invalid aggregator for handling aggregated User Operations.

    Version: viem@x.y.z]
  `)
})

test('InvalidBeneficiaryError', () => {
  expect(
    new InvalidBeneficiaryError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [InvalidBeneficiaryError: Bundler has not set a beneficiary address.

    Version: viem@x.y.z]
  `)
})

test('InvalidPaymasterAndDataError', () => {
  expect(
    new InvalidPaymasterAndDataError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [InvalidPaymasterAndDataError: Paymaster properties provided are invalid.

    This could arise when:
    - the \`paymasterAndData\` property is of an incorrect length


    Version: viem@x.y.z]
  `)

  expect(
    new InvalidPaymasterAndDataError({
      cause: new BaseError('test'),
      paymasterAndData: '0x0000000000000000000000000000000000000000deadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidPaymasterAndDataError: Paymaster properties provided are invalid.

    This could arise when:
    - the \`paymasterAndData\` property is of an incorrect length

    paymasterAndData: 0x0000000000000000000000000000000000000000deadbeef

    Version: viem@x.y.z]
  `)
})

test('PaymasterDepositTooLowError', () => {
  expect(
    new PaymasterDepositTooLowError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [PaymasterDepositTooLowError: Paymaster deposit for the User Operation is too low.

    This could arise when:
    - the Paymaster has deposited less than the expected amount via the \`deposit\` function

    Version: viem@x.y.z]
  `)
})

test('PaymasterFunctionRevertedError', () => {
  expect(
    new PaymasterFunctionRevertedError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [PaymasterFunctionRevertedError: The \`validatePaymasterUserOp\` function on the Paymaster reverted.

    Version: viem@x.y.z]
  `)
})

test('PaymasterNotDeployedError', () => {
  expect(
    new PaymasterNotDeployedError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [PaymasterNotDeployedError: The Paymaster contract has not been deployed.

    Version: viem@x.y.z]
  `)
})

test('PaymasterPostOpFunctionRevertedError', () => {
  expect(
    new PaymasterPostOpFunctionRevertedError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [PaymasterPostOpFunctionRevertedError: Paymaster \`postOp\` function reverted.

    Version: viem@x.y.z]
  `)
})

test('SenderAlreadyConstructedError', () => {
  expect(
    new SenderAlreadyConstructedError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [SenderAlreadyConstructedError: Smart Account has already been deployed.

    Remove the following properties and try again:
    \`factory\`
    \`factoryData\`

    Version: viem@x.y.z]
  `)

  expect(
    new SenderAlreadyConstructedError({
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [SenderAlreadyConstructedError: Smart Account has already been deployed.

    Remove the following properties and try again:
    \`initCode\`

    Version: viem@x.y.z]
  `)
})

test('SmartAccountFunctionRevertedError', () => {
  expect(
    new SmartAccountFunctionRevertedError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [SmartAccountFunctionRevertedError: The \`validateUserOp\` function on the Smart Account reverted.

    Version: viem@x.y.z]
  `)
})

test('UserOperationExpiredError', () => {
  expect(
    new UserOperationExpiredError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [UserOperationExpiredError: User Operation expired.

    This could arise when:
    - the \`validAfter\` or \`validUntil\` values returned from \`validateUserOp\` on the Smart Account are not satisfied

    Version: viem@x.y.z]
  `)
})

test('UserOperationPaymasterExpiredError', () => {
  expect(
    new UserOperationPaymasterExpiredError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [UserOperationPaymasterExpiredError: Paymaster for User Operation expired.

    This could arise when:
    - the \`validAfter\` or \`validUntil\` values returned from \`validatePaymasterUserOp\` on the Paymaster are not satisfied

    Version: viem@x.y.z]
  `)
})

test('UserOperationSignatureError', () => {
  expect(
    new UserOperationSignatureError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [UserOperationSignatureError: Signature provided for the User Operation is invalid.

    This could arise when:
    - the \`signature\` for the User Operation is incorrectly computed, and unable to be verified by the Smart Account

    Version: viem@x.y.z]
  `)
})

test('UserOperationPaymasterSignatureError', () => {
  expect(
    new UserOperationPaymasterSignatureError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [UserOperationPaymasterSignatureError: Signature provided for the User Operation is invalid.

    This could arise when:
    - the \`signature\` for the User Operation is incorrectly computed, and unable to be verified by the Paymaster

    Version: viem@x.y.z]
  `)
})

test('UnknownBundlerError', () => {
  expect(
    new UnknownBundlerError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [UnknownBundlerError: An error occurred while executing user operation: test

    Version: viem@x.y.z]
  `)
})

test('VerificationGasLimitExceededError', () => {
  expect(
    new VerificationGasLimitExceededError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [VerificationGasLimitExceededError: User Operation verification gas limit exceeded.

    This could arise when:
    - the gas used for verification exceeded the \`verificationGasLimit\`

    Version: viem@x.y.z]
  `)
})

test('VerificationGasLimitTooLowError', () => {
  expect(
    new VerificationGasLimitTooLowError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [VerificationGasLimitTooLowError: User Operation verification gas limit is too low.

    This could arise when:
    - the \`verificationGasLimit\` is too low to verify the User Operation

    Version: viem@x.y.z]
  `)
})
