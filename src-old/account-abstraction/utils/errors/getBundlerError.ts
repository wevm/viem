import type { BaseError } from '../../../errors/base.js'
import type { ExactPartial } from '../../../types/utils.js'
import {
  AccountNotDeployedError,
  type AccountNotDeployedErrorType,
  ExecutionRevertedError,
  type ExecutionRevertedErrorType,
  FailedToSendToBeneficiaryError,
  type FailedToSendToBeneficiaryErrorType,
  GasValuesOverflowError,
  type GasValuesOverflowErrorType,
  HandleOpsOutOfGasError,
  type HandleOpsOutOfGasErrorType,
  InitCodeFailedError,
  type InitCodeFailedErrorType,
  InitCodeMustCreateSenderError,
  type InitCodeMustCreateSenderErrorType,
  InitCodeMustReturnSenderError,
  type InitCodeMustReturnSenderErrorType,
  InsufficientPrefundError,
  type InsufficientPrefundErrorType,
  InternalCallOnlyError,
  type InternalCallOnlyErrorType,
  InvalidAccountNonceError,
  type InvalidAccountNonceErrorType,
  InvalidAggregatorError,
  type InvalidAggregatorErrorType,
  InvalidBeneficiaryError,
  type InvalidBeneficiaryErrorType,
  InvalidFieldsError,
  type InvalidFieldsErrorType,
  InvalidPaymasterAndDataError,
  type InvalidPaymasterAndDataErrorType,
  PaymasterDepositTooLowError,
  type PaymasterDepositTooLowErrorType,
  PaymasterFunctionRevertedError,
  type PaymasterFunctionRevertedErrorType,
  PaymasterNotDeployedError,
  type PaymasterNotDeployedErrorType,
  PaymasterPostOpFunctionRevertedError,
  type PaymasterPostOpFunctionRevertedErrorType,
  PaymasterRateLimitError,
  type PaymasterRateLimitErrorType,
  PaymasterStakeTooLowError,
  type PaymasterStakeTooLowErrorType,
  SenderAlreadyConstructedError,
  type SenderAlreadyConstructedErrorType,
  SignatureCheckFailedError,
  type SignatureCheckFailedErrorType,
  SmartAccountFunctionRevertedError,
  type SmartAccountFunctionRevertedErrorType,
  UnknownBundlerError,
  type UnknownBundlerErrorType,
  UnsupportedSignatureAggregatorError,
  type UnsupportedSignatureAggregatorErrorType,
  UserOperationExpiredError,
  type UserOperationExpiredErrorType,
  UserOperationOutOfTimeRangeError,
  type UserOperationOutOfTimeRangeErrorType,
  UserOperationPaymasterExpiredError,
  type UserOperationPaymasterExpiredErrorType,
  UserOperationPaymasterSignatureError,
  type UserOperationPaymasterSignatureErrorType,
  UserOperationRejectedByEntryPointError,
  type UserOperationRejectedByEntryPointErrorType,
  UserOperationRejectedByOpCodeError,
  type UserOperationRejectedByOpCodeErrorType,
  UserOperationRejectedByPaymasterError,
  type UserOperationRejectedByPaymasterErrorType,
  UserOperationSignatureError,
  type UserOperationSignatureErrorType,
  VerificationGasLimitExceededError,
  type VerificationGasLimitExceededErrorType,
  VerificationGasLimitTooLowError,
  type VerificationGasLimitTooLowErrorType,
} from '../../errors/bundler.js'
import type { UserOperation } from '../../types/userOperation.js'

const bundlerErrors = [
  ExecutionRevertedError,
  InvalidFieldsError,
  PaymasterDepositTooLowError,
  PaymasterRateLimitError,
  PaymasterStakeTooLowError,
  SignatureCheckFailedError,
  UnsupportedSignatureAggregatorError,
  UserOperationOutOfTimeRangeError,
  UserOperationRejectedByEntryPointError,
  UserOperationRejectedByPaymasterError,
  UserOperationRejectedByOpCodeError,
]

export type GetBundlerErrorParameters = ExactPartial<UserOperation>

export type GetBundlerErrorReturnType =
  | AccountNotDeployedErrorType
  | ExecutionRevertedErrorType
  | FailedToSendToBeneficiaryErrorType
  | GasValuesOverflowErrorType
  | HandleOpsOutOfGasErrorType
  | InitCodeFailedErrorType
  | InitCodeMustCreateSenderErrorType
  | InitCodeMustReturnSenderErrorType
  | InsufficientPrefundErrorType
  | InternalCallOnlyErrorType
  | InvalidAccountNonceErrorType
  | InvalidAggregatorErrorType
  | InvalidBeneficiaryErrorType
  | InvalidFieldsErrorType
  | InvalidPaymasterAndDataErrorType
  | PaymasterDepositTooLowErrorType
  | PaymasterFunctionRevertedErrorType
  | PaymasterNotDeployedErrorType
  | PaymasterPostOpFunctionRevertedErrorType
  | PaymasterRateLimitErrorType
  | PaymasterStakeTooLowErrorType
  | SignatureCheckFailedErrorType
  | SenderAlreadyConstructedErrorType
  | SmartAccountFunctionRevertedErrorType
  | UnsupportedSignatureAggregatorErrorType
  | UserOperationOutOfTimeRangeErrorType
  | UserOperationRejectedByEntryPointErrorType
  | UserOperationRejectedByOpCodeErrorType
  | UserOperationRejectedByPaymasterErrorType
  | UnknownBundlerErrorType
  | UserOperationExpiredErrorType
  | UserOperationPaymasterExpiredErrorType
  | UserOperationPaymasterSignatureErrorType
  | UserOperationSignatureErrorType
  | VerificationGasLimitExceededErrorType
  | VerificationGasLimitTooLowErrorType

export function getBundlerError(
  err: BaseError,
  args: GetBundlerErrorParameters,
): GetBundlerErrorReturnType {
  const message = (err.details || '').toLowerCase()

  if (AccountNotDeployedError.message.test(message))
    return new AccountNotDeployedError({
      cause: err,
    }) as any
  if (FailedToSendToBeneficiaryError.message.test(message))
    return new FailedToSendToBeneficiaryError({
      cause: err,
    }) as any
  if (GasValuesOverflowError.message.test(message))
    return new GasValuesOverflowError({
      cause: err,
    }) as any
  if (HandleOpsOutOfGasError.message.test(message))
    return new HandleOpsOutOfGasError({
      cause: err,
    }) as any
  if (InitCodeFailedError.message.test(message))
    return new InitCodeFailedError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
    }) as any
  if (InitCodeMustCreateSenderError.message.test(message))
    return new InitCodeMustCreateSenderError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
    }) as any
  if (InitCodeMustReturnSenderError.message.test(message))
    return new InitCodeMustReturnSenderError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
      sender: args.sender,
    }) as any
  if (InsufficientPrefundError.message.test(message))
    return new InsufficientPrefundError({
      cause: err,
    }) as any
  if (InternalCallOnlyError.message.test(message))
    return new InternalCallOnlyError({
      cause: err,
    }) as any
  if (InvalidAccountNonceError.message.test(message))
    return new InvalidAccountNonceError({
      cause: err,
      nonce: args.nonce,
    }) as any
  if (InvalidAggregatorError.message.test(message))
    return new InvalidAggregatorError({
      cause: err,
    }) as any
  if (InvalidBeneficiaryError.message.test(message))
    return new InvalidBeneficiaryError({
      cause: err,
    }) as any
  if (InvalidPaymasterAndDataError.message.test(message))
    return new InvalidPaymasterAndDataError({
      cause: err,
    }) as any
  if (PaymasterDepositTooLowError.message.test(message))
    return new PaymasterDepositTooLowError({
      cause: err,
    }) as any
  if (PaymasterFunctionRevertedError.message.test(message))
    return new PaymasterFunctionRevertedError({
      cause: err,
    }) as any
  if (PaymasterNotDeployedError.message.test(message))
    return new PaymasterNotDeployedError({
      cause: err,
    }) as any
  if (PaymasterPostOpFunctionRevertedError.message.test(message))
    return new PaymasterPostOpFunctionRevertedError({
      cause: err,
    }) as any
  if (SmartAccountFunctionRevertedError.message.test(message))
    return new SmartAccountFunctionRevertedError({
      cause: err,
    }) as any
  if (SenderAlreadyConstructedError.message.test(message))
    return new SenderAlreadyConstructedError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
    }) as any
  if (UserOperationExpiredError.message.test(message))
    return new UserOperationExpiredError({
      cause: err,
    }) as any
  if (UserOperationPaymasterExpiredError.message.test(message))
    return new UserOperationPaymasterExpiredError({
      cause: err,
    }) as any
  if (UserOperationPaymasterSignatureError.message.test(message))
    return new UserOperationPaymasterSignatureError({
      cause: err,
    }) as any
  if (UserOperationSignatureError.message.test(message))
    return new UserOperationSignatureError({
      cause: err,
    }) as any
  if (VerificationGasLimitExceededError.message.test(message))
    return new VerificationGasLimitExceededError({
      cause: err,
    }) as any
  if (VerificationGasLimitTooLowError.message.test(message))
    return new VerificationGasLimitTooLowError({
      cause: err,
    }) as any

  const error = err.walk((e) =>
    bundlerErrors.some((error) => error.code === (e as { code: number }).code),
  ) as BaseError & { code: number; data: any }

  if (error) {
    if (error.code === ExecutionRevertedError.code)
      return new ExecutionRevertedError({
        cause: err,
        data: error.data,
        message: error.details,
      }) as any
    if (error.code === InvalidFieldsError.code)
      return new InvalidFieldsError({
        cause: err,
      }) as any
    if (error.code === PaymasterDepositTooLowError.code)
      return new PaymasterDepositTooLowError({
        cause: err,
      }) as any
    if (error.code === PaymasterRateLimitError.code)
      return new PaymasterRateLimitError({
        cause: err,
      }) as any
    if (error.code === PaymasterStakeTooLowError.code)
      return new PaymasterStakeTooLowError({
        cause: err,
      }) as any
    if (error.code === SignatureCheckFailedError.code)
      return new SignatureCheckFailedError({
        cause: err,
      }) as any
    if (error.code === UnsupportedSignatureAggregatorError.code)
      return new UnsupportedSignatureAggregatorError({
        cause: err,
      }) as any
    if (error.code === UserOperationOutOfTimeRangeError.code)
      return new UserOperationOutOfTimeRangeError({
        cause: err,
      }) as any
    if (error.code === UserOperationRejectedByEntryPointError.code)
      return new UserOperationRejectedByEntryPointError({
        cause: err,
      }) as any
    if (error.code === UserOperationRejectedByPaymasterError.code)
      return new UserOperationRejectedByPaymasterError({
        cause: err,
      }) as any
    if (error.code === UserOperationRejectedByOpCodeError.code)
      return new UserOperationRejectedByOpCodeError({
        cause: err,
      }) as any
  }

  return new UnknownBundlerError({
    cause: err,
  }) as any
}
