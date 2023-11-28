import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import { BaseError } from '../../errors/base.js'
import {
  ExecutionRevertedError,
  type ExecutionRevertedErrorType,
  FeeCapTooHighError,
  type FeeCapTooHighErrorType,
  FeeCapTooLowError,
  type FeeCapTooLowErrorType,
  InsufficientFundsError,
  type InsufficientFundsErrorType,
  IntrinsicGasTooHighError,
  type IntrinsicGasTooHighErrorType,
  IntrinsicGasTooLowError,
  type IntrinsicGasTooLowErrorType,
  NonceMaxValueError,
  type NonceMaxValueErrorType,
  NonceTooHighError,
  type NonceTooHighErrorType,
  NonceTooLowError,
  type NonceTooLowErrorType,
  TipAboveFeeCapError,
  type TipAboveFeeCapErrorType,
  TransactionTypeNotSupportedError,
  type TransactionTypeNotSupportedErrorType,
  UnknownNodeError,
  type UnknownNodeErrorType,
} from '../../errors/node.js'
import { RpcRequestError } from '../../errors/request.js'
import {
  InvalidInputRpcError,
  TransactionRejectedRpcError,
} from '../../errors/rpc.js'

export function containsNodeError(err: BaseError) {
  return (
    err instanceof TransactionRejectedRpcError ||
    err instanceof InvalidInputRpcError ||
    (err instanceof RpcRequestError && err.code === ExecutionRevertedError.code)
  )
}

export type GetNodeErrorParameters = Partial<SendTransactionParameters<any>>

export type GetNodeErrorReturnType =
  | ExecutionRevertedErrorType
  | FeeCapTooHighErrorType
  | FeeCapTooLowErrorType
  | NonceTooHighErrorType
  | NonceTooLowErrorType
  | NonceMaxValueErrorType
  | InsufficientFundsErrorType
  | IntrinsicGasTooHighErrorType
  | IntrinsicGasTooLowErrorType
  | TransactionTypeNotSupportedErrorType
  | TipAboveFeeCapErrorType
  | UnknownNodeErrorType

export function getNodeError(
  err: BaseError,
  args: GetNodeErrorParameters,
): GetNodeErrorReturnType {
  const message = (err.details || '').toLowerCase()

  const executionRevertedError =
    err instanceof BaseError
      ? err.walk(
          (e) => (e as { code: number }).code === ExecutionRevertedError.code,
        )
      : err
  if (executionRevertedError instanceof BaseError) {
    return new ExecutionRevertedError({
      cause: err,
      message: executionRevertedError.details,
    }) as any
  }
  if (ExecutionRevertedError.nodeMessage.test(message))
    return new ExecutionRevertedError({
      cause: err,
      message: err.details,
    }) as any
  if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
    }) as any
  if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
    }) as any
  if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce }) as any
  if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce }) as any
  if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce }) as any
  if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: err }) as any
  if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas }) as any
  if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas }) as any
  if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: err }) as any
  if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas,
    }) as any
  return new UnknownNodeError({
    cause: err,
  }) as any
}
