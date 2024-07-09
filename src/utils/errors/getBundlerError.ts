import { BaseError } from '../../errors/base.js'
import {
  AccountNotDeployedError,
  type AccountNotDeployedErrorType,
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
  SenderAlreadyConstructedError,
  type SenderAlreadyConstructedErrorType,
  SmartAccountFunctionRevertedError,
  type SmartAccountFunctionRevertedErrorType,
  UnknownBundlerError,
  type UnknownBundlerErrorType,
  UserOperationExpiredError,
  type UserOperationExpiredErrorType,
  UserOperationPaymasterExpiredError,
  type UserOperationPaymasterExpiredErrorType,
  UserOperationPaymasterSignatureError,
  type UserOperationPaymasterSignatureErrorType,
  UserOperationSignatureError,
  type UserOperationSignatureErrorType,
  VerificationGasLimitExceededError,
  type VerificationGasLimitExceededErrorType,
  VerificationGasLimitTooLowError,
  type VerificationGasLimitTooLowErrorType,
} from '../../errors/bundler.js'
import { ExecutionRevertedError } from '../../errors/node.js'
import type { UserOperation } from '../../types/userOperation.js'
import type { ExactPartial } from '../../types/utils.js'

export type GetBundlerErrorParameters = ExactPartial<UserOperation>

export type GetBundlerErrorReturnType =
  | AccountNotDeployedErrorType
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
  | InvalidPaymasterAndDataErrorType
  | PaymasterDepositTooLowErrorType
  | PaymasterFunctionRevertedErrorType
  | PaymasterNotDeployedErrorType
  | PaymasterPostOpFunctionRevertedErrorType
  | SenderAlreadyConstructedErrorType
  | SmartAccountFunctionRevertedErrorType
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

  const executionRevertedError =
    err instanceof BaseError
      ? err.walk(
          (e) => (e as { code: number }).code === ExecutionRevertedError.code,
        )
      : err
  if (executionRevertedError instanceof BaseError)
    return new ExecutionRevertedError({
      cause: err,
      message: executionRevertedError.details,
    }) as any
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
  return new UnknownBundlerError({
    cause: err,
  }) as any
}
