import { describe, expect, test } from 'vitest'

import * as Errors from '../core/Errors.js'
import * as AccountAbstractionErrors from './errors.js'

describe('bundler errors', () => {
  test('AccountNotDeployedError', () => {
    expect(
      new AccountAbstractionErrors.AccountNotDeployedError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [AccountNotDeployedError: Smart Account is not deployed.

      This could arise when:
      - No \`factory\`/\`factoryData\` or \`initCode\` properties are provided for Smart Account deployment.
      - An incorrect \`sender\` address is provided.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('FailedToSendToBeneficiaryError', () => {
    expect(
      new AccountAbstractionErrors.FailedToSendToBeneficiaryError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [FailedToSendToBeneficiaryError: Failed to send funds to beneficiary.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('GasValuesOverflowError', () => {
    expect(
      new AccountAbstractionErrors.GasValuesOverflowError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [GasValuesOverflowError: Gas value overflowed.

      This could arise when:
      - one of the gas values exceeded 2**120 (uint120)

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('HandleOpsOutOfGasError', () => {
    expect(
      new AccountAbstractionErrors.HandleOpsOutOfGasError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [HandleOpsOutOfGasError: The \`handleOps\` function was called by the Bundler with a gas limit too low.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('InitCodeFailedError', () => {
    expect(
      new AccountAbstractionErrors.InitCodeFailedError({
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

      Version: viem@2.52.1]
    `)

    expect(
      new AccountAbstractionErrors.InitCodeFailedError({
        initCode: '0x0000000000000000000000000000000000000000deadbeef',
      }),
    ).toMatchInlineSnapshot(`
      [InitCodeFailedError: Failed to simulate deployment for Smart Account.

      This could arise when:
      - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
      - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
      - Smart Account deployment execution reverted with an error

      initCode: 0x0000000000000000000000000000000000000000deadbeef

      Version: viem@2.52.1]
    `)
  })

  test('InitCodeMustCreateSenderError', () => {
    expect(
      new AccountAbstractionErrors.InitCodeMustCreateSenderError({
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

      Version: viem@2.52.1]
    `)

    expect(
      new AccountAbstractionErrors.InitCodeMustCreateSenderError({
        initCode: '0x0000000000000000000000000000000000000000deadbeef',
      }),
    ).toMatchInlineSnapshot(`
      [InitCodeMustCreateSenderError: Smart Account initialization implementation did not create an account.

      This could arise when:
      - \`factory\`/\`factoryData\` or \`initCode\` properties are invalid
      - Smart Account initialization implementation is incorrect

      initCode: 0x0000000000000000000000000000000000000000deadbeef

      Version: viem@2.52.1]
    `)
  })

  test('InitCodeMustReturnSenderError', () => {
    expect(
      new AccountAbstractionErrors.InitCodeMustReturnSenderError({
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

      Version: viem@2.52.1]
    `)

    expect(
      new AccountAbstractionErrors.InitCodeMustReturnSenderError({
        initCode: '0x0000000000000000000000000000000000000000deadbeef',
        sender: '0x0000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      [InitCodeMustReturnSenderError: Smart Account initialization implementation does not return the expected sender.

      This could arise when:
      Smart Account initialization implementation does not return a sender address

      initCode: 0x0000000000000000000000000000000000000000deadbeef
      sender: 0x0000000000000000000000000000000000000000

      Version: viem@2.52.1]
    `)
  })

  test('InsufficientPrefundError', () => {
    expect(
      new AccountAbstractionErrors.InsufficientPrefundError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [InsufficientPrefundError: Smart Account does not have sufficient funds to execute the User Operation.

      This could arise when:
      - the Smart Account does not have sufficient funds to cover the required prefund, or
      - a Paymaster was not provided

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('InternalCallOnlyError', () => {
    expect(
      new AccountAbstractionErrors.InternalCallOnlyError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [InternalCallOnlyError: Bundler attempted to call an invalid function on the EntryPoint.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('InvalidAccountNonceError', () => {
    expect(
      new AccountAbstractionErrors.InvalidAccountNonceError({
        cause: new Errors.BaseError('test'),
        nonce: 69n,
      }),
    ).toMatchInlineSnapshot(`
      [InvalidAccountNonceError: Invalid Smart Account nonce used for User Operation.

      nonce: 69

      Details: test
      Version: viem@2.52.1]
    `)

    expect(
      new AccountAbstractionErrors.InvalidAccountNonceError({
        nonce: 0n,
      }).metaMessages,
    ).toMatchInlineSnapshot(`[]`)
  })

  test('InvalidAggregatorError', () => {
    expect(
      new AccountAbstractionErrors.InvalidAggregatorError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [InvalidAggregatorError: Bundler used an invalid aggregator for handling aggregated User Operations.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('InvalidBeneficiaryError', () => {
    expect(
      new AccountAbstractionErrors.InvalidBeneficiaryError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [InvalidBeneficiaryError: Bundler has not set a beneficiary address.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('InvalidPaymasterAndDataError', () => {
    expect(
      new AccountAbstractionErrors.InvalidPaymasterAndDataError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [InvalidPaymasterAndDataError: Paymaster properties provided are invalid.

      This could arise when:
      - the \`paymasterAndData\` property is of an incorrect length


      Details: test
      Version: viem@2.52.1]
    `)

    expect(
      new AccountAbstractionErrors.InvalidPaymasterAndDataError({
        cause: new Errors.BaseError('test'),
        paymasterAndData: '0x0000000000000000000000000000000000000000deadbeef',
      }),
    ).toMatchInlineSnapshot(`
      [InvalidPaymasterAndDataError: Paymaster properties provided are invalid.

      This could arise when:
      - the \`paymasterAndData\` property is of an incorrect length

      paymasterAndData: 0x0000000000000000000000000000000000000000deadbeef

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterDepositTooLowError', () => {
    expect(
      new AccountAbstractionErrors.PaymasterDepositTooLowError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [PaymasterDepositTooLowError: Paymaster deposit for the User Operation is too low.

      This could arise when:
      - the Paymaster has deposited less than the expected amount via the \`deposit\` function

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterFunctionRevertedError', () => {
    expect(
      new AccountAbstractionErrors.PaymasterFunctionRevertedError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [PaymasterFunctionRevertedError: The \`validatePaymasterUserOp\` function on the Paymaster reverted.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterNotDeployedError', () => {
    expect(
      new AccountAbstractionErrors.PaymasterNotDeployedError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [PaymasterNotDeployedError: The Paymaster contract has not been deployed.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('PaymasterPostOpFunctionRevertedError', () => {
    expect(
      new AccountAbstractionErrors.PaymasterPostOpFunctionRevertedError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [PaymasterPostOpFunctionRevertedError: Paymaster \`postOp\` function reverted.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('SenderAlreadyConstructedError', () => {
    expect(
      new AccountAbstractionErrors.SenderAlreadyConstructedError({
        factory: '0x0000000000000000000000000000000000000000',
        factoryData: '0xdeadbeef',
      }),
    ).toMatchInlineSnapshot(`
      [SenderAlreadyConstructedError: Smart Account has already been deployed.

      Remove the following properties and try again:
      \`factory\`
      \`factoryData\`

      Version: viem@2.52.1]
    `)

    expect(
      new AccountAbstractionErrors.SenderAlreadyConstructedError({
        initCode: '0x0000000000000000000000000000000000000000deadbeef',
      }),
    ).toMatchInlineSnapshot(`
      [SenderAlreadyConstructedError: Smart Account has already been deployed.

      Remove the following properties and try again:
      \`initCode\`

      Version: viem@2.52.1]
    `)
  })

  test('SmartAccountFunctionRevertedError', () => {
    expect(
      new AccountAbstractionErrors.SmartAccountFunctionRevertedError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [SmartAccountFunctionRevertedError: The \`validateUserOp\` function on the Smart Account reverted.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationExpiredError', () => {
    expect(
      new AccountAbstractionErrors.UserOperationExpiredError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [UserOperationExpiredError: User Operation expired.

      This could arise when:
      - the \`validAfter\` or \`validUntil\` values returned from \`validateUserOp\` on the Smart Account are not satisfied

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationPaymasterExpiredError', () => {
    expect(
      new AccountAbstractionErrors.UserOperationPaymasterExpiredError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [UserOperationPaymasterExpiredError: Paymaster for User Operation expired.

      This could arise when:
      - the \`validAfter\` or \`validUntil\` values returned from \`validatePaymasterUserOp\` on the Paymaster are not satisfied

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationRejectedByEntryPointError', () => {
    expect(
      new AccountAbstractionErrors.UserOperationRejectedByEntryPointError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [UserOperationRejectedByEntryPointError: User Operation rejected by EntryPoint's \`simulateValidation\` during account creation or validation.

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationSignatureError', () => {
    expect(
      new AccountAbstractionErrors.UserOperationSignatureError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [UserOperationSignatureError: Signature provided for the User Operation is invalid.

      This could arise when:
      - the \`signature\` for the User Operation is incorrectly computed, and unable to be verified by the Smart Account

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationPaymasterSignatureError', () => {
    expect(
      new AccountAbstractionErrors.UserOperationPaymasterSignatureError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [UserOperationPaymasterSignatureError: Signature provided for the User Operation is invalid.

      This could arise when:
      - the \`signature\` for the User Operation is incorrectly computed, and unable to be verified by the Paymaster

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('UnknownBundlerError', () => {
    expect(
      new AccountAbstractionErrors.UnknownBundlerError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [UnknownBundlerError: An error occurred while executing user operation: test

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('VerificationGasLimitExceededError', () => {
    expect(
      new AccountAbstractionErrors.VerificationGasLimitExceededError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [VerificationGasLimitExceededError: User Operation verification gas limit exceeded.

      This could arise when:
      - the gas used for verification exceeded the \`verificationGasLimit\`

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('VerificationGasLimitTooLowError', () => {
    expect(
      new AccountAbstractionErrors.VerificationGasLimitTooLowError({
        cause: new Errors.BaseError('test'),
      }),
    ).toMatchInlineSnapshot(`
      [VerificationGasLimitTooLowError: User Operation verification gas limit is too low.

      This could arise when:
      - the \`verificationGasLimit\` is too low to verify the User Operation

      Details: test
      Version: viem@2.52.1]
    `)
  })
})

describe('user operation errors', () => {
  test('UserOperationExecutionError', () => {
    expect(
      new AccountAbstractionErrors.UserOperationExecutionError(
        new Errors.BaseError('test', { metaMessages: ['hello world'] }),
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

      Details: test
      Version: viem@2.52.1]
    `)
  })

  test('UserOperationReceiptNotFoundError', () => {
    expect(
      new AccountAbstractionErrors.UserOperationReceiptNotFoundError({
        hash: '0x0000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      [UserOperationReceiptNotFoundError: User Operation receipt with hash "0x0000000000000000000000000000000000000000" could not be found. The User Operation may not have been processed yet.

      Version: viem@2.52.1]
    `)
  })

  test('WaitForUserOperationReceiptTimeoutError', () => {
    expect(
      new AccountAbstractionErrors.WaitForUserOperationReceiptTimeoutError({
        hash: '0x0000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      [WaitForUserOperationReceiptTimeoutError: Timed out while waiting for User Operation with hash "0x0000000000000000000000000000000000000000" to be confirmed.

      Version: viem@2.52.1]
    `)
  })
})
