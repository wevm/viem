import type { SendTransactionParameters } from '../../actions'
import type { BaseError } from '../../errors'
import {
  ExecutionRevertedError,
  FeeCapTooHighError,
  FeeCapTooLowError,
  InsufficientFundsError,
  IntrinsicGasTooHighError,
  IntrinsicGasTooLowError,
  InvalidInputRpcError,
  NonceMaxValueError,
  NonceTooHighError,
  NonceTooLowError,
  RpcError,
  TipAboveFeeCapError,
  TransactionRejectedRpcError,
  TransactionTypeNotSupportedError,
  UnknownNodeError,
} from '../../errors/index.js'

export function containsNodeError(err: BaseError) {
  return (
    err instanceof TransactionRejectedRpcError ||
    err instanceof InvalidInputRpcError ||
    (err instanceof RpcError && err.code === ExecutionRevertedError.code)
  )
}

export function getNodeError(
  err: BaseError,
  args: Partial<SendTransactionParameters<any>>,
) {
  const message = err.details.toLowerCase()
  if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
    })
  else if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
    })
  else if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce })
  else if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce })
  else if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce })
  else if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: err })
  else if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas })
  else if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas })
  else if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: err })
  else if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas,
    })
  else if (
    message.match(ExecutionRevertedError.nodeMessage) ||
    ('code' in (err.cause as BaseError) &&
      (err.cause as { code: number })?.code === ExecutionRevertedError.code)
  )
    return new ExecutionRevertedError({
      cause: err,
      message: (err.cause as BaseError).details,
    })
  return new UnknownNodeError({
    cause: (err.cause as BaseError).cause as BaseError,
  })
}
