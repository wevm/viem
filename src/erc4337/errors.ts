import { Value, type Address, type Hex } from 'ox'

import * as Errors from '../core/Errors.js'
import * as Json from '../utils/Json.js'
import type * as UserOperation from './UserOperation.js'

type UserOperationArgs = UserOperation.UserOperation

type Cause = Error | undefined

type Options = {
  cause?: Cause
}

/** Thrown when the Smart Account is not deployed. */
export class AccountNotDeployedError extends Errors.BaseError<Cause> {
  static message = /aa20/

  override readonly name = 'AccountNotDeployedError'

  constructor(options: Options) {
    super('Smart Account is not deployed.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- No `factory`/`factoryData` or `initCode` properties are provided for Smart Account deployment.',
        '- An incorrect `sender` address is provided.',
      ],
    })
  }
}

/** Thrown when EntryPoint execution reverts. */
export class ExecutionRevertedError extends Errors.BaseError<Cause> {
  static code = -32521
  static message = /execution reverted/

  data?: { revertData?: Hex.Hex | undefined } | undefined

  override readonly name = 'ExecutionRevertedError'

  constructor(
    options: Options & {
      data?: { revertData?: Hex.Hex | undefined } | undefined
      message?: string | undefined
    } = {},
  ) {
    const reason = options.message
      ?.replace('execution reverted: ', '')
      ?.replace('execution reverted', '')
    super(
      `Execution reverted ${
        reason ? `with reason: ${reason}` : 'for an unknown reason'
      }.`,
      { cause: options.cause },
    )
    this.data = options.data
  }
}

/** Thrown when EntryPoint fails to send funds to the beneficiary. */
export class FailedToSendToBeneficiaryError extends Errors.BaseError<Cause> {
  static message = /aa91/

  override readonly name = 'FailedToSendToBeneficiaryError'

  constructor(options: Options) {
    super('Failed to send funds to beneficiary.', { cause: options.cause })
  }
}

/** Thrown when a User Operation gas value overflows. */
export class GasValuesOverflowError extends Errors.BaseError<Cause> {
  static message = /aa94/

  override readonly name = 'GasValuesOverflowError'

  constructor(options: Options) {
    super('Gas value overflowed.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- one of the gas values exceeded 2**120 (uint120)',
      ],
    })
  }
}

/** Thrown when `handleOps` runs out of gas. */
export class HandleOpsOutOfGasError extends Errors.BaseError<Cause> {
  static message = /aa95/

  override readonly name = 'HandleOpsOutOfGasError'

  constructor(options: Options) {
    super(
      'The `handleOps` function was called by the Bundler with a gas limit too low.',
      { cause: options.cause },
    )
  }
}

/** Thrown when Smart Account deployment simulation fails. */
export class InitCodeFailedError extends Errors.BaseError<Cause> {
  static message = /aa13/

  override readonly name = 'InitCodeFailedError'

  constructor(
    options: Options & {
      factory?: Address.Address | undefined
      factoryData?: Hex.Hex | undefined
      initCode?: Hex.Hex | undefined
    },
  ) {
    const { cause, factory, factoryData, initCode } = options
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
      ],
    })
  }
}

/** Thrown when Smart Account initialization does not create an account. */
export class InitCodeMustCreateSenderError extends Errors.BaseError<Cause> {
  static message = /aa15/

  override readonly name = 'InitCodeMustCreateSenderError'

  constructor(
    options: Options & {
      factory?: Address.Address | undefined
      factoryData?: Hex.Hex | undefined
      initCode?: Hex.Hex | undefined
    },
  ) {
    const { cause, factory, factoryData, initCode } = options
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
        ],
      },
    )
  }
}

/** Thrown when Smart Account initialization returns the wrong sender. */
export class InitCodeMustReturnSenderError extends Errors.BaseError<Cause> {
  static message = /aa14/

  override readonly name = 'InitCodeMustReturnSenderError'

  constructor(
    options: Options & {
      factory?: Address.Address | undefined
      factoryData?: Hex.Hex | undefined
      initCode?: Hex.Hex | undefined
      sender?: Address.Address | undefined
    },
  ) {
    const { cause, factory, factoryData, initCode, sender } = options
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
        ],
      },
    )
  }
}

/** Thrown when the Smart Account cannot cover the required prefund. */
export class InsufficientPrefundError extends Errors.BaseError<Cause> {
  static message = /aa21/

  override readonly name = 'InsufficientPrefundError'

  constructor(options: Options) {
    super(
      'Smart Account does not have sufficient funds to execute the User Operation.',
      {
        cause: options.cause,
        metaMessages: [
          'This could arise when:',
          '- the Smart Account does not have sufficient funds to cover the required prefund, or',
          '- a Paymaster was not provided',
        ],
      },
    )
  }
}

/** Thrown when the Bundler calls an internal EntryPoint function. */
export class InternalCallOnlyError extends Errors.BaseError<Cause> {
  static message = /aa92/

  override readonly name = 'InternalCallOnlyError'

  constructor(options: Options) {
    super('Bundler attempted to call an invalid function on the EntryPoint.', {
      cause: options.cause,
    })
  }
}

/** Thrown when an invalid Smart Account nonce is used. */
export class InvalidAccountNonceError extends Errors.BaseError<Cause> {
  static message = /aa25/

  override readonly name = 'InvalidAccountNonceError'

  constructor(options: Options & { nonce?: bigint | undefined }) {
    super('Invalid Smart Account nonce used for User Operation.', {
      cause: options.cause,
      metaMessages: [options.nonce ? `nonce: ${options.nonce}` : undefined],
    })
  }
}

/** Thrown when the Bundler uses an invalid aggregator. */
export class InvalidAggregatorError extends Errors.BaseError<Cause> {
  static message = /aa96/

  override readonly name = 'InvalidAggregatorError'

  constructor(options: Options) {
    super(
      'Bundler used an invalid aggregator for handling aggregated User Operations.',
      { cause: options.cause },
    )
  }
}

/** Thrown when the Bundler has not set a beneficiary address. */
export class InvalidBeneficiaryError extends Errors.BaseError<Cause> {
  static message = /aa90/

  override readonly name = 'InvalidBeneficiaryError'

  constructor(options: Options) {
    super('Bundler has not set a beneficiary address.', {
      cause: options.cause,
    })
  }
}

/** Thrown when invalid fields are set on a User Operation. */
export class InvalidFieldsError extends Errors.BaseError<Cause> {
  static code = -32602

  override readonly name = 'InvalidFieldsError'

  constructor(options: Options) {
    super('Invalid fields set on User Operation.', { cause: options.cause })
  }
}

/** Thrown when Paymaster properties are invalid. */
export class InvalidPaymasterAndDataError extends Errors.BaseError<Cause> {
  static message = /aa93/

  override readonly name = 'InvalidPaymasterAndDataError'

  constructor(options: Options & { paymasterAndData?: Hex.Hex | undefined }) {
    super('Paymaster properties provided are invalid.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- the `paymasterAndData` property is of an incorrect length\n',
        options.paymasterAndData &&
          `paymasterAndData: ${options.paymasterAndData}`,
      ],
    })
  }
}

/** Thrown when the Paymaster deposit is too low. */
export class PaymasterDepositTooLowError extends Errors.BaseError<Cause> {
  static code = -32508
  static message = /aa31/

  override readonly name = 'PaymasterDepositTooLowError'

  constructor(options: Options) {
    super('Paymaster deposit for the User Operation is too low.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- the Paymaster has deposited less than the expected amount via the `deposit` function',
      ],
    })
  }
}

/** Thrown when the Paymaster validation function reverts. */
export class PaymasterFunctionRevertedError extends Errors.BaseError<Cause> {
  static message = /aa33/

  override readonly name = 'PaymasterFunctionRevertedError'

  constructor(options: Options) {
    super('The `validatePaymasterUserOp` function on the Paymaster reverted.', {
      cause: options.cause,
    })
  }
}

/** Thrown when the Paymaster contract is not deployed. */
export class PaymasterNotDeployedError extends Errors.BaseError<Cause> {
  static message = /aa30/

  override readonly name = 'PaymasterNotDeployedError'

  constructor(options: Options) {
    super('The Paymaster contract has not been deployed.', {
      cause: options.cause,
    })
  }
}

/** Thrown when the Paymaster post-operation function reverts. */
export class PaymasterPostOpFunctionRevertedError extends Errors.BaseError<Cause> {
  static message = /aa50/

  override readonly name = 'PaymasterPostOpFunctionRevertedError'

  constructor(options: Options) {
    super('Paymaster `postOp` function reverted.', { cause: options.cause })
  }
}

/** Thrown when the Paymaster or aggregator is rate limited. */
export class PaymasterRateLimitError extends Errors.BaseError<Cause> {
  static code = -32504

  override readonly name = 'PaymasterRateLimitError'

  constructor(options: Options) {
    super(
      'UserOperation rejected because paymaster (or signature aggregator) is throttled/banned.',
      { cause: options.cause },
    )
  }
}

/** Thrown when the Paymaster or aggregator stake is too low. */
export class PaymasterStakeTooLowError extends Errors.BaseError<Cause> {
  static code = -32505

  override readonly name = 'PaymasterStakeTooLowError'

  constructor(options: Options) {
    super(
      'UserOperation rejected because paymaster (or signature aggregator) stake or unstake-delay is too low.',
      { cause: options.cause },
    )
  }
}

/** Thrown when the Smart Account is already deployed. */
export class SenderAlreadyConstructedError extends Errors.BaseError<Cause> {
  static message = /aa10/

  override readonly name = 'SenderAlreadyConstructedError'

  constructor(
    options: Options & {
      factory?: Address.Address | undefined
      factoryData?: Hex.Hex | undefined
      initCode?: Hex.Hex | undefined
    },
  ) {
    const { cause, factory, factoryData, initCode } = options
    super('Smart Account has already been deployed.', {
      cause,
      metaMessages: [
        'Remove the following properties and try again:',
        factory && '`factory`',
        factoryData && '`factoryData`',
        initCode && '`initCode`',
      ],
    })
  }
}

/** Thrown when an account signature check fails. */
export class SignatureCheckFailedError extends Errors.BaseError<Cause> {
  static code = -32507

  override readonly name = 'SignatureCheckFailedError'

  constructor(options: Options) {
    super(
      'UserOperation rejected because account signature check failed (or paymaster signature, if the paymaster uses its data as signature).',
      { cause: options.cause },
    )
  }
}

/** Thrown when the Smart Account validation function reverts. */
export class SmartAccountFunctionRevertedError extends Errors.BaseError<Cause> {
  static message = /aa23/

  override readonly name = 'SmartAccountFunctionRevertedError'

  constructor(options: Options) {
    super('The `validateUserOp` function on the Smart Account reverted.', {
      cause: options.cause,
    })
  }
}

/** Thrown when an unknown Bundler error occurs. */
export class UnknownBundlerError extends Errors.BaseError<Cause> {
  override readonly name = 'UnknownBundlerError'

  constructor(options: Options) {
    const message =
      options.cause && 'shortMessage' in options.cause
        ? options.cause.shortMessage
        : options.cause?.message
    super(`An error occurred while executing user operation: ${message}`, {
      cause: options.cause,
    })
  }
}

/** Thrown when the signature aggregator is unsupported. */
export class UnsupportedSignatureAggregatorError extends Errors.BaseError<Cause> {
  static code = -32506

  override readonly name = 'UnsupportedSignatureAggregatorError'

  constructor(options: Options) {
    super(
      'UserOperation rejected because account specified unsupported signature aggregator.',
      { cause: options.cause },
    )
  }
}

/** Thrown when a User Operation fails during execution. */
export class UserOperationExecutionError extends Errors.BaseError<Error> {
  override cause: Error
  override readonly name = 'UserOperationExecutionError'

  constructor(
    cause: Error,
    options: UserOperationArgs & { docsPath?: string | undefined },
  ) {
    const prettyArgs = Json.prettyPrint(
      {
        callData: options.callData,
        callGasLimit: options.callGasLimit,
        factory: options.factory,
        factoryData: options.factoryData,
        initCode: options.initCode,
        maxFeePerGas:
          typeof options.maxFeePerGas !== 'undefined'
            ? `${Value.formatGwei(options.maxFeePerGas)} gwei`
            : undefined,
        maxPriorityFeePerGas:
          typeof options.maxPriorityFeePerGas !== 'undefined'
            ? `${Value.formatGwei(options.maxPriorityFeePerGas)} gwei`
            : undefined,
        nonce: options.nonce,
        paymaster: options.paymaster,
        paymasterAndData: options.paymasterAndData,
        paymasterData: options.paymasterData,
        paymasterPostOpGasLimit: options.paymasterPostOpGasLimit,
        paymasterVerificationGasLimit: options.paymasterVerificationGasLimit,
        preVerificationGas: options.preVerificationGas,
        sender: options.sender,
        signature: options.signature,
        verificationGasLimit: options.verificationGasLimit,
      },
      { indent: 2 },
    )
    const shortMessage =
      'shortMessage' in cause && typeof cause.shortMessage === 'string'
        ? cause.shortMessage
        : cause.message
    const metaMessages =
      'metaMessages' in cause && Array.isArray(cause.metaMessages)
        ? cause.metaMessages
        : undefined

    super(shortMessage, {
      cause,
      docsPath: options.docsPath,
      metaMessages: [
        ...(metaMessages ? [...metaMessages, ' '] : []),
        'Request Arguments:',
        prettyArgs,
      ],
    })
    this.cause = cause
  }
}

/** Thrown when a User Operation expires. */
export class UserOperationExpiredError extends Errors.BaseError<Cause> {
  static message = /aa22/

  override readonly name = 'UserOperationExpiredError'

  constructor(options: Options) {
    super('User Operation expired.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- the `validAfter` or `validUntil` values returned from `validateUserOp` on the Smart Account are not satisfied',
      ],
    })
  }
}

/** Thrown when a User Operation hash is not found. */
export class UserOperationNotFoundError extends Errors.BaseError {
  override readonly name = 'UserOperationNotFoundError'

  constructor(options: { hash: Hex.Hex }) {
    super(`User Operation with hash "${options.hash}" could not be found.`)
  }
}

/** Thrown when a User Operation is outside its valid time range. */
export class UserOperationOutOfTimeRangeError extends Errors.BaseError<Cause> {
  static code = -32503

  override readonly name = 'UserOperationOutOfTimeRangeError'

  constructor(options: Options) {
    super(
      'UserOperation out of time-range: either wallet or paymaster returned a time-range, and it is already expired (or will expire soon).',
      { cause: options.cause },
    )
  }
}

/** Thrown when a Paymaster for a User Operation expires. */
export class UserOperationPaymasterExpiredError extends Errors.BaseError<Cause> {
  static message = /aa32/

  override readonly name = 'UserOperationPaymasterExpiredError'

  constructor(options: Options) {
    super('Paymaster for User Operation expired.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- the `validAfter` or `validUntil` values returned from `validatePaymasterUserOp` on the Paymaster are not satisfied',
      ],
    })
  }
}

/** Thrown when a Paymaster signature is invalid. */
export class UserOperationPaymasterSignatureError extends Errors.BaseError<Cause> {
  static message = /aa34/

  override readonly name = 'UserOperationPaymasterSignatureError'

  constructor(options: Options) {
    super('Signature provided for the User Operation is invalid.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- the `signature` for the User Operation is incorrectly computed, and unable to be verified by the Paymaster',
      ],
    })
  }
}

/** Thrown when a User Operation receipt is not found. */
export class UserOperationReceiptNotFoundError extends Errors.BaseError {
  override readonly name = 'UserOperationReceiptNotFoundError'

  constructor(options: { hash: Hex.Hex }) {
    super(
      `User Operation receipt with hash "${options.hash}" could not be found. The User Operation may not have been processed yet.`,
    )
  }
}

/** Thrown when EntryPoint rejects a User Operation. */
export class UserOperationRejectedByEntryPointError extends Errors.BaseError<Cause> {
  static code = -32500

  override readonly name = 'UserOperationRejectedByEntryPointError'

  constructor(options: Options) {
    super(
      "User Operation rejected by EntryPoint's `simulateValidation` during account creation or validation.",
      { cause: options.cause },
    )
  }
}

/** Thrown when op code validation rejects a User Operation. */
export class UserOperationRejectedByOpCodeError extends Errors.BaseError<Cause> {
  static code = -32502

  override readonly name = 'UserOperationRejectedByOpCodeError'

  constructor(options: Options) {
    super('User Operation rejected with op code validation error.', {
      cause: options.cause,
    })
  }
}

/** Thrown when a Paymaster rejects a User Operation. */
export class UserOperationRejectedByPaymasterError extends Errors.BaseError<Cause> {
  static code = -32501

  override readonly name = 'UserOperationRejectedByPaymasterError'

  constructor(options: Options) {
    super("User Operation rejected by Paymaster's `validatePaymasterUserOp`.", {
      cause: options.cause,
    })
  }
}

/** Thrown when a User Operation signature is invalid. */
export class UserOperationSignatureError extends Errors.BaseError<Cause> {
  static message = /aa24/

  override readonly name = 'UserOperationSignatureError'

  constructor(options: Options) {
    super('Signature provided for the User Operation is invalid.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- the `signature` for the User Operation is incorrectly computed, and unable to be verified by the Smart Account',
      ],
    })
  }
}

/** Thrown when User Operation verification gas exceeds its limit. */
export class VerificationGasLimitExceededError extends Errors.BaseError<Cause> {
  static message = /aa40/

  override readonly name = 'VerificationGasLimitExceededError'

  constructor(options: Options) {
    super('User Operation verification gas limit exceeded.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- the gas used for verification exceeded the `verificationGasLimit`',
      ],
    })
  }
}

/** Thrown when User Operation verification gas limit is too low. */
export class VerificationGasLimitTooLowError extends Errors.BaseError<Cause> {
  static message = /aa41/

  override readonly name = 'VerificationGasLimitTooLowError'

  constructor(options: Options) {
    super('User Operation verification gas limit is too low.', {
      cause: options.cause,
      metaMessages: [
        'This could arise when:',
        '- the `verificationGasLimit` is too low to verify the User Operation',
      ],
    })
  }
}

/** Thrown when waiting for a User Operation receipt times out. */
export class WaitForUserOperationReceiptTimeoutError extends Errors.BaseError {
  override readonly name = 'WaitForUserOperationReceiptTimeoutError'

  constructor(options: { hash: Hex.Hex }) {
    super(
      `Timed out while waiting for User Operation with hash "${options.hash}" to be confirmed.`,
    )
  }
}
