import type { Abi } from 'abitype'
import { AbiError, AbiParameters, type Address, type Hex } from 'ox'

import * as ContractError from '../../core/ContractError.js'
import * as Errors from '../../core/Errors.js'
import { getRevertData as getCoreRevertData } from '../../core/internal/errors.js'
import type { ExactPartial } from '../../core/internal/types.js'
import * as AccountAbstractionErrors from '../errors.js'
import type * as UserOperation from '../UserOperation.js'

type BundlerError =
  | AccountAbstractionErrors.AccountNotDeployedError
  | AccountAbstractionErrors.ExecutionRevertedError
  | AccountAbstractionErrors.FailedToSendToBeneficiaryError
  | AccountAbstractionErrors.GasValuesOverflowError
  | AccountAbstractionErrors.HandleOpsOutOfGasError
  | AccountAbstractionErrors.InitCodeFailedError
  | AccountAbstractionErrors.InitCodeMustCreateSenderError
  | AccountAbstractionErrors.InitCodeMustReturnSenderError
  | AccountAbstractionErrors.InsufficientPrefundError
  | AccountAbstractionErrors.InternalCallOnlyError
  | AccountAbstractionErrors.InvalidAccountNonceError
  | AccountAbstractionErrors.InvalidAggregatorError
  | AccountAbstractionErrors.InvalidBeneficiaryError
  | AccountAbstractionErrors.InvalidFieldsError
  | AccountAbstractionErrors.InvalidPaymasterAndDataError
  | AccountAbstractionErrors.PaymasterDepositTooLowError
  | AccountAbstractionErrors.PaymasterFunctionRevertedError
  | AccountAbstractionErrors.PaymasterNotDeployedError
  | AccountAbstractionErrors.PaymasterPostOpFunctionRevertedError
  | AccountAbstractionErrors.PaymasterRateLimitError
  | AccountAbstractionErrors.PaymasterStakeTooLowError
  | AccountAbstractionErrors.SenderAlreadyConstructedError
  | AccountAbstractionErrors.SignatureCheckFailedError
  | AccountAbstractionErrors.SmartAccountFunctionRevertedError
  | AccountAbstractionErrors.UnknownBundlerError
  | AccountAbstractionErrors.UnsupportedSignatureAggregatorError
  | AccountAbstractionErrors.UserOperationExpiredError
  | AccountAbstractionErrors.UserOperationOutOfTimeRangeError
  | AccountAbstractionErrors.UserOperationPaymasterExpiredError
  | AccountAbstractionErrors.UserOperationPaymasterSignatureError
  | AccountAbstractionErrors.UserOperationRejectedByEntryPointError
  | AccountAbstractionErrors.UserOperationRejectedByOpCodeError
  | AccountAbstractionErrors.UserOperationRejectedByPaymasterError
  | AccountAbstractionErrors.UserOperationSignatureError
  | AccountAbstractionErrors.VerificationGasLimitExceededError
  | AccountAbstractionErrors.VerificationGasLimitTooLowError

type BundlerErrorCode = {
  code?: unknown
  data?: unknown
  details?: string | undefined
}

type Call = {
  abi?: Abi | readonly unknown[] | undefined
  args?: readonly unknown[] | undefined
  functionName?: string | undefined
  to?: Address.Address | undefined
}

type ContractCall = Call & {
  abi: Abi | readonly unknown[]
  functionName: string
}

const bundlerErrors = [
  AccountAbstractionErrors.ExecutionRevertedError,
  AccountAbstractionErrors.InvalidFieldsError,
  AccountAbstractionErrors.PaymasterDepositTooLowError,
  AccountAbstractionErrors.PaymasterRateLimitError,
  AccountAbstractionErrors.PaymasterStakeTooLowError,
  AccountAbstractionErrors.SignatureCheckFailedError,
  AccountAbstractionErrors.UnsupportedSignatureAggregatorError,
  AccountAbstractionErrors.UserOperationOutOfTimeRangeError,
  AccountAbstractionErrors.UserOperationRejectedByEntryPointError,
  AccountAbstractionErrors.UserOperationRejectedByPaymasterError,
  AccountAbstractionErrors.UserOperationRejectedByOpCodeError,
]

/** Maps raw Bundler errors to account-abstraction errors. */
export function getBundlerError(
  err: Errors.BaseError,
  args: ExactPartial<UserOperation.UserOperation>,
): BundlerError {
  const message = (err.details || '').toLowerCase()

  if (AccountAbstractionErrors.AccountNotDeployedError.message.test(message))
    return new AccountAbstractionErrors.AccountNotDeployedError({ cause: err })
  if (
    AccountAbstractionErrors.FailedToSendToBeneficiaryError.message.test(
      message,
    )
  )
    return new AccountAbstractionErrors.FailedToSendToBeneficiaryError({
      cause: err,
    })
  if (AccountAbstractionErrors.GasValuesOverflowError.message.test(message))
    return new AccountAbstractionErrors.GasValuesOverflowError({ cause: err })
  if (AccountAbstractionErrors.HandleOpsOutOfGasError.message.test(message))
    return new AccountAbstractionErrors.HandleOpsOutOfGasError({ cause: err })
  if (AccountAbstractionErrors.InitCodeFailedError.message.test(message))
    return new AccountAbstractionErrors.InitCodeFailedError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
    })
  if (
    AccountAbstractionErrors.InitCodeMustCreateSenderError.message.test(message)
  )
    return new AccountAbstractionErrors.InitCodeMustCreateSenderError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
    })
  if (
    AccountAbstractionErrors.InitCodeMustReturnSenderError.message.test(message)
  )
    return new AccountAbstractionErrors.InitCodeMustReturnSenderError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
      sender: args.sender,
    })
  if (AccountAbstractionErrors.InsufficientPrefundError.message.test(message))
    return new AccountAbstractionErrors.InsufficientPrefundError({ cause: err })
  if (AccountAbstractionErrors.InternalCallOnlyError.message.test(message))
    return new AccountAbstractionErrors.InternalCallOnlyError({ cause: err })
  if (AccountAbstractionErrors.InvalidAccountNonceError.message.test(message))
    return new AccountAbstractionErrors.InvalidAccountNonceError({
      cause: err,
      nonce: args.nonce,
    })
  if (AccountAbstractionErrors.InvalidAggregatorError.message.test(message))
    return new AccountAbstractionErrors.InvalidAggregatorError({ cause: err })
  if (AccountAbstractionErrors.InvalidBeneficiaryError.message.test(message))
    return new AccountAbstractionErrors.InvalidBeneficiaryError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.InvalidPaymasterAndDataError.message.test(message)
  )
    return new AccountAbstractionErrors.InvalidPaymasterAndDataError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.PaymasterDepositTooLowError.message.test(message)
  )
    return new AccountAbstractionErrors.PaymasterDepositTooLowError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.PaymasterFunctionRevertedError.message.test(
      message,
    )
  )
    return new AccountAbstractionErrors.PaymasterFunctionRevertedError({
      cause: err,
    })
  if (AccountAbstractionErrors.PaymasterNotDeployedError.message.test(message))
    return new AccountAbstractionErrors.PaymasterNotDeployedError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.PaymasterPostOpFunctionRevertedError.message.test(
      message,
    )
  )
    return new AccountAbstractionErrors.PaymasterPostOpFunctionRevertedError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.SmartAccountFunctionRevertedError.message.test(
      message,
    )
  )
    return new AccountAbstractionErrors.SmartAccountFunctionRevertedError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.SenderAlreadyConstructedError.message.test(message)
  )
    return new AccountAbstractionErrors.SenderAlreadyConstructedError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
      initCode: args.initCode,
    })
  if (AccountAbstractionErrors.UserOperationExpiredError.message.test(message))
    return new AccountAbstractionErrors.UserOperationExpiredError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.UserOperationPaymasterExpiredError.message.test(
      message,
    )
  )
    return new AccountAbstractionErrors.UserOperationPaymasterExpiredError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.UserOperationPaymasterSignatureError.message.test(
      message,
    )
  )
    return new AccountAbstractionErrors.UserOperationPaymasterSignatureError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.UserOperationSignatureError.message.test(message)
  )
    return new AccountAbstractionErrors.UserOperationSignatureError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.VerificationGasLimitExceededError.message.test(
      message,
    )
  )
    return new AccountAbstractionErrors.VerificationGasLimitExceededError({
      cause: err,
    })
  if (
    AccountAbstractionErrors.VerificationGasLimitTooLowError.message.test(
      message,
    )
  )
    return new AccountAbstractionErrors.VerificationGasLimitTooLowError({
      cause: err,
    })

  const error = err.walk((value) =>
    Boolean(getBundlerErrorCode(value as BundlerErrorCode)),
  ) as (Errors.BaseError & BundlerErrorCode) | null

  if (error) {
    const code = getBundlerErrorCode(error)
    if (code === AccountAbstractionErrors.ExecutionRevertedError.code)
      return new AccountAbstractionErrors.ExecutionRevertedError({
        cause: err,
        data: normalizeRevertData(error.data),
        message: error.details,
      })
    if (code === AccountAbstractionErrors.InvalidFieldsError.code)
      return new AccountAbstractionErrors.InvalidFieldsError({ cause: err })
    if (code === AccountAbstractionErrors.PaymasterDepositTooLowError.code)
      return new AccountAbstractionErrors.PaymasterDepositTooLowError({
        cause: err,
      })
    if (code === AccountAbstractionErrors.PaymasterRateLimitError.code)
      return new AccountAbstractionErrors.PaymasterRateLimitError({
        cause: err,
      })
    if (code === AccountAbstractionErrors.PaymasterStakeTooLowError.code)
      return new AccountAbstractionErrors.PaymasterStakeTooLowError({
        cause: err,
      })
    if (code === AccountAbstractionErrors.SignatureCheckFailedError.code)
      return new AccountAbstractionErrors.SignatureCheckFailedError({
        cause: err,
      })
    if (
      code === AccountAbstractionErrors.UnsupportedSignatureAggregatorError.code
    )
      return new AccountAbstractionErrors.UnsupportedSignatureAggregatorError({
        cause: err,
      })
    if (code === AccountAbstractionErrors.UserOperationOutOfTimeRangeError.code)
      return new AccountAbstractionErrors.UserOperationOutOfTimeRangeError({
        cause: err,
      })
    if (
      code ===
      AccountAbstractionErrors.UserOperationRejectedByEntryPointError.code
    )
      return new AccountAbstractionErrors.UserOperationRejectedByEntryPointError(
        {
          cause: err,
        },
      )
    if (
      code ===
      AccountAbstractionErrors.UserOperationRejectedByPaymasterError.code
    )
      return new AccountAbstractionErrors.UserOperationRejectedByPaymasterError(
        {
          cause: err,
        },
      )
    if (
      code === AccountAbstractionErrors.UserOperationRejectedByOpCodeError.code
    )
      return new AccountAbstractionErrors.UserOperationRejectedByOpCodeError({
        cause: err,
      })
  }

  return new AccountAbstractionErrors.UnknownBundlerError({ cause: err })
}

/** Wraps raw User Operation errors with request context. */
export function getUserOperationError<err extends Errors.BaseError>(
  err: err,
  options: UserOperation.UserOperation & {
    calls?: readonly unknown[] | undefined
    docsPath?: string | undefined
  },
): AccountAbstractionErrors.UserOperationExecutionError & {
  cause: err | Error
} {
  const { calls, docsPath, ...args } = options
  const cause = (() => {
    const cause = getBundlerError(err, args)
    if (
      calls &&
      cause instanceof AccountAbstractionErrors.ExecutionRevertedError
    ) {
      const revertData = getRevertData(cause)
      const contractCalls = calls.filter(isContractCall)
      if (revertData && contractCalls.length > 0)
        return getContractError({ calls: contractCalls, revertData })
    }
    return cause
  })()
  return new AccountAbstractionErrors.UserOperationExecutionError(cause, {
    docsPath,
    ...args,
  }) as AccountAbstractionErrors.UserOperationExecutionError & {
    cause: err | Error
  }
}

function getContractError(options: {
  calls: readonly ContractCall[]
  revertData: Hex.Hex
}) {
  const { calls, revertData } = options
  const call =
    calls.length === 1 ? calls[0] : findCompatibleCall(calls, revertData)
  const fallbackFunctionName = calls
    .map((call) => call.functionName)
    .filter((value): value is string => typeof value === 'string')
    .join(' | ')

  return ContractError.fromError(
    revertData === '0x'
      ? new AbiParameters.ZeroDataError()
      : new ContractError.RawContractError({ data: revertData }),
    {
      abi: call?.abi ?? [],
      address: call?.to,
      args: call?.args,
      functionName: call?.functionName ?? fallbackFunctionName,
    },
  )
}

function getRevertData(error: Errors.BaseError<Error | undefined>) {
  let revertData = getCoreRevertData(error)
  if (revertData) return revertData
  error.walk((value) => {
    const error = value as { data?: unknown; message?: unknown }
    const data = normalizeRevertData(error.data)?.revertData
    const message =
      !(value instanceof Errors.BaseError) && typeof error.message === 'string'
        ? error.message
        : undefined
    const match = message?.match(/(0x[A-Za-z0-9]*)/)
    if (data || match?.[1]) {
      revertData = data ?? (match?.[1] as Hex.Hex)
      return true
    }
    return false
  })
  return revertData
}

function findCompatibleCall(
  calls: readonly ContractCall[],
  revertData: Hex.Hex,
) {
  const compatibleCalls = calls.filter((call) => {
    try {
      return Boolean(AbiError.extract(call.abi, revertData))
    } catch {
      return false
    }
  })
  return compatibleCalls.length === 1 ? compatibleCalls[0] : undefined
}

function isContractCall(call: unknown): call is ContractCall {
  return (
    typeof call === 'object' &&
    call !== null &&
    'abi' in call &&
    'functionName' in call &&
    Boolean(call.abi) &&
    typeof call.functionName === 'string'
  )
}

function getBundlerErrorCode(error: BundlerErrorCode) {
  const nested =
    error.data && typeof error.data === 'object' && 'code' in error.data
      ? error.data.code
      : undefined
  return [error.code, nested].find((code) =>
    bundlerErrors.some((error) => error.code === code),
  )
}

function normalizeRevertData(data: unknown) {
  const value =
    typeof data === 'string'
      ? data
      : data &&
          typeof data === 'object' &&
          'revertData' in data &&
          typeof data.revertData === 'string'
        ? data.revertData
        : data &&
            typeof data === 'object' &&
            'message' in data &&
            typeof data.message === 'string'
          ? data.message
          : undefined
  const match = value?.match(/(0x[A-Za-z0-9]*)/)
  if (match?.[1]) return { revertData: match[1] as Hex.Hex }
  return undefined
}
