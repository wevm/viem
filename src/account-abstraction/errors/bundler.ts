import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { Hex } from '../../types/misc.js'

export type AccountNotDeployedErrorType = AccountNotDeployedError & {
  name: 'AccountNotDeployedError'
}
export class AccountNotDeployedError extends BaseError {
  static message = /aa20/
  override name = 'AccountNotDeployedError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Smart Account is not deployed.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- No `factory`/`factoryData` or `initCode` properties are provided for Smart Account deployment.',
        '- An incorrect `sender` address is provided.',
      ],
    })
  }
}

export type ExecutionRevertedErrorType = ExecutionRevertedError & {
  code: -32521
  name: 'ExecutionRevertedError'
}
export class ExecutionRevertedError extends BaseError {
  static code = -32521
  static message = /execution reverted/

  override name = 'ExecutionRevertedError'

  constructor({
    cause,
    message,
  }: { cause?: BaseError | undefined; message?: string | undefined } = {}) {
    const reason = message
      ?.replace('execution reverted: ', '')
      ?.replace('execution reverted', '')
    super(
      `Execution reverted ${
        reason ? `with reason: ${reason}` : 'for an unknown reason'
      }.`,
      {
        cause,
      },
    )
  }
}

export type FailedToSendToBeneficiaryErrorType =
  FailedToSendToBeneficiaryError & {
    name: 'FailedToSendToBeneficiaryError'
  }
export class FailedToSendToBeneficiaryError extends BaseError {
  static message = /aa91/
  override name = 'FailedToSendToBeneficiaryError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Failed to send funds to beneficiary.', {
      cause,
    })
  }
}

export type GasValuesOverflowErrorType = GasValuesOverflowError & {
  name: 'GasValuesOverflowError'
}
export class GasValuesOverflowError extends BaseError {
  static message = /aa94/
  override name = 'GasValuesOverflowError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Gas value overflowed.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- one of the gas values exceeded 2**120 (uint120)',
      ].filter(Boolean) as string[],
    })
  }
}

export type HandleOpsOutOfGasErrorType = HandleOpsOutOfGasError & {
  name: 'HandleOpsOutOfGasError'
}
export class HandleOpsOutOfGasError extends BaseError {
  static message = /aa95/
  override name = 'HandleOpsOutOfGasError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super(
      'The `handleOps` function was called by the Bundler with a gas limit too low.',
      {
        cause,
      },
    )
  }
}

export type InitCodeFailedErrorType = InitCodeFailedError & {
  name: 'InitCodeFailedError'
}
export class InitCodeFailedError extends BaseError {
  static message = /aa13/
  override name = 'InitCodeFailedError'
  constructor({
    cause,
    factory,
    factoryData,
    initCode,
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
    initCode?: Hex | undefined
  }) {
    super('Failed to simulate deployment for Smart Account.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- Invalid `factory`/`factoryData` or `initCode` properties are present',
        '- Smart Account deployment execution ran out of gas (low `verificationGasLimit` value)',
        '- Smart Account deployment execution reverted with an error\n',
        factory && `factory: ${factory}`,
        factoryData && `factoryData: ${factoryData}`,
        initCode && `initCode: ${initCode}`,
      ].filter(Boolean) as string[],
    })
  }
}

export type InitCodeMustCreateSenderErrorType =
  InitCodeMustCreateSenderError & {
    name: 'InitCodeMustCreateSenderError'
  }
export class InitCodeMustCreateSenderError extends BaseError {
  static message = /aa15/
  override name = 'InitCodeMustCreateSenderError'
  constructor({
    cause,
    factory,
    factoryData,
    initCode,
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
    initCode?: Hex | undefined
  }) {
    super(
      'Smart Account initialization implementation did not create an account.',
      {
        cause,
        metaMessages: [
          'This could arise when:',
          '- `factory`/`factoryData` or `initCode` properties are invalid',
          '- Smart Account initialization implementation is incorrect\n',
          factory && `factory: ${factory}`,
          factoryData && `factoryData: ${factoryData}`,
          initCode && `initCode: ${initCode}`,
        ].filter(Boolean) as string[],
      },
    )
  }
}

export type InitCodeMustReturnSenderErrorType =
  InitCodeMustReturnSenderError & {
    name: 'InitCodeMustReturnSenderError'
  }
export class InitCodeMustReturnSenderError extends BaseError {
  static message = /aa14/
  override name = 'InitCodeMustReturnSenderError'
  constructor({
    cause,
    factory,
    factoryData,
    initCode,
    sender,
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
    initCode?: Hex | undefined
    sender?: Address | undefined
  }) {
    super(
      'Smart Account initialization implementation does not return the expected sender.',
      {
        cause,
        metaMessages: [
          'This could arise when:',
          'Smart Account initialization implementation does not return a sender address\n',
          factory && `factory: ${factory}`,
          factoryData && `factoryData: ${factoryData}`,
          initCode && `initCode: ${initCode}`,
          sender && `sender: ${sender}`,
        ].filter(Boolean) as string[],
      },
    )
  }
}

export type InsufficientPrefundErrorType = InsufficientPrefundError & {
  name: 'InsufficientPrefundError'
}
export class InsufficientPrefundError extends BaseError {
  static message = /aa21/
  override name = 'InsufficientPrefundError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super(
      'Smart Account does not have sufficient funds to execute the User Operation.',
      {
        cause,
        metaMessages: [
          'This could arise when:',
          '- the Smart Account does not have sufficient funds to cover the required prefund, or',
          '- a Paymaster was not provided',
        ].filter(Boolean) as string[],
      },
    )
  }
}

export type InternalCallOnlyErrorType = InternalCallOnlyError & {
  name: 'InternalCallOnlyError'
}
export class InternalCallOnlyError extends BaseError {
  static message = /aa92/
  override name = 'InternalCallOnlyError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Bundler attempted to call an invalid function on the EntryPoint.', {
      cause,
    })
  }
}

export type InvalidAggregatorErrorType = InvalidAggregatorError & {
  name: 'InvalidAggregatorError'
}
export class InvalidAggregatorError extends BaseError {
  static message = /aa96/
  override name = 'InvalidAggregatorError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super(
      'Bundler used an invalid aggregator for handling aggregated User Operations.',
      {
        cause,
      },
    )
  }
}

export type InvalidAccountNonceErrorType = InvalidAccountNonceError & {
  name: 'InvalidAccountNonceError'
}
export class InvalidAccountNonceError extends BaseError {
  static message = /aa25/
  override name = 'InvalidAccountNonceError'
  constructor({
    cause,
    nonce,
  }: {
    cause?: BaseError | undefined
    nonce?: bigint | undefined
  }) {
    super('Invalid Smart Account nonce used for User Operation.', {
      cause,
      metaMessages: [nonce && `nonce: ${nonce}`].filter(Boolean) as string[],
    })
  }
}

export type InvalidBeneficiaryErrorType = InvalidBeneficiaryError & {
  name: 'InvalidBeneficiaryError'
}
export class InvalidBeneficiaryError extends BaseError {
  static message = /aa90/
  override name = 'InvalidBeneficiaryError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Bundler has not set a beneficiary address.', {
      cause,
    })
  }
}

export type InvalidFieldsErrorType = InvalidFieldsError & {
  name: 'InvalidFieldsError'
}
export class InvalidFieldsError extends BaseError {
  static code = -32602

  override name = 'InvalidFieldsError'

  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Invalid fields set on User Operation.', {
      cause,
    })
  }
}

export type InvalidPaymasterAndDataErrorType = InvalidPaymasterAndDataError & {
  name: 'InvalidPaymasterAndDataError'
}
export class InvalidPaymasterAndDataError extends BaseError {
  static message = /aa93/
  override name = 'InvalidPaymasterAndDataError'
  constructor({
    cause,
    paymasterAndData,
  }: {
    cause?: BaseError | undefined
    paymasterAndData?: Hex | undefined
  }) {
    super('Paymaster properties provided are invalid.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- the `paymasterAndData` property is of an incorrect length\n',
        paymasterAndData && `paymasterAndData: ${paymasterAndData}`,
      ].filter(Boolean) as string[],
    })
  }
}

export type PaymasterDepositTooLowErrorType = PaymasterDepositTooLowError & {
  code: -32508
  name: 'PaymasterDepositTooLowError'
}
export class PaymasterDepositTooLowError extends BaseError {
  static code = -32508
  static message = /aa31/

  override name = 'PaymasterDepositTooLowError'

  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Paymaster deposit for the User Operation is too low.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- the Paymaster has deposited less than the expected amount via the `deposit` function',
      ].filter(Boolean) as string[],
    })
  }
}

export type PaymasterFunctionRevertedErrorType =
  PaymasterFunctionRevertedError & {
    name: 'PaymasterFunctionRevertedError'
  }
export class PaymasterFunctionRevertedError extends BaseError {
  static message = /aa33/
  override name = 'PaymasterFunctionRevertedError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('The `validatePaymasterUserOp` function on the Paymaster reverted.', {
      cause,
    })
  }
}

export type PaymasterNotDeployedErrorType = PaymasterNotDeployedError & {
  name: 'PaymasterNotDeployedError'
}
export class PaymasterNotDeployedError extends BaseError {
  static message = /aa30/
  override name = 'PaymasterNotDeployedError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('The Paymaster contract has not been deployed.', {
      cause,
    })
  }
}

export type PaymasterRateLimitErrorType = PaymasterRateLimitError & {
  code: -32504
  name: 'PaymasterRateLimitError'
}
export class PaymasterRateLimitError extends BaseError {
  static code = -32504

  override name = 'PaymasterRateLimitError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      'UserOperation rejected because paymaster (or signature aggregator) is throttled/banned.',
      {
        cause,
      },
    )
  }
}

export type PaymasterStakeTooLowErrorType = PaymasterStakeTooLowError & {
  code: -32505
  name: 'PaymasterStakeTooLowError'
}
export class PaymasterStakeTooLowError extends BaseError {
  static code = -32505

  override name = 'PaymasterStakeTooLowError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      'UserOperation rejected because paymaster (or signature aggregator) is throttled/banned.',
      {
        cause,
      },
    )
  }
}

export type PaymasterPostOpFunctionRevertedErrorType =
  PaymasterPostOpFunctionRevertedError & {
    name: 'PaymasterPostOpFunctionRevertedError'
  }
export class PaymasterPostOpFunctionRevertedError extends BaseError {
  static message = /aa50/
  override name = 'PaymasterPostOpFunctionRevertedError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Paymaster `postOp` function reverted.', {
      cause,
    })
  }
}

export type SenderAlreadyConstructedErrorType =
  SenderAlreadyConstructedError & {
    name: 'SenderAlreadyConstructedError'
  }
export class SenderAlreadyConstructedError extends BaseError {
  static message = /aa10/
  override name = 'SenderAlreadyConstructedError'
  constructor({
    cause,
    factory,
    factoryData,
    initCode,
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
    initCode?: Hex | undefined
  }) {
    super('Smart Account has already been deployed.', {
      cause,
      metaMessages: [
        'Remove the following properties and try again:',
        factory && '`factory`',
        factoryData && '`factoryData`',
        initCode && '`initCode`',
      ].filter(Boolean) as string[],
    })
  }
}

export type SignatureCheckFailedErrorType = SignatureCheckFailedError & {
  code: -32507
  name: 'SignatureCheckFailedError'
}
export class SignatureCheckFailedError extends BaseError {
  static code = -32507

  override name = 'SignatureCheckFailedError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      'UserOperation rejected because account signature check failed (or paymaster signature, if the paymaster uses its data as signature).',
      {
        cause,
      },
    )
  }
}

export type SmartAccountFunctionRevertedErrorType =
  SmartAccountFunctionRevertedError & {
    name: 'SmartAccountFunctionRevertedError'
  }
export class SmartAccountFunctionRevertedError extends BaseError {
  static message = /aa23/
  override name = 'SmartAccountFunctionRevertedError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('The `validateUserOp` function on the Smart Account reverted.', {
      cause,
    })
  }
}

export type UnsupportedSignatureAggregatorErrorType =
  UnsupportedSignatureAggregatorError & {
    code: -32506
    name: 'UnsupportedSignatureAggregatorError'
  }
export class UnsupportedSignatureAggregatorError extends BaseError {
  static code = -32506

  override name = 'UnsupportedSignatureAggregatorError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      'UserOperation rejected because account specified unsupported signature aggregator.',
      {
        cause,
      },
    )
  }
}

export type UserOperationExpiredErrorType = UserOperationExpiredError & {
  name: 'UserOperationExpiredError'
}
export class UserOperationExpiredError extends BaseError {
  static message = /aa22/
  override name = 'UserOperationExpiredError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('User Operation expired.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- the `validAfter` or `validUntil` values returned from `validateUserOp` on the Smart Account are not satisfied',
      ].filter(Boolean) as string[],
    })
  }
}

export type UserOperationPaymasterExpiredErrorType =
  UserOperationPaymasterExpiredError & {
    name: 'UserOperationPaymasterExpiredError'
  }
export class UserOperationPaymasterExpiredError extends BaseError {
  static message = /aa32/
  override name = 'UserOperationPaymasterExpiredError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Paymaster for User Operation expired.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- the `validAfter` or `validUntil` values returned from `validatePaymasterUserOp` on the Paymaster are not satisfied',
      ].filter(Boolean) as string[],
    })
  }
}

export type UserOperationSignatureErrorType = UserOperationSignatureError & {
  name: 'UserOperationSignatureError'
}
export class UserOperationSignatureError extends BaseError {
  static message = /aa24/
  override name = 'UserOperationSignatureError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Signature provided for the User Operation is invalid.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- the `signature` for the User Operation is incorrectly computed, and unable to be verified by the Smart Account',
      ].filter(Boolean) as string[],
    })
  }
}

export type UserOperationPaymasterSignatureErrorType =
  UserOperationPaymasterSignatureError & {
    name: 'UserOperationPaymasterSignatureError'
  }
export class UserOperationPaymasterSignatureError extends BaseError {
  static message = /aa34/
  override name = 'UserOperationPaymasterSignatureError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('Signature provided for the User Operation is invalid.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- the `signature` for the User Operation is incorrectly computed, and unable to be verified by the Paymaster',
      ].filter(Boolean) as string[],
    })
  }
}

export type UserOperationRejectedByEntryPointErrorType =
  UserOperationRejectedByEntryPointError & {
    code: -32500
    name: 'UserOperationRejectedByEntryPointError'
  }
export class UserOperationRejectedByEntryPointError extends BaseError {
  static code = -32500

  override name = 'UserOperationRejectedByEntryPointError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      "User Operation rejected by EntryPoint's `simulateValidation` during account creation or validation.",
      {
        cause,
      },
    )
  }
}

export type UserOperationRejectedByPaymasterErrorType =
  UserOperationRejectedByPaymasterError & {
    code: -32501
    name: 'UserOperationRejectedByPaymasterError'
  }
export class UserOperationRejectedByPaymasterError extends BaseError {
  static code = -32501

  override name = 'UserOperationRejectedByPaymasterError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super("User Operation rejected by Paymaster's `validatePaymasterUserOp`.", {
      cause,
    })
  }
}

export type UserOperationRejectedByOpCodeErrorType =
  UserOperationRejectedByOpCodeError & {
    code: -32502
    name: 'UserOperationRejectedByOpCodeError'
  }
export class UserOperationRejectedByOpCodeError extends BaseError {
  static code = -32502

  override name = 'UserOperationRejectedByOpCodeError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super('User Operation rejected with op code validation error.', {
      cause,
    })
  }
}

export type UserOperationOutOfTimeRangeErrorType =
  UserOperationOutOfTimeRangeError & {
    code: -32503
    name: 'UserOperationOutOfTimeRangeError'
  }
export class UserOperationOutOfTimeRangeError extends BaseError {
  static code = -32503

  override name = 'UserOperationOutOfTimeRangeError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      'UserOperation out of time-range: either wallet or paymaster returned a time-range, and it is already expired (or will expire soon).',
      {
        cause,
      },
    )
  }
}

export type UnknownBundlerErrorType = UnknownBundlerError & {
  name: 'UnknownBundlerError'
}
export class UnknownBundlerError extends BaseError {
  override name = 'UnknownBundlerError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      `An error occurred while executing user operation: ${cause?.shortMessage}`,
      {
        cause,
      },
    )
  }
}

export type VerificationGasLimitExceededErrorType =
  VerificationGasLimitExceededError & {
    name: 'VerificationGasLimitExceededError'
  }
export class VerificationGasLimitExceededError extends BaseError {
  static message = /aa40/
  override name = 'VerificationGasLimitExceededError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('User Operation verification gas limit exceeded.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- the gas used for verification exceeded the `verificationGasLimit`',
      ].filter(Boolean) as string[],
    })
  }
}

export type VerificationGasLimitTooLowErrorType =
  VerificationGasLimitTooLowError & {
    name: 'VerificationGasLimitTooLowError'
  }
export class VerificationGasLimitTooLowError extends BaseError {
  static message = /aa41/
  override name = 'VerificationGasLimitTooLowError'
  constructor({
    cause,
  }: {
    cause?: BaseError | undefined
  }) {
    super('User Operation verification gas limit is too low.', {
      cause,
      metaMessages: [
        'This could arise when:',
        '- the `verificationGasLimit` is too low to verify the User Operation',
      ].filter(Boolean) as string[],
    })
  }
}
